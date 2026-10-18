# JoshSieg-ServerAssignment

**Connecting Claude Code to Gmail, GitHub, Notion and Linear with official MCP servers,
keeping documented local copies of the data, and searching all of it from one dashboard.**

Author: Josh Sieg (solo project), for Prof. Rosenthal's course, Homework 3: *Working With Third Party Services*.

> Demo video: [`presentation/demo.mp4`](presentation/demo.mp4) · Slides: [`presentation/JoshSieg-ServerAssignment.pptx`](presentation/JoshSieg-ServerAssignment.pptx)

---

## What this project is

Much of the information a small team relies on is spread across separate cloud services:
conversations in email, code in GitHub, plans in Notion, tasks in Linear. This project shows
how an AI coding assistant, [Claude Code](https://claude.com/claude-code), can reach into
each of those services through the **Model Context Protocol (MCP)**, the open standard that
lets an AI assistant use an outside service's tools, and bring the data home in a
consistent, documented form.

It has three parts:

1. **Connections.** Claude Code is connected to four services, each through the MCP server
   published by the service's own vendor (not community-built servers).
2. **Local exports.** Claude Code downloads items from every service into `dataExports/`,
   following one written specification, `localStorageFormats.md`. A project-level Claude Code
   *skill* makes that process repeatable: in any new conversation, a request like
   "download my latest Linear issues" produces files in exactly the same format.
3. **Dashboard.** A small local website searches all the downloaded data at once, or one
   service at a time, and labels every result with the service it came from.

All accounts used here are new test accounts created only for this assignment, filled with
realistic data about a fictional business, **Riverstone Coffee Roasters**: a small coffee
roaster preparing an online storefront and a seasonal *Holiday Blend*. Recurring people
and projects (for example *Dana Whitfield*, the operations manager, and the *Holiday Blend*
launch) appear in several services, so a single dashboard search shows how the services
relate.

## Services and official MCP servers

| Service | What was downloaded | Official MCP server | Published by |
|---|---|---|---|
| Gmail | Received emails with headers, labels and bodies | Anthropic's Gmail connector (claude.ai → Claude Code)* | Anthropic |
| GitHub | Repositories with README, issues and recent commits | `https://api.githubcopilot.com/mcp/` ([github/github-mcp-server](https://github.com/github/github-mcp-server)) | GitHub |
| Notion | Pages and database entries as Markdown | `https://mcp.notion.com/mcp` | Notion |
| Linear *(additional service)* | Issues with state, priority, labels and comments | `https://mcp.linear.app/mcp` | Linear |

\* Google's own Gmail MCP server (`https://gmailmcp.googleapis.com/mcp/v1`) is limited to
paid Google Workspace accounts in its Developer Preview; personal Gmail accounts are rejected.
As Prof. Rosenthal advised, Gmail is connected through Anthropic's own Gmail connector instead.
It is attached to the claude.ai account and loaded by Claude Code automatically, so it is not
listed in `.mcp.json`.

Because this is a one-person project, Josh Sieg completed every part, including the
additional service (Linear).

## Repository layout

```
.
├── README.md                     ← you are here
├── localStorageFormats.md        ← specification of how exported data is stored
├── CLAUDE.md                     ← standing instructions Claude Code reads in this repo
├── .mcp.json                     ← MCP server configuration (no secrets)
├── .claude/
│   └── skills/download-service-data/
│       ├── SKILL.md              ← the download skill
│       └── scripts/
│           ├── common.js         ← naming and schema rules from the spec
│           ├── export_helper.js  ← writes items exactly as the spec requires
│           └── validate_exports.js ← checks every export against the spec
├── dataExports/                  ← the downloaded data
│   ├── gmail/   github/   notion/   linear/
├── dashboard/                    ← the local search website (see dashboard/README.md)
├── docs/                         ← setup guide, test data plan, presentation notes
└── presentation/                 ← slides and demo video
```

## How the data is stored

The full specification is in [`localStorageFormats.md`](localStorageFormats.md). In short:

* Every item gets **its own folder**, with structured metadata in `metadata.json` and readable
  content beside it (`body.txt` for emails, `README.md` plus `issues.json` and `commits.json`
  for repositories, `content.md` for Notion pages, `description.md` plus `comments.json` for
  Linear issues).
* Folder names are **readable and unique**, built from the item's permanent ID, for example
  `2026-10-17_13-02-11_dana-whitfield-at-gmail-dot-com_a1b2c3d4` for an email or
  `RIV-7_set-up-checkout-on-storefront` for a Linear issue. Re-downloading an item updates the
  same folder instead of creating a duplicate.
* Every `metadata.json` records **when, why and how** it was exported (an `_export` block with
  the request, the MCP server and the tools used), and every service folder has an
  `_exportLog.json` listing each export run.
* A validator script confirms that all of the data follows the specification.

## Reproducing the project

The step-by-step guide, written for Windows, is [`docs/SETUP_GUIDE_WINDOWS.md`](docs/SETUP_GUIDE_WINDOWS.md).
The summary:

1. Create test accounts for each service and fill them with data
   ([`docs/TEST_DATA_PLAN.md`](docs/TEST_DATA_PLAN.md)).
2. Provide credentials **outside the repository**: a GitHub personal access token in the
   `GITHUB_PAT` environment variable. Notion and Linear sign in through the browser, and
   Gmail is connected in claude.ai under Settings → Connectors.
3. Open Claude Code in this folder, approve the project's MCP servers, and run `/mcp` to
   authenticate each one.
4. Ask Claude Code to download data, for example:
   *"Download every Linear issue and all Notion pages that mention Holiday Blend."*
   The `download-service-data` skill handles the format and runs the validator.
5. Start the dashboard:

   ```
   node dashboard/server.js
   ```

   and open http://localhost:3000. Details are in [`dashboard/README.md`](dashboard/README.md).

To check the stored data at any time:

```
node .claude/skills/download-service-data/scripts/validate_exports.js
```

## Security

* No passwords, API keys, tokens or OAuth secrets are stored in this repository.
  `.mcp.json` refers to the GitHub token only as `${GITHUB_PAT}`, which Claude Code reads from
  the environment. Notion, Linear and Gmail use browser sign-in (OAuth), so no secret for them
  exists in any file.
  `.gitignore` blocks common secret files as an extra safeguard.
* The Gmail connector can read and draft but cannot send email.
* The dashboard listens only on `127.0.0.1` and escapes all downloaded text before displaying
  it.
* Every account belongs to a throwaway test identity; no personal, school or work data appears
  anywhere in this repository.

## How the work followed the assignment

| Assignment step | Where to see it |
|---|---|
| Test accounts with at least 10 natural items per service, created in a separate Claude Code conversation | `docs/TEST_DATA_PLAN.md`, slides |
| Download at least 5 items per service into `dataExports/<service>/` with metadata | `dataExports/` |
| Document the storage format | `localStorageFormats.md` |
| Project-level skill for repeatable downloads | `.claude/skills/download-service-data/` |
| Second download in a fresh conversation, using the skill | Second run entry in each `_exportLog.json` |
| Dashboard searching one or all services, labelled by source | `dashboard/` |
| Slides with original-versus-dashboard screenshots for every service, and a demo video | `presentation/` |
