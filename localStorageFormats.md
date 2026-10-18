# Local Storage Formats

**Schema version:** `1.0`
**Applies to:** everything under `dataExports/`
**Enforced by:** the project skill `.claude/skills/download-service-data/` and its validator script

This document is the specification for how data downloaded from cloud services through
their official MCP servers is stored on the local computer. It is written so that a person
(or a program, such as the dashboard in `dashboard/`) can read any exported item without
having seen the export happen.

---

## 1. Design goals

1. **One item, one folder.** Every downloaded item (an email, a repository, a page, an issue)
   gets its own folder. The item's machine-readable metadata and its human-readable content
   live side by side, so an item can be copied, inspected or deleted as a unit.
2. **Separate metadata from content.** Metadata is structured JSON (`metadata.json`), which is
   easy for software to read. Content is plain text or Markdown, which is easy for people to
   read and diff on GitHub.
3. **Distinguishable and deterministic names.** A folder name always identifies the item at a
   glance *and* contains part of the item's permanent ID from the service. Downloading the same
   item twice produces the same folder name, so re-downloads update an item instead of
   creating duplicates.
4. **Nothing lost.** Every field the MCP server returns that describes the item is kept.
   Fields we know about are mapped to the documented names below; anything extra is kept under
   `"extra"` rather than thrown away.
5. **Traceability.** Every item records when it was exported, by which request, and through
   which MCP server, and every export run is logged.
6. **Portable.** Names are safe on Windows, macOS and Linux.

---

## 2. Folder layout

```
dataExports/
├── gmail/
│   ├── _exportLog.json
│   └── 2026-10-18_14-05-22_dana-whitfield-at-gmail-dot-com_a1b2c3d4/
│       ├── metadata.json
│       ├── body.txt
│       └── body.html            (only when the email has an HTML part)
├── github/
│   ├── _exportLog.json
│   └── riverstone-dev__storefront-web/
│       ├── metadata.json
│       ├── README.md            (only when the repo has a README)
│       ├── issues.json
│       └── commits.json
├── notion/
│   ├── _exportLog.json
│   └── holiday-blend-launch-plan_1f2e3d4c/
│       ├── metadata.json
│       └── content.md
└── linear/
    ├── _exportLog.json
    └── RIV-7_set-up-checkout-on-storefront/
        ├── metadata.json
        ├── description.md
        └── comments.json
```

Service folder names are always lowercase: `gmail`, `github`, `notion`, `linear`.

---

## 3. Rules shared by every service

### 3.1 Slugs

Several folder names contain a *slug*, a filesystem-safe version of human text.
To make a slug:

1. Lowercase the text.
2. Replace `@` with `-at-` and `.` with `-dot-` **(email addresses only)**.
3. Replace every run of characters other than `a-z` and `0-9` with a single `-`.
4. Trim `-` from both ends.
5. Cut to at most **50 characters**, then trim a trailing `-` again.
6. If the result is empty, use `untitled`.

Example: `Holiday Blend: Launch Plan (v2)` → `holiday-blend-launch-plan-v2`
Example: `Dana.Whitfield@gmail.com` → `dana-dot-whitfield-at-gmail-dot-com`

### 3.2 Short IDs

Where a folder name needs a *short ID*, use the **last 8 characters** of the service's
permanent ID for Gmail, and the **first 8 hexadecimal characters with dashes removed** for
Notion. Short IDs make names unique even when two items have the same title.

### 3.3 Dates and times

* All machine timestamps in JSON are **ISO 8601 in UTC** with a `Z` suffix,
  e.g. `2026-10-18T18:05:22Z`.
* Timestamps inside folder names use UTC in the form `YYYY-MM-DD_HH-mm-ss`
  (colons are not allowed in Windows file names).
* When a service gives an original header string (such as an email `Date:` header), it is kept
  verbatim as well, in a field ending in `_raw`.

### 3.4 JSON conventions

* UTF-8, 2-space indentation, `\n` line endings.
* Field names are `snake_case`.
* A field that the service did not provide is written as `null` (or `[]` for lists). It is
  **never** silently left out, so every `metadata.json` for a service has the same shape.
* People are always objects: `{ "name": "Dana Whitfield", "email": "dana.whitfield@gmail.com" }`.
  Either property may be `null`.

### 3.5 The `_export` block (required in every `metadata.json`)

```json
"_export": {
  "schema_version": "1.0",
  "service": "gmail",
  "source_id": "18f3a9c2a1b2c3d4",
  "first_exported_at": "2026-10-18T18:30:00Z",
  "exported_at": "2026-10-18T19:10:41Z",
  "export_run_id": "2026-10-18_19-10-30_gmail",
  "source_query": "emails received in the last 7 days",
  "mcp_server": "claude.ai Gmail connector (Anthropic)",
  "mcp_tools_used": ["search_threads", "get_thread"]
}
```

