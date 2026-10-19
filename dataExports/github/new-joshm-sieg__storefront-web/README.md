# storefront-web

The online store for **Riverstone Coffee Roasters**, a small specialty roaster in the Hudson Valley. Launch date: **November 10**.

## What it does

- Product catalog: house espresso, single origins and the limited **Holiday Blend** (Ethiopia Yirgacheffe + Colombia Huila)
- Grind options per product (whole bean, drip, espresso), each a priced variant
- Cart and checkout (still open: local pickup at the roastery vs shipping only)
- Brew guides pulled in from the `brew-guides` repo
- Shipping estimates from `shipping-rate-calculator`

## How to run

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Product data lives in `src/data/products.json`.

## Who is involved

- **Marcus Lee**: freelance web developer, builds and maintains the store
- **Dana Whitfield**: operations manager, runs test purchases and reports bugs
- **Priya Raman**: designer, product photos and label art (Holiday Blend page)
- **Owner**: final decisions on checkout and pricing

Launch tasks are tracked in Linear (project "Storefront Launch") and the Storefront Launch Checklist in Notion.
