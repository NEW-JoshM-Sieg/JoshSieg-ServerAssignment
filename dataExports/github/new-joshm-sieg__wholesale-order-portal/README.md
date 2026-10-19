# wholesale-order-portal

An ordering portal for Riverstone Coffee Roasters' wholesale customers (cafes and restaurants). Accounts log in, place their every-two-weeks standing order and see their pricing tier.

## Pricing tiers

These match Wholesale Pricing 2026 in Notion and are configured in `config/tiers.json`.

| Tier | Volume every 2 weeks | House espresso |
|---|---|---|
| 1 | 5-19 lb | $11.50/lb |
| 2 | 20-39 lb | $10.50/lb |
| 3 | 40+ lb | $9.75/lb |

## How to run

```bash
npm install
npm start
```

## Customers

- **Corner Table Cafe** (Elena Ortiz): currently 10 lb/2 weeks, moving to 20 lb (tier 2) in November

## Who is involved

- **Marcus Lee**: development (after the storefront launch)
- **Dana Whitfield**: manages accounts and confirms tier changes
