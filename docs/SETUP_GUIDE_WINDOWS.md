# Setup and run guide (Windows)

This is the exact order of work, from empty accounts to a finished submission. Commands are
for **PowerShell** (Start menu → type "PowerShell"). Every account below uses the **test
Gmail address**, never a personal one.

> **The one rule that protects your grade:** the repository is public. Never paste a token,
> password or client secret into any file in this folder, never show one on screen while
> recording, and never download a Google `client_secret_….json` file into this folder.

---

## Part 1. Get the project onto your computer and onto GitHub

1. Unzip `JoshSieg-ServerAssignment.zip` somewhere simple, for example `C:\Projects\`.
   You should have `C:\Projects\JoshSieg-ServerAssignment\README.md`.
2. Sign in to **github.com** with the test GitHub account and create a new repository:
   name `JoshSieg-ServerAssignment`, **Public**, and do **not** add a README, `.gitignore` or
   license (the project already has them).
3. Make sure Git is installed: `git --version`. If not, install it from git-scm.com.
4. In PowerShell:

   ```powershell
   cd C:\Projects\JoshSieg-ServerAssignment
   git init
   git config user.name "Josh Sieg"
   git config user.email "YOUR-TEST-GMAIL@gmail.com"
   git add .
   git commit -m "Project scaffold: MCP config, storage spec, download skill, dashboard"
   git branch -M main
   git remote add origin https://github.com/YOUR-TEST-GITHUB-USERNAME/JoshSieg-ServerAssignment.git
   git push -u origin main
   ```

   The two `git config` lines matter: without them, your commits would be stamped with
   whatever name and email Git already has on this computer, possibly your personal ones,
   in a public repository.

   When Git asks you to sign in, sign in as the **test** GitHub account. If it pushes
   silently as your personal account (because Windows remembered it), open **Credential
   Manager → Windows Credentials**, remove the `git:https://github.com` entry, and push again.

---

## Part 2. GitHub connection (official server, personal access token)

GitHub's remote server is authenticated in Claude Code with a personal access token (PAT).

1. On github.com (test account): profile picture → **Settings → Developer settings →
   Personal access tokens → Tokens (classic) → Generate new token (classic)**.
2. Note: `Claude Code MCP - HW3`. Expiration: 30 days. Scopes: tick **`repo`** and
   **`read:user`**. Generate, and copy the token (starts with `ghp_`). You will not see it again.
3. Store it as an environment variable, outside the repository:

   ```powershell
   setx GITHUB_PAT "ghp_paste_your_token_here"
   ```

4. **Close PowerShell completely and open a new window** (environment variables only reach
   new windows). Check it is there without printing it:

   ```powershell
   if ($env:GITHUB_PAT) { "GITHUB_PAT is set" } else { "missing" }
   ```

`.mcp.json` already contains `"Authorization": "Bearer ${GITHUB_PAT}"`; Claude Code fills in
the value from your environment at startup, so the token never enters the repository.

*If GitHub later refuses the connection with a 401/403 message about Copilot:* on the test
account open **Settings → Copilot** and turn on the free Copilot plan, then try again.

---

## Part 3. Notion connection (official hosted server, browser sign-in)

1. Make sure the test Notion workspace exists (you already created the account).
2. Nothing to install. `.mcp.json` already points at `https://mcp.notion.com/mcp`.
   You will sign in from inside Claude Code in Part 5.

---

## Part 4. Linear account (the additional service)

1. Go to **linear.app** → Sign up with Google → choose the **test Gmail**. The free plan is
   enough.
2. Workspace name: `Riverstone Coffee`. When asked to create a team, name it
   **`Riverstone`** with the identifier **`RIV`** (so issues are numbered `RIV-1`, `RIV-2`, …).
   If onboarding doesn't ask, set it in **Settings → Teams**.
3. Skip inviting teammates and skip the sample issues if offered (we will make realistic ones).
4. `.mcp.json` already points at `https://mcp.linear.app/mcp`. You will sign in from Claude
   Code next.

---

## Part 5. First Claude Code session: authenticate GitHub, Notion and Linear

```powershell
cd C:\Projects\JoshSieg-ServerAssignment
claude
```

1. Claude Code will say the project has MCP servers in `.mcp.json` and ask whether to use
   them. **Approve all of them.**
2. Type `/mcp`. You'll see `github`, `notion` and `linear`.
   * **github** should already show *connected* (it uses your token).
   * **notion** → select it → **Authenticate** → your browser opens → choose the test
     workspace → **Allow access**.
   * **linear** → select it → **Authenticate** → browser → choose the Riverstone Coffee
     workspace → **Authorize**.
3. Back in Claude Code, `/mcp` should list all three as connected. Quick sanity check: ask
   *"Using the Linear MCP server, what teams are in my workspace?"* It should answer `Riverstone (RIV)`.
4. Type `/exit` for now.

**Screenshot this `/mcp` screen** with everything connected; it's good slide material.

---

## Part 6. Gmail connection (Anthropic's Gmail connector, extra credit)

Google's own Gmail MCP server only accepts **paid Google Workspace** accounts in its Developer
Preview; personal Gmail addresses, including test ones, are rejected by the application form.
Prof. Rosenthal said Anthropic's own Gmail connector is an acceptable alternative, and it is
much simpler: there is no Google Cloud setup at all.

1. Go to **claude.ai** (signed in to the Claude account you use for Claude Code) →
   **Settings → Connectors** → find **Gmail** → **Connect**.
2. Google's sign-in opens. **Choose the test Gmail**, not your personal Google account,
   and allow access. (If it skips straight to your personal account, cancel, use
   "Use another account", and pick the test one.)
