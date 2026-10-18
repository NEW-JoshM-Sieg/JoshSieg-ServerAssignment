---
name: download-service-data
description: Download data from Gmail, GitHub, Notion or Linear through their official MCP servers and store it in dataExports/ following localStorageFormats.md. Use whenever the user asks to download, export, pull, fetch, save or back up emails, repositories, pages or issues to the local computer.
---

# Download service data into `dataExports/`

This skill makes every download follow the same storage format, no matter which conversation
it happens in. The format itself is defined in `localStorageFormats.md` at the repository root.
**Read that file first, every time.** If this skill and the spec ever disagree, the spec wins.

## Step 1. Understand the request

Work out, for each service the user mentioned (or all four if they said "each service" or
"everything"):

* **which items** to download (for example "emails from the last 7 days", "all repositories",
  "Notion pages that mention Holiday Blend", "Linear issues in progress"), and
* write that selection down in plain words. It becomes `source_query` and is stored with
  every item, so make it specific: `"Gmail messages in INBOX received after 2026-10-11"`
  is better than `"some emails"`.

If the user gave no limit, download every item the query matches, up to 25 per service,
and say so in the summary.

## Step 2. Check the MCP connections

GitHub, Notion and Linear are configured in `.mcp.json`. Gmail comes from Anthropic's Gmail
connector on the user's claude.ai account; Claude Code loads it automatically and its tools are
named `mcp__claude_ai_Gmail__…`. Confirm the needed servers are connected and authenticated.
If one is not, stop and tell the user exactly which one. For GitHub, Notion or Linear they
should run `/mcp` and choose **Authenticate**; for Gmail they should connect Gmail in claude.ai
under Settings → Connectors and restart Claude Code. Never fall back to a community server, a
web scrape or a made-up result; this project only uses vendor servers and Anthropic's own
Gmail connector.

| Service | Official server | Typical tools |
|---|---|---|
| Gmail | Anthropic's claude.ai Gmail connector | search threads/messages, get thread/message, list labels |
| GitHub | `https://api.githubcopilot.com/mcp/` | search/list repositories, get file contents (README), list issues, list commits |
| Notion | `https://mcp.notion.com/mcp` | search, fetch (page content and properties) |
| Linear | `https://mcp.linear.app/mcp` | list issues, get issue, list comments |

Tool names change between server versions. Look at the tools actually offered and pick the
closest ones; record the names you really called in `mcp_tools_used`.

## Step 3. Fetch complete data for each item

A search result alone is not enough. For each matched item, fetch the full record so the
metadata fields in the spec can be filled:

* **Gmail:** full message: all headers (From, To, Cc, Reply-To, Date, Subject), labels,
  snippet, plain-text body, HTML body if present, attachment names, sizes and types.
* **GitHub:** repository details, the README (if any), issues and pull requests
  (all states), and up to 20 recent commits on the default branch.
* **Notion:** page properties, parent, timestamps, authors, and the full page body. Convert
  the body to Markdown as described in spec section 6.
* **Linear:** issue details including team, project, state, priority, assignee, labels,
  due date, and all comments.

Never invent values. If the server does not provide a field, leave it out of your batch;
the helper fills it with `null` / `[]` / `{}` as the spec requires. Put any additional
fields the server returns that the spec does not name into `"extra"`.

## Step 4. Write the batch file

For each service, build one batch JSON file in `.export-staging/` (git-ignored), named
`<service>-batch.json`:

```json
{
  "service": "linear",
  "source_query": "All Linear issues in team RIV, any state",
  "run_started_at": "<UTC time you started this service's download>",
  "mcp_tools_used": ["list_issues", "get_issue", "list_comments"],
  "notes": null,
  "items": [
    {
      "metadata": {
        "issue_id": "…", "identifier": "RIV-7", "title": "Set up checkout on storefront",
        "url": "…", "team": {"name": "Riverstone", "key": "RIV"}, "project": "Storefront Launch",
        "state": {"name": "In Progress", "type": "started"}, "priority": 2,
        "assignee": {"name": "Marcus Lee", "email": null}, "labels": ["storefront"],
        "created_at": "…", "updated_at": "…"
      },
      "files": {
        "description.md": "# RIV-7 Set up checkout on storefront\n\n…",
        "comments.json": [{"id": "…", "author": {"name": "Dana Whitfield", "email": null}, "body": "…", "created_at": "…"}]
      }
    }
  ]
}
```

Field names and file names must be exactly those in `localStorageFormats.md`:

| Service | Files per item |
|---|---|
| gmail | `body.txt` (required), `body.html` (only if HTML exists) |
| github | `README.md` (only if it exists), `issues.json`, `commits.json` |
| notion | `content.md` |
| linear | `description.md`, `comments.json` |

JSON content files (`issues.json`, `commits.json`, `comments.json`) are given as arrays,
not strings. People are always `{ "name", "email" }` objects. Timestamps may be in any
parseable form; the helper converts them to ISO 8601 UTC.

Large exports can be split into several batch files per service; give them the same
`run_started_at` only if they are truly one run.

## Step 5. Save with the helper (do not hand-write item folders)

```
node .claude/skills/download-service-data/scripts/export_helper.js .export-staging/<service>-batch.json
```

The helper applies every naming rule (slugs, short IDs, UTC timestamps, Windows-safe names),
adds the `_export` block, keeps `first_exported_at` when an item is downloaded again,
replaces the old copy in the same folder, and appends the run to `_exportLog.json`.

## Step 6. Validate

```
node .claude/skills/download-service-data/scripts/validate_exports.js
```

Fix every error it reports (usually by correcting the batch and re-running the helper)
until it prints `OK`. Warnings about genuinely empty content (for example an email with
no body) are acceptable; mention them in the summary.

Then delete the files in `.export-staging/`.

## Step 7. Report back

Give the user a short summary per service: the `source_query`, how many items were new and
how many were updated, the folder names created, and anything that could not be downloaded
and why. Do not paste file contents back into the conversation.

## Rules

* Official MCP servers only.
* Never write tokens, passwords or OAuth secrets into any file; the repository is public.
* Never edit or delete earlier entries in `_exportLog.json`.
* Never delete existing item folders unless the user explicitly asks.
* Never change the format on your own. If the user wants a different format, update
  `localStorageFormats.md` first (and bump `schema_version`), then `scripts/common.js`,
  then this skill.
