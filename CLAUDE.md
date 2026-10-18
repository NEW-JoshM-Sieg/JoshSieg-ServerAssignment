# Project context for Claude Code

This repository is a class project (Prof. Rosenthal, HW3 "Working With Third Party Services").
It connects Claude Code to Gmail, GitHub, Notion and Linear through each vendor's
**official** MCP server, downloads data into `dataExports/`, and shows it in a local
search dashboard (`dashboard/`).

## Rules for this repo

- Whenever you are asked to download, export, pull, save or back up data from Gmail,
  GitHub, Notion or Linear, use the project skill `download-service-data`
  (`.claude/skills/download-service-data/SKILL.md`). Do not improvise a different format.
- `localStorageFormats.md` is the single source of truth for how exported data is stored.
  If the spec and the skill ever disagree, the spec wins; fix the skill.
- After every export, run the validator:
  `node .claude/skills/download-service-data/scripts/validate_exports.js`
  and fix anything it reports before finishing.
- This repo is PUBLIC. Never write passwords, API keys, personal access tokens,
  OAuth client secrets or refresh tokens into any file. `.mcp.json` must only reference
  secrets through environment variables such as `${GITHUB_PAT}`.
- All accounts used here are throwaway test accounts created for this assignment.
