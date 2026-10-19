# Dashboard

A small local website that searches the data saved in `../dataExports/` by the
`download-service-data` skill. It reads the files directly from disk; it does not contact
Gmail, GitHub, Notion or Linear.

## Requirements

[Node.js](https://nodejs.org/) 18 or newer. There is nothing to install: the server uses
only Node's built-in modules, so there is no `npm install` step.

Check your version with:

```
node -v
```

## Run it

From the repository root:

```
node dashboard/server.js
```

Then open **http://localhost:3000** in your browser. Press `Ctrl + C` in the terminal to stop.

To use another port: `set PORT=4000` (Windows Command Prompt), `$env:PORT=4000` (PowerShell)
or `PORT=4000` (macOS/Linux) before the command.

The server rescans `dataExports/` on every request, so newly downloaded items appear as soon
as you search again. There is no need to restart.

## What it does

* **Search across every service at once.** Type a name or phrase, such as `Dana Whitfield`,
  and results come back from Gmail, GitHub, Notion and Linear together. Each result carries
  a coloured badge and the service name, so it is always clear where it came from.
* **Search one service, or several.** The chips under the search box (`Gmail`, `GitHub`,
  `Notion`, `Linear`) narrow the results. Each chip shows how many matches that service has.
  `All services` resets the filter.
* **Search rules.** Matching ignores case. Several words must all appear somewhere in the
  item (subject, body, README, issues, comments, page text or any metadata field). Use quotes
  for an exact phrase: `"Holiday Blend"`. An empty search lists everything.
* **Sort** by best match (matches in titles rank highest) or newest first. "Newest" uses
  the received time for emails, the last-edited time for Notion pages, the updated time for
  Linear issues, and for GitHub repositories the latest of the last push, the repository
  update and any issue update (so a repo whose issue changed today counts as recent).
* **Open any result** to see its full content (email body, README, issues and commits,
  Notion page, Linear description and comments), key facts, the complete stored
  `metadata.json`, the local folder it was read from, and a link back to the original item
  in the service.
* The current search is kept in the address bar, so a search can be bookmarked or shared,
  for example `http://localhost:3000/?q=Dana%20Whitfield&services=gmail,linear`.

## How it is built

| File | Role |
|---|---|
| `server.js` | Node HTTP server. Walks `dataExports/<service>/<item>/`, reads `metadata.json` and the content files defined in `localStorageFormats.md`, normalises each item to a common shape, and serves a JSON search API plus the static page. Binds to `127.0.0.1` only. |
| `public/index.html` | Page structure. |
| `public/styles.css` | Styling, including dark mode. |
| `public/app.js` | Calls the API, renders results and the detail panel, highlights matches. All downloaded text is HTML-escaped before display, so content such as email bodies can never run as code in the page. |

### API

| Endpoint | Returns |
|---|---|
| `GET /api/search?q=<text>&services=gmail,notion&sort=relevance\|newest` | Matching items with a snippet around the first match, plus per-service match counts. |
| `GET /api/item?service=<service>&id=<folder name>` | One item in full, including its metadata. |
| `GET /api/stats` | Number of items stored for each service. |
