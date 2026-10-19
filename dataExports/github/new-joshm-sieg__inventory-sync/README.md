# inventory-sync

A script that keeps Riverstone Coffee Roasters' green coffee inventory up to date. It reads shipment manifests from our importers, mainly **Highland Imports** (contact: Tom Becker), and adds them to `inventory.csv`. It also flags any origin that drops below its reorder point.

## How to run

```bash
python sync.py shipments/highland-2026-10-28.json
```

## Current shipments

- **Highland Imports, ships Oct 28 / arrives Nov 3**: 6 bags Ethiopia Yirgacheffe (Grade 1, washed), 4 bags Colombia Huila. These are for the Holiday Blend.

## Who is involved

- **Dana Whitfield** (operations manager): runs the sync when shipments arrive and approves invoices
- **Tom Becker** (Highland Imports): sends the shipment manifests
- Supplier details are in the Green Coffee Supplier Directory in Notion
