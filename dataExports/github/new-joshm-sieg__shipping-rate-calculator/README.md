# shipping-rate-calculator

Estimates shipping costs for Riverstone Coffee Roasters orders by bag size (**12 oz** and **2 lb**) and destination zone. The storefront uses it to show shipping at checkout.

## How to run

```bash
node calc.js 3x12oz 1x2lb zone4
```

This prints the package weight and the estimated cost.

## Assumptions

- 12 oz bag ships at 0.85 lb with packaging; 2 lb bag at 2.3 lb
- Zones 1-8 from the roastery in the Hudson Valley
- Free shipping over $50 (applied by the storefront, not here)

## Who is involved

- **Marcus Lee**: integrating it into storefront checkout
- **Dana Whitfield**: checks the rates against real carrier invoices every month
