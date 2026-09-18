(() => {
  const select = document.getElementById('planner-version');
  const cover = document.getElementById('planner-cover');
  const description = document.getElementById('planner-description');
  const price = document.getElementById('planner-price');
  const buy = document.getElementById('planner-buy');
  const status = document.getElementById('planner-status');

  // Hosted checkout must handle payment and delivery of the matching PDF.
  // Never treat a visit to a success page as proof of payment.
  const checkoutUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
    } catch {
      return null;
    }
  };

  fetch('/assets/js/planner-products.json')
    .then((response) => {
      if (!response.ok) throw new Error('Planner catalog unavailable');
      return response.json();
    })
    .then((products) => {
      if (!Array.isArray(products) || !Array.from(select.options).every((option) =>
        products.some((product) => product.id === option.value && product.name && product.cover && product.description)
      )) throw new Error('Incomplete planner catalog');

      const render = () => {
        const product = products.find((item) => item.id === select.value);
        cover.src = product.cover;
        cover.alt = `${product.name} cover preview`;
        description.textContent = product.description;
        const url = checkoutUrl(product.checkoutUrl);
        const ready = url && typeof product.price === 'string' && product.price.trim();
        price.textContent = product.price || 'Pricing coming soon';
        buy.textContent = ready ? 'Buy selected planner' : 'Checkout coming soon';
        buy.setAttribute('aria-label', ready ? `Buy ${product.name}, ${product.price}` : `Checkout coming soon for ${product.name}`);
        buy.setAttribute('aria-disabled', ready ? 'false' : 'true');
        if (ready) buy.href = url;
        else buy.removeAttribute('href');
        status.textContent = ready
          ? 'Continue to checkout for your selected edition.'
          : 'Online purchasing is not available yet.';
      };
      select.addEventListener('change', render);
      select.disabled = false;
      render();
    })
    .catch(() => {
      status.textContent = 'Planner options could not be loaded. Please refresh the page or email Bria for help.';
    });
})();
