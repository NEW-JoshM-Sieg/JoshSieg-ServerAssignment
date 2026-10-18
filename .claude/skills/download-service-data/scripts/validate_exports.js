#!/usr/bin/env node
// Checks everything in dataExports/ against localStorageFormats.md (schema 1.0).
// Usage: node .claude/skills/download-service-data/scripts/validate_exports.js [service ...]
// Exit code 0 = no errors. Warnings do not fail the run.
'use strict';

const fs = require('fs');
const path = require('path');
const C = require('./common');

const ROOT = path.resolve(__dirname, '../../../..');
const EXPORTS = process.env.DATA_EXPORTS_DIR || path.join(ROOT, 'dataExports');

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

function readJson(file, where) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { err(where, `${path.basename(file)} is not valid JSON (${e.message})`); return undefined; }
}

function checkService(service) {
  const dir = path.join(EXPORTS, service);
  if (!fs.existsSync(dir)) { warn(service, 'no folder yet'); return { items: 0 }; }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const items = entries.filter((e) => e.isDirectory() && !e.name.startsWith('_'));
  const strayFiles = entries.filter((e) => e.isFile() && e.name !== '_exportLog.json' && e.name !== '.gitkeep');
  for (const f of strayFiles) err(service, `unexpected file "${f.name}" directly in the service folder`);

  const runIdsInItems = new Set();
  for (const it of items) {
    const where = `${service}/${it.name}`;
    const itemDir = path.join(dir, it.name);
    if (!C.FOLDER_PATTERNS[service].test(it.name)) err(where, 'folder name does not match the spec pattern');

    const files = fs.readdirSync(itemDir);
    for (const f of C.REQUIRED_FILES[service]) if (!files.includes(f)) err(where, `missing required file ${f}`);
    for (const f of files) if (!C.ALLOWED_FILES[service].includes(f)) err(where, `file "${f}" is not allowed by the spec`);
    for (const f of files.filter((x) => x.endsWith('.json') && x !== 'metadata.json')) {
      const v = readJson(path.join(itemDir, f), where);
      if (v !== undefined && !Array.isArray(v)) err(where, `${f} must be a JSON array`);
    }

    if (!files.includes('metadata.json')) continue;
    const m = readJson(path.join(itemDir, 'metadata.json'), where);
    if (!m) continue;

    for (const f of C.REQUIRED_FIELDS[service]) if (!(f in m)) err(where, `metadata.json missing field "${f}"`);
    for (const f of C.TIMESTAMP_FIELDS[service]) {
      if (m[f] != null && !C.ISO_UTC.test(m[f])) err(where, `"${f}" must be ISO 8601 UTC ending in Z (got ${m[f]})`);
    }

    const ex = m._export;
    if (!ex || typeof ex !== 'object') { err(where, 'metadata.json missing _export block'); continue; }
    for (const f of C.EXPORT_FIELDS) if (!(f in ex)) err(where, `_export missing "${f}"`);
    if (ex.service !== service) err(where, `_export.service is "${ex.service}", expected "${service}"`);
    if (ex.schema_version !== C.SCHEMA_VERSION) warn(where, `schema_version ${ex.schema_version} (current is ${C.SCHEMA_VERSION})`);
    for (const f of ['first_exported_at', 'exported_at']) {
      if (ex[f] && !C.ISO_UTC.test(ex[f])) err(where, `_export.${f} must be ISO 8601 UTC`);
    }
    if (ex.export_run_id && !C.RUN_ID.test(ex.export_run_id)) err(where, '_export.export_run_id has the wrong format');
    if (ex.export_run_id) runIdsInItems.add(ex.export_run_id);
    const idField = C.SOURCE_ID_FIELD[service];
    if (ex.source_id != null && String(ex.source_id) !== String(m[idField])) err(where, `_export.source_id does not match ${idField}`);
    if (!Array.isArray(ex.mcp_tools_used) || ex.mcp_tools_used.length === 0) warn(where, '_export.mcp_tools_used is empty');

    try {
      const expected = C.folderName(service, m);
      if (expected !== it.name) err(where, `folder should be named "${expected}" according to its metadata`);
    } catch (e) { err(where, `cannot derive folder name: ${e.message}`); }

    const contentFile = { gmail: 'body.txt', notion: 'content.md', linear: 'description.md' }[service];
    if (contentFile && files.includes(contentFile)) {
      const size = fs.statSync(path.join(itemDir, contentFile)).size;
      if (size === 0) warn(where, `${contentFile} is empty`);
    }
  }

  const logPath = path.join(dir, '_exportLog.json');
  if (items.length && !fs.existsSync(logPath)) err(service, '_exportLog.json is missing');
  if (fs.existsSync(logPath)) {
    const log = readJson(logPath, `${service}/_exportLog.json`);
    if (log !== undefined && !Array.isArray(log)) err(`${service}/_exportLog.json`, 'must be a JSON array');
    if (Array.isArray(log)) {
      const logged = new Set(log.map((r) => r.export_run_id));
      for (const id of runIdsInItems) if (!logged.has(id)) err(service, `run ${id} is used by items but missing from _exportLog.json`);
    }
  }
  return { items: items.length };
}

const only = process.argv.slice(2);
const services = only.length ? only : C.SERVICES;
const counts = {};
for (const s of services) {
  if (!C.SERVICES.includes(s)) { err(s, 'unknown service'); continue; }
  counts[s] = checkService(s).items;
}

console.log(`Validated ${EXPORTS}`);
for (const [s, n] of Object.entries(counts)) console.log(`  ${s.padEnd(7)} ${n} item(s)`);
if (warnings.length) { console.log(`\n${warnings.length} warning(s):`); warnings.forEach((w) => console.log(`  - ${w}`)); }
if (errors.length) { console.log(`\n${errors.length} error(s):`); errors.forEach((e) => console.log(`  x ${e}`)); process.exit(1); }
console.log('\nOK: all exports follow localStorageFormats.md');