| Field | Meaning |
|---|---|
| `schema_version` | Version of this document the item follows. |
| `service` | One of `gmail`, `github`, `notion`, `linear`. |
| `source_id` | The item's permanent ID in the service. |
| `first_exported_at` | When this item was downloaded for the very first time. Preserved on re-download. |
| `exported_at` | When this copy was written. Updated on every re-download. |
| `export_run_id` | Ties the item to an entry in `_exportLog.json`. Format: `YYYY-MM-DD_HH-mm-ss_<service>` (UTC, start of run). |
| `source_query` | The request, in plain words, that selected this item. |
| `mcp_server` | URL of the official MCP server used. |
| `mcp_tools_used` | Names of the MCP tools called to fetch this item. |

### 3.6 Re-downloads and duplicates

Because folder names are derived from permanent IDs, a re-download of an existing item
writes into the **same folder**: its files are replaced with the fresh copy, `exported_at`
and `export_run_id` are updated, and `first_exported_at` is kept from the old copy.
Items are never deleted locally just because they were not part of a later run.

### 3.7 The export log (`_exportLog.json`)

Each service folder has one `_exportLog.json` holding a JSON array. Every export run appends
one entry and never edits earlier ones:

```json
[
  {
    "export_run_id": "2026-10-18_19-10-30_gmail",
    "started_at": "2026-10-18T19:10:30Z",
    "finished_at": "2026-10-18T19:11:02Z",
    "source_query": "emails received in the last 7 days",
    "mcp_server": "claude.ai Gmail connector (Anthropic)",
    "items_new": ["2026-10-17_13-02-11_dana-whitfield-at-gmail-dot-com_a1b2c3d4"],
    "items_updated": [],
    "item_count": 1,
    "notes": null
  }
]
```

Folders whose names begin with `_` are reserved for files like this and are never items.

---

## 4. Gmail (`dataExports/gmail/`)

**MCP server:** Anthropic's Gmail connector, enabled in claude.ai (Settings → Connectors) and
picked up automatically by Claude Code, where its tools appear as `mcp__claude_ai_Gmail__*`.
It can search and read threads, list and create drafts, and manage labels; it cannot send.
Google's own Gmail MCP server (`https://gmailmcp.googleapis.com/mcp/v1`) only accepts paid
Google Workspace accounts enrolled in its Developer Preview, which personal test Gmail
accounts are not eligible for; Prof. Rosenthal approved Anthropic's connector as the
alternative. Because the connector belongs to the claude.ai account rather than the project,
it does not appear in `.mcp.json`.

**Item:** one email message.

**Folder name:** `<received-UTC>_<sender-slug>_<short-id>`
e.g. `2026-10-17_13-02-11_dana-whitfield-at-gmail-dot-com_a1b2c3d4`
Sorting the folder alphabetically sorts emails by time received.

**Files**

| File | Required | Contents |
|---|---|---|
| `metadata.json` | yes | Everything below. |
| `body.txt` | yes | The plain-text body. If the email only has HTML, the HTML converted to readable text. |
| `body.html` | no | The original HTML body, exactly as received, when one exists. |

**`metadata.json` fields**

| Field | Type | Notes |
|---|---|---|
| `message_id` | string | Gmail message ID. |
| `thread_id` | string | Gmail thread ID. |
| `subject` | string | `null` if empty. |
| `from` | person | Sender. |
| `to` | person[] | |
| `cc` | person[] | |
| `bcc` | person[] | Usually empty for received mail. |
| `reply_to` | person[] | |
| `date_raw` | string | The original `Date:` header. |
| `received_at` | timestamp | UTC. |
| `labels` | string[] | e.g. `INBOX`, `UNREAD`, `IMPORTANT`, user labels by name. |
| `snippet` | string | Gmail's short preview. |
| `is_unread` | boolean | Derived from the `UNREAD` label. |
| `has_attachments` | boolean | |
| `attachments` | object[] | `{ "filename", "mime_type", "size_bytes" }`. Attachment files themselves are not downloaded, because the official server does not return their bytes; this is noted here so the absence is intentional. |
| `size_estimate_bytes` | number | |
| `web_url` | string | `https://mail.google.com/mail/u/0/#all/<thread_id>` |
| `extra` | object | Any other fields the server returned. |
| `_export` | object | See 3.5. |

---

## 5. GitHub (`dataExports/github/`)

**MCP server:** GitHub's official remote MCP server, `https://api.githubcopilot.com/mcp/`
(source: github/github-mcp-server).

**Item:** one repository, together with its README, issues and recent commits.

**Folder name:** `<owner>__<repo>` (two underscores separate the owner from the repository,
because both may contain single dashes), lowercased, e.g. `riverstone-dev__storefront-web`.

**Files**

| File | Required | Contents |
|---|---|---|
| `metadata.json` | yes | Repository metadata, below. |
| `README.md` | no | The repository's README, verbatim, when one exists. |
| `issues.json` | yes | Array of issues and pull requests (may be `[]`). |
| `commits.json` | yes | Array of up to the 20 most recent commits on the default branch (may be `[]`). |

**`metadata.json` fields**

