# HomeSchoolFTS

Static website for homeschoolfts.com.

## Planner storefront

Smart Living contains a three-edition planner selector. Each printable costs $2.00 USD. Covers, descriptions, prices, and edition-specific checkout URLs are configured in `assets/js/planner-products.json`.

### Checkout setup still required

The site had no existing checkout or download fulfillment service. `checkoutUrl` remains null for each edition until its Stripe Payment Link is supplied. The selector works, but the purchase link stays disabled. Do not launch sales until checkout and delivery are verified.

Create one $2.00 USD one-time Stripe product/payment link per edition and add the matching URL to the catalog. Configure delivery of the correct PDF after verified payment through a fulfillment service or server-side Stripe integration. A static success page is not payment verification. Never put secret keys in this repository.

| Edition | PDF |
| --- | --- |
| Original Weekly Planner | `assets/downloads/planners/weekly-original.pdf` |
| Two Child Edition, Homeschool Mom cover | `assets/downloads/planners/two-child-homeschool-mom.pdf` |
| Two Child Edition, Plans • Goals • Growth cover | `assets/downloads/planners/two-child-plans-goals-growth.pdf` |

The PDFs are unchanged copies of the supplied files. This is a public repository and these static assets are publicly accessible; they are not protected by Stripe payment. For paid-only access, move the PDFs to private fulfillment storage before launch. The storefront exposes cover previews only and does not present free PDF download links.

## Local checks

- `python3 -m http.server 8765` to preview locally.
- `python3 -m unittest discover -s tests -v`
- `node --test tests/test_planners.cjs`

The JavaScript tests use fake checkout URLs only in memory and never transact with Stripe. Check the selector at desktop and mobile widths and verify every actual Stripe checkout and its delivered PDF before merging the sales launch.
