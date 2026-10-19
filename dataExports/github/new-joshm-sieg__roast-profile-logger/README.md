# roast-profile-logger

A small Python tool for logging roast curves at **Riverstone Coffee Roasters**. Each roast is saved as a CSV of time / bean temperature readings plus a JSON summary (development time, total time, first crack), so we can compare profiles side by side.

## Why it exists

We are dialing in the limited **Holiday Blend** (Ethiopia Yirgacheffe + Colombia Huila). During the October roast tests we compared three profiles:

| Profile | Style | Total time | Notes |
|---|---|---|---|
| A | Light | 10:45 | Bright, a bit thin on the Huila side |
| **B** | **Light-medium** | **11:30** | **Clear favorite: berry from the Yirgacheffe, caramel body from the Huila** |
| C | Medium | 12:15 | Lost most of the floral notes |

Profile B is now the production profile for the Holiday Blend. Its log lives in `profiles/holiday-blend-b.json`.

## How to run

```bash
python -m venv .venv
source .venv/bin/activate
python logger.py --roast "Holiday Blend B" --batch-kg 5
```

Type a bean temperature reading at each prompt (every 30 seconds), `fc` to mark first crack, and `q` to drop the batch. The log is written to `logs/`.

## Who is involved

- **Owner / head roaster**: runs the roasts and keeps the logs.
- **Dana Whitfield** (operations manager): reviews the summaries in the weekly ops meeting.
- **Tom Becker** (Highland Imports): supplies the green coffee; we share moisture readings with him.
