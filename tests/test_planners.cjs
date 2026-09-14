const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'assets/js/planner-products.json')));
const source = fs.readFileSync(path.join(root, 'assets/js/planners.js'), 'utf8');
async function mount(products, failed = false) {
  const elements = Object.fromEntries(['planner-version', 'planner-cover', 'planner-description', 'planner-price', 'planner-buy', 'planner-status'].map(id => [id, {
    value: catalog[0].id, options: catalog.map(p => ({value:p.id})), disabled:true,
    attrs:{}, setAttribute(k,v){this.attrs[k]=v;}, removeAttribute(k){delete this.attrs[k]; delete this[k];},
    addEventListener(k,fn){this[k]=fn;}
  }]));
  vm.runInNewContext(source, {URL, document:{getElementById:id=>elements[id]},fetch:async()=>({ok:!failed,json:async()=>products})});
  await new Promise(resolve=>setImmediate(resolve));
  return elements;
}
test('each edition has a real cover, PDF, and approved price',()=>{
  assert.equal(catalog.length,3);
  for(const p of catalog){
    assert.equal(p.price,'$2.00 USD');
    assert.ok(fs.existsSync(path.join(root,p.cover)));
    assert.equal(fs.readFileSync(path.join(root,'assets/downloads/planners',p.id+'.pdf')).subarray(0,5).toString(),'%PDF-');
  }
});
test('selection changes checkout destination and clears it for unavailable editions',async()=>{
  const products=catalog.map((p,i)=>({...p,checkoutUrl:i<2?`https://buy.stripe.com/test_fixture_${i}`:null}));
  const e=await mount(products);
  for(const product of products){
    e['planner-version'].value=product.id;e['planner-version'].change();
    assert.equal(e['planner-cover'].src,product.cover);
    assert.equal(e['planner-description'].textContent,product.description);
    assert.equal(e['planner-buy'].href,product.checkoutUrl||undefined);
    assert.equal(e['planner-buy'].attrs['aria-disabled'],product.checkoutUrl?'false':'true');
  }
});
test('unsafe checkout URLs cannot become purchase links',async()=>{
  for(const url of ['javascript:alert(1)','http://example.com','https://user:pass@example.com']){
    const e=await mount(catalog.map(p=>({...p,checkoutUrl:url})));
    assert.equal(e['planner-buy'].href,undefined);
  }
});
test('failed catalog keeps selection disabled and explains recovery',async()=>{
  const e=await mount([],true);
  assert.equal(e['planner-version'].disabled,true);
  assert.match(e['planner-status'].textContent,/refresh/);
});
