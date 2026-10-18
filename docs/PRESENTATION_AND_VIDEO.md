# Presentation and demo video plan

## Screenshot checklist

Windows: **Win + Shift + S** to capture a region. Save them all into one folder with these
names so the slides can be built quickly. Before each capture, make sure no token, password,
client secret or personal email is visible.

**Original content (take after Conversation A)**

| File name | What to show |
|---|---|
| `gmail-original.png` | Test Gmail inbox showing several of Dana's emails |
| `gmail-original-email.png` | One email open, e.g. "Holiday Blend - green coffee confirmed" |
| `github-original.png` | The test account's repository list |
| `github-original-repo.png` | `storefront-web` with its README and the $0.00 issue |
| `notion-original.png` | Notion sidebar with the 10 pages |
| `notion-original-page.png` | "Holiday Blend Launch Plan" open |
| `linear-original.png` | Linear issue list for team Riverstone |
| `linear-original-issue.png` | "Decide local pickup vs shipping-only for checkout" open, with comment |

**Process (take during Parts 5–9)**

| File name | What to show |
|---|---|
| `mcp-connected.png` | `/mcp` in Claude Code with GitHub, Notion, Linear and the Gmail connector connected |
| `download-summary.png` | Claude Code's summary after the first export |
| `dataexports-folders.png` | File Explorer: `dataExports` with the four service folders, one opened |
| `metadata-example.png` | One `metadata.json` opened in Notepad/VS Code |
| `export-log.png` | An `_exportLog.json` showing two runs (proves the skill re-run) |
| `validator-ok.png` | Output of `validate_exports.js` ending in `OK` |

**Dashboard (take after Part 10), matching each original**

| File name | What to show |
|---|---|
| `dash-all-search.png` | Search `Dana Whitfield`, All services: results from all four services |
| `dash-gmail.png` | Gmail chip only, the same email as `gmail-original-email.png`, detail panel open |
| `dash-github.png` | GitHub chip only, `storefront-web` open with README and issues |
| `dash-notion.png` | Notion chip only, "Holiday Blend Launch Plan" open |
| `dash-linear.png` | Linear chip only, the pickup-vs-shipping issue open |

## Slide outline (about 14 slides)

1. **Title**: Connecting Claude Code to Third-Party Services, Josh Sieg, HW3
2. **The problem and the idea**: information scattered across four services; MCP lets Claude
   reach each one; a documented local copy plus one search page
3. **Test accounts and data**: Riverstone Coffee Roasters story, people, item counts per service
4. **Official MCP servers**: the four vendor servers and how each authenticates
   (`mcp-connected.png`)
5. **Keeping secrets out of a public repo**: `${GITHUB_PAT}`, OAuth secret in secure storage,
   `.gitignore`, read-only Gmail scopes
6. **Storage format**: one folder per item, `metadata.json` plus content, naming rules,
   `_export` block (`dataexports-folders.png`, `metadata-example.png`)
7. **The skill**: what `SKILL.md` instructs, helper and validator, second run proved
   repeatability (`export-log.png`, `validator-ok.png`)
8. **Dashboard overview**: cross-service search (`dash-all-search.png`)
9. **Gmail**: original vs dashboard side by side
10. **GitHub**: original vs dashboard
11. **Notion**: original vs dashboard
12. **Linear** (additional service): original vs dashboard
13. **What I learned / challenges**: e.g. Google's Gmail MCP server being limited to paid Workspace
    accounts (so Gmail uses Anthropic's connector), Gmail being read/draft-only, designing names that are both readable and unique
14. **Repository and how to run it**: repo URL, `node dashboard/server.js`

## Demo video script (target 2:45, limit 3:00)

Prepare beforehand: test Gmail logged out in a private browser window; PowerShell open in the
project folder; one new email from "Dana" sitting in the inbox that hasn't been downloaded yet;
the dashboard **not** running. Close everything personal (notifications, other tabs).
Record with **Win + Alt + R** (Xbox Game Bar) or Clipchamp's screen recorder.

| Time | On screen | Say (roughly) |
|---|---|---|
| 0:00–0:15 | Repo README on GitHub | "This project connects Claude Code to Gmail, GitHub, Notion and Linear through their official MCP servers, saves the data locally in a documented format, and searches it from a dashboard." |
| 0:15–0:40 | Private window: sign in to the test Gmail; open Dana's newest email | "Here's the test Gmail account. This email, about the holiday market booth, hasn't been downloaded yet." |
| 0:40–1:00 | Claude Code: `/mcp` | "All four official servers are connected." |
| 1:00–1:40 | Type: *"Download any new emails from my inbox since the last export."* Approve tool calls; let it run (trim waiting in editing) | "I don't mention the format. The project skill tells Claude exactly how to store it and runs a validator afterwards." |
| 1:40–2:00 | File Explorer: the new email folder, open `metadata.json` and `body.txt` | "Each email gets its own folder: metadata like sender, recipients, labels and time received in JSON, and the body as text." |
| 2:00–2:10 | PowerShell: `node dashboard/server.js`, open localhost:3000 | "Now the local dashboard." |
| 2:10–2:40 | Search `Dana Whitfield` (all services), then click the Gmail chip, open the new email; then search `"Holiday Blend"` | "One search returns emails, repositories, Notion pages and Linear issues, each labelled with its service. I can narrow to one service, and here's the email we just downloaded." |
| 2:40–2:50 | Back to README | "Everything, including the data, skill, MCP config and documentation, is in this public repository." |

If the download takes long, cut the waiting in Clipchamp rather than speeding through
narration. Export at 1080p or 720p and keep the file under about 90 MB.
