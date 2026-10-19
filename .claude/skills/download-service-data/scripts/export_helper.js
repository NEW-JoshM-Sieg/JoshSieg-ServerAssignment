#!/usr/bin/env node
// Writes a batch of downloaded items into dataExports/ exactly as localStorageFormats.md specifies.
//
// Usage:  node .claude/skills/download-service-data/scripts/export_helper.js <batch.json>
//
// batch.json:
// {
//   "service": "gmail" | "github" | "notion" | "linear",
//   "source_query": "plain-words description of what was requested",
//   "run_started_at": "2026-10-18T19:10:30Z",          (optional, defaults to now)
//   "mcp_tools_used": ["search_threads", "get_thread"], (default for every item)
//   "notes": null,                                      (optional)
//   "items": [
//     {
//       "metadata": { ...service fields from the spec, WITHOUT _export... },
//       "files":    { "body.txt": "text...", "body.html": "<p>...</p>" },
//       "mcp_tools_used": [...]                         (optional per-item override)
//     }
//   ]
// }
//
// For JSON content files (issues.json, commits.json, comments.json) pass an array, not a string.
// Missing optional metadata fields are filled with null / [] / {} so every item has the same shape.
'use strict';

const fs = require('fs');
const path = require('path');
const C = require('./common');

const ROOT = path.resolve(__dirname, '../../../..');
const EXPORTS = path.join(process.env.DATA_EXPORTS_DIR || path.join(ROOT, 'dataExports'));

const VERBATIM_FILES = new Set(['body.html']);
const LIST_FIELDS = new Set(['to', 'cc', 'bcc', 'reply_to', 'labels', 'attachments', 'topics', 'child_pages']);
const OBJECT_FIELDS = new Set(['extra', 'properties']);

function fail(msg) { console.error(`ERROR: ${msg}`); process.exit(1); }

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function normalizeText(s) { return String(s).replace(/\r\n/g, '\n'); }

function main() {
  const batchPath = process.argv[2];
  if (!batchPath) fail('Pass the path to a batch JSON file.');
  const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
  const service = batch.service;
  if (!C.SERVICES.includes(service)) fail(`service must be one of ${C.SERVICES.join(', ')}`);
  if (!batch.source_query) fail('source_query is required.');
  if (!Array.isArray(batch.items) || batch.items.length === 0) fail('items must be a non-empty array.');

  const startedAt = C.toIsoUtc(batch.run_started_at || new Date());
  const runId = `${C.stampForName(startedAt)}_${service}`;
  const serviceDir = path.join(EXPORTS, service);
  fs.mkdirSync(serviceDir, { recursive: true });

  const itemsNew = [];
  const itemsUpdated = [];

  for (const [i, item] of batch.items.entries()) {
    const m = { ...(item.metadata || {}) };
    delete m._export;

    // Fill every documented field so all items share one shape.
    for (const f of C.REQUIRED_FIELDS[service]) {
      if (m[f] === undefined) m[f] = LIST_FIELDS.has(f) ? [] : OBJECT_FIELDS.has(f) ? {} : null;
    }
    for (const f of C.TIMESTAMP_FIELDS[service]) if (m[f] != null) m[f] = C.toIsoUtc(m[f]);

    if (service === 'gmail') {
      if (m.is_unread === null) m.is_unread = Array.isArray(m.labels) && m.labels.includes('UNREAD');
      if (m.has_attachments === null) m.has_attachments = m.attachments.length > 0;
      if (!m.web_url && m.thread_id) m.web_url = `https://mail.google.com/mail/u/0/#all/${m.thread_id}`;
    }
    if (service === 'linear' && m.priority_label === null && m.priority != null) {
      m.priority_label = ['No priority', 'Urgent', 'High', 'Medium', 'Low'][m.priority] || null;
    }
    if (service === 'github' && m.readme_present === null) {
      m.readme_present = Boolean(item.files && item.files['README.md']);
    }

    const idField = C.SOURCE_ID_FIELD[service];
    if (!m[idField]) fail(`item ${i}: metadata.${idField} is required.`);

    let name;
    try { name = C.folderName(service, m); } catch (e) { fail(`item ${i}: ${e.message}`); }
    const dir = path.join(serviceDir, name);

    let firstExportedAt = startedAt;
    const existing = path.join(dir, 'metadata.json');
    if (fs.existsSync(existing)) {
      try {
        const old = JSON.parse(fs.readFileSync(existing, 'utf8'));
        if (old._export && old._export.first_exported_at) firstExportedAt = old._export.first_exported_at;
      } catch { /* unreadable old copy: treat as new first export */ }
      itemsUpdated.push(name);
      fs.rmSync(dir, { recursive: true, force: true }); // replace with the fresh copy (spec 3.6)
    } else {
      itemsNew.push(name);
    }
    fs.mkdirSync(dir, { recursive: true });

    // Write fields in the order the spec documents them, then any others, then _export.
    const ordered = {};
    for (const f of C.REQUIRED_FIELDS[service]) ordered[f] = m[f];
    for (const [k, v] of Object.entries(m)) if (!(k in ordered)) ordered[k] = v;
    for (const k of Object.keys(m)) delete m[k];
    Object.assign(m, ordered);

    m._export = {
      schema_version: C.SCHEMA_VERSION,
      service,
      source_id: String(m[idField]),
      first_exported_at: firstExportedAt,
      exported_at: C.toIsoUtc(new Date()),
      export_run_id: runId,
      source_query: batch.source_query,
      mcp_server: C.MCP_SERVERS[service],
      mcp_tools_used: item.mcp_tools_used || batch.mcp_tools_used || [],
    };
    writeJson(path.join(dir, 'metadata.json'), m);

    const files = { ...(item.files || {}) };
    // Required content files that the service did not provide get a sensible empty value.
    for (const f of C.REQUIRED_FILES[service]) {
      if (f === 'metadata.json' || files[f] !== undefined) continue;
      files[f] = f.endsWith('.json') ? [] : '';
    }
    for (const [fname, content] of Object.entries(files)) {
      if (!C.ALLOWED_FILES[service].includes(fname)) fail(`item ${i}: "${fname}" is not an allowed file for ${service}.`);
      if (content === null || content === undefined) continue;
      const target = path.join(dir, fname);
      if (fname.endsWith('.json')) writeJson(target, content);
      else if (VERBATIM_FILES.has(fname)) fs.writeFileSync(target, String(content), 'utf8'); // spec 4: exactly as received
      else fs.writeFileSync(target, normalizeText(content).replace(/\n?$/, '\n'), 'utf8');
    }
  }

  const logPath = path.join(serviceDir, '_exportLog.json');
  let log = [];
  if (fs.existsSync(logPath)) {
    try { log = JSON.parse(fs.readFileSync(logPath, 'utf8')); } catch { fail(`${logPath} is not valid JSON; fix it before exporting.`); }
  }
  log.push({
    export_run_id: runId,
    started_at: startedAt,
    finished_at: C.toIsoUtc(new Date()),
    source_query: batch.source_query,
    mcp_server: C.MCP_SERVERS[service],
    items_new: itemsNew,
    items_updated: itemsUpdated,
    item_count: itemsNew.length + itemsUpdated.length,
    notes: batch.notes || null,
  });
  writeJson(logPath, log);

  console.log(`Run ${runId}: ${itemsNew.length} new, ${itemsUpdated.length} updated -> ${path.relative(ROOT, serviceDir)}`);
  for (const n of itemsNew) console.log(`  + ${n}`);
  for (const n of itemsUpdated) console.log(`  ~ ${n}`);
}

main();
