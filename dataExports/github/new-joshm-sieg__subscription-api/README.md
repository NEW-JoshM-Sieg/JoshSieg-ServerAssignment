# subscription-api

An early-stage backend for **Riverstone Coffee Roasters** coffee subscriptions: a bag every 2 or 4 weeks, delivered by the storefront. This is not part of the Nov 10 storefront launch. The target is early 2027.

## Status

Sketch only. The endpoints return in-memory data so Marcus Lee can wire the storefront UI against them.

## How to run

```bash
pip install fastapi uvicorn
uvicorn app:app --reload
```

Then open http://localhost:8000/docs.

## Planned endpoints

- `GET /plans`: available plans (house espresso, rotating single origin, seasonal like the Holiday Blend)
- `POST /subscriptions`: start a subscription
- `POST /subscriptions/{id}/skip`: skip the next delivery

## Who is involved

- **Marcus Lee**: backend and storefront integration
- **Dana Whitfield**: fulfillment process and roast scheduling