3. Restart Claude Code in the project folder (`/exit`, then `claude`). Claude Code picks up
   claude.ai connectors automatically. Type `/mcp` and look for the Gmail entry (its tools are
   named like `mcp__claude_ai_Gmail__search_threads`).
4. Check it: *"Using the Gmail connector, list the subjects of the 5 most recent emails in my inbox."*
   The subjects should be ones from the **test** inbox. If you see personal emails, you
   connected the wrong Google account: disconnect in claude.ai, reconnect with the test one.

Notes:

* The connector can read and draft but **cannot send**, which is why the test emails come
  from a second account (Part 7).
* Because it is attached to your claude.ai account rather than this folder, it does **not**
  appear in `.mcp.json`. The README explains this, so the grader knows why.
* When the course is over you can disconnect it in claude.ai → Settings → Connectors.
* The Google Cloud project you created isn't needed anymore. You can leave it; it costs nothing.


## Part 7. Put realistic test data in every service (Conversation A)

Follow [`TEST_DATA_PLAN.md`](TEST_DATA_PLAN.md). Summary:

1. **Gmail:** the official server can read and draft but **cannot send**, so test emails must
   arrive from another account. Create a second throwaway Gmail named *Dana Whitfield* and send
   the emails in the plan to the test Gmail. Signing up for GitHub, Notion and Linear also
   leaves genuine welcome and notification emails, which make the inbox look natural.
2. **GitHub, Notion and Linear:** open `claude` in the project folder and paste the population
   prompt from the plan. Claude Code creates the repositories, pages and issues through the MCP
   servers.
3. Check each service's website: at least 10 items each.
4. **Take the "original content" screenshots now** (list in `PRESENTATION_AND_VIDEO.md`).
5. Type **`/clear`**. This ends Conversation A, as the assignment requires.

---

## Part 8. First download, and refine the spec and skill with Claude (Conversation B)

In the same `claude` window after `/clear` (or a fresh `claude`), paste:

> Read `localStorageFormats.md` and the `download-service-data` skill in `.claude/skills`.
> Then use the skill to download data from each service into `dataExports/`:
> all Gmail messages in my inbox from the last 7 days; all of my GitHub repositories;
> every Notion page in the workspace; and all Linear issues in the Riverstone team.
> If anything the MCP servers actually return doesn't fit the spec, tell me and propose a
> change to the spec and skill before saving.

What to expect: Claude Code reads the skill, calls each server, writes batch files to
`.export-staging/`, runs `export_helper.js`, then `validate_exports.js`, and reports a summary.
Read the summary. If Claude suggests a sensible spec change (for example a field the servers
name differently), agree, let it update `localStorageFormats.md`, `scripts/common.js` and
`SKILL.md` together, and keep the spec as the source of truth. You're responsible for the
format making sense, so look at two or three item folders yourself in File Explorer.

Then ask Claude to explain the formats back to you, as the assignment says:

> Explain the storage format you used for each service, and confirm localStorageFormats.md
> describes it accurately.

Commit:

```powershell
git add .
git commit -m "First export of all four services"
git push
```

## Part 9. Prove the skill is repeatable (Conversation C)

1. In each service's **website**, add one or two new items (a new email from "Dana", a new
   GitHub issue, a new Notion page, a new Linear issue), so this download has genuinely new
   data to fetch.
2. In Claude Code type **`/clear`**, then ask simply:

   > Download any new or updated data from each service since the last export.

   Notice you don't mention the format at all. The skill and `CLAUDE.md` make Claude follow
   it anyway. That's the point being graded.
3. Check each `_exportLog.json` now has **two runs**, and that the new folders look exactly
   like the old ones. Screenshot one `_exportLog.json` for the slides.
4. Commit and push.

## Part 10. Dashboard (Conversation D)

1. `/clear`, then:

   > Review the dashboard in `dashboard/`, start it, and confirm it shows data from every
   > service and supports searching one service or all of them. Fix anything that doesn't
   > work with the real data.

   (The dashboard reads the files on disk, so it already works with whatever is in
   `dataExports/`; this step lets Claude adapt it to any spec changes from Part 8.)
2. Or simply run it yourself in a second PowerShell window:

   ```powershell
   cd C:\Projects\JoshSieg-ServerAssignment
   node dashboard/server.js
   ```

   and open http://localhost:3000. If `node` isn't recognised, install Node.js LTS from
   nodejs.org and open a new PowerShell window.
3. **Take the dashboard screenshots** (list in `PRESENTATION_AND_VIDEO.md`).

## Part 11. Presentation, video and submission

1. Send the screenshots to Claude in the chat to build the PowerPoint.
2. Record the video using the script in `PRESENTATION_AND_VIDEO.md`
   (Windows: **Win + Alt + R** starts/stops Xbox Game Bar recording, or use Clipchamp).
3. Put `JoshSieg-ServerAssignment.pptx` and `demo.mp4` in `presentation/`.
   GitHub rejects single files over 100 MB, so keep the video under about 90 MB
   (a 3-minute 1080p recording usually is; Clipchamp's export at 720p always is).
4. Final checks:

   ```powershell
   node .claude/skills/download-service-data/scripts/validate_exports.js
   git status
   ```

   Then search the folder for anything secret-looking before the last push:

   ```powershell
   Get-ChildItem -Recurse -File | Select-String -Pattern "ghp_|github_pat_|GOCSPX|client_secret|lin_api_|secret_" -List | Select-Object Path
   ```

   That should print nothing. (`GOCSPX` is how Google client secrets begin.)
5. `git add .`, `git commit -m "Final submission"`, `git push`, and open the repo on github.com
   in a private window to confirm it's public and everything is there.
6. Submit the repo URL: `https://github.com/YOUR-TEST-GITHUB-USERNAME/JoshSieg-ServerAssignment`