| Field | Type | Notes |
|---|---|---|
| `repo_id` | number | GitHub's numeric repository ID. |
| `name` | string | |
| `full_name` | string | `owner/name` |
| `owner` | object | `{ "login", "type" }` |
| `description` | string | |
| `html_url` | string | |
| `visibility` | string | `public` or `private`. |
| `default_branch` | string | |
| `primary_language` | string | |
| `topics` | string[] | |
| `license` | string | SPDX ID, e.g. `MIT`. |
| `homepage` | string | |
| `stargazers_count`, `watchers_count`, `forks_count`, `open_issues_count` | number | |
| `is_fork`, `is_archived` | boolean | |
| `readme_present` | boolean | Whether `README.md` was written. |
| `created_at`, `updated_at`, `pushed_at` | timestamp | |
| `extra` | object | |
| `_export` | object | `source_id` is the `full_name`. |

**`issues.json` element:** `{ "number", "title", "state", "is_pull_request", "author", "labels", "assignees", "body", "comments_count", "created_at", "updated_at", "closed_at", "html_url" }`

**`commits.json` element:** `{ "sha", "message", "author", "authored_at", "html_url" }`

---

## 6. Notion (`dataExports/notion/`)

**MCP server:** Notion's official hosted MCP server, `https://mcp.notion.com/mcp`.

**Item:** one page. A row of a Notion database is also a page and is stored the same way,
with its column values in `properties` and its database recorded in `parent`.

**Folder name:** `<title-slug>_<short-id>`, e.g. `holiday-blend-launch-plan_1f2e3d4c`.

**Files**

| File | Required | Contents |
|---|---|---|
| `metadata.json` | yes | Page metadata, below. |
| `content.md` | yes | The page body converted to Markdown, starting with `# <title>`. Headings, lists, to-dos (`- [ ]` / `- [x]`), tables, quotes, code blocks and links are preserved. Child pages appear as a line `[child page] <title>`. |

**`metadata.json` fields**

| Field | Type | Notes |
|---|---|---|
| `page_id` | string | Full Notion ID with dashes. |
| `title` | string | |
| `url` | string | |
| `object_type` | string | `page` or `database_row`. |
| `parent` | object | `{ "type": "workspace" \| "page" \| "database", "id", "title" }` |
| `icon` | string | Emoji or icon URL. |
| `created_time`, `last_edited_time` | timestamp | |
| `created_by`, `last_edited_by` | person | |
| `properties` | object | Property name → plain value (text, number, date, select name, list of multi-select names, checkbox). Empty `{}` for ordinary pages. |
| `child_pages` | object[] | `{ "id", "title" }` for direct child pages. |
| `extra` | object | |
| `_export` | object | |

---

## 7. Linear (`dataExports/linear/`)

**MCP server:** Linear's official hosted MCP server, `https://mcp.linear.app/mcp`.

**Item:** one issue.

**Folder name:** `<identifier>_<title-slug>`, e.g. `RIV-7_set-up-checkout-on-storefront`.
The identifier (team key + number) is already unique and is kept in its original case.

**Files**

| File | Required | Contents |
|---|---|---|
| `metadata.json` | yes | Issue metadata, below. |
| `description.md` | yes | The issue description in Markdown, starting with `# <identifier> <title>`. |
| `comments.json` | yes | Array of `{ "id", "author", "body", "created_at" }` (may be `[]`). |

**`metadata.json` fields**

| Field | Type | Notes |
|---|---|---|
| `issue_id` | string | Linear's UUID. |
| `identifier` | string | e.g. `RIV-7`. |
| `title` | string | |
| `url` | string | |
| `team` | object | `{ "name", "key" }` |
| `project` | string | Project name or `null`. |
| `state` | object | `{ "name", "type" }`, type is one of `backlog`, `unstarted`, `started`, `completed`, `canceled`. |
| `priority` | number | 0 none, 1 urgent, 2 high, 3 medium, 4 low. |
| `priority_label` | string | The word for the number. |
| `assignee`, `creator` | person | |
| `labels` | string[] | |
| `estimate` | number | |
| `due_date` | string | `YYYY-MM-DD` or `null`. |
| `cycle` | string | Cycle name or number. |
| `parent_identifier` | string | Parent issue, if a sub-issue. |
| `created_at`, `updated_at`, `completed_at` | timestamp | |
| `extra` | object | |
| `_export` | object | |

---

## 8. How the dashboard reads this data

The dashboard (`dashboard/server.js`) walks `dataExports/<service>/`, treats every folder not
starting with `_` as one item, reads `metadata.json`, and searches the metadata plus the
content files (`body.txt`, `README.md`, `issues.json`, `commits.json`, `content.md`,
`description.md`, `comments.json`). Because every item of a service has the same shape, the
dashboard needs no per-item special cases.

## 9. Validation

`node .claude/skills/download-service-data/scripts/validate_exports.js` checks every item
against this document: folder name pattern, required files, required metadata fields,
the `_export` block, UTC timestamp format, and that each service has an `_exportLog.json`
whose run IDs match its items. Every export must finish with zero errors.

## 10. Changing this format

Change this document first, bump `schema_version`, then update the skill and the validator
to match. Older items keep their old `schema_version` so a reader can tell them apart.
