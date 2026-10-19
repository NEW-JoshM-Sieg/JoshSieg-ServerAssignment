#!/usr/bin/env node
// Local dashboard for the data in ../dataExports (format: ../localStorageFormats.md).
// Run:  node dashboard/server.js      then open http://localhost:3000
// No npm install needed: uses only Node's built-in modules.
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.env.DATA_EXPORTS_DIR || path.join(__dirname, '..', 'dataExports'));
const PUBLIC_DIR = path.join(__dirname, 'public');

const SERVICES = {
  gmail: { label: 'Gmail', item: 'email' },
  github: { label: 'GitHub', item: 'repository' },
  notion: { label: 'Notion', item: 'page' },
  linear: { label: 'Linear', item: 'issue' },
};

// ---------- reading dataExports ----------

function readText(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch { return null; }
}
function readJson(file, fallback) {
  const t = readText(file);
  if (t == null) return fallback;
  try { return JSON.parse(t); } catch { return fallback; }
}
// GitHub people may carry only a login (spec 3.4), so fall back to it.
const person = (p) => (!p ? '' : p.name && p.email ? `${p.name} <${p.email}>` : p.name || p.email || (p.login ? `@${p.login}` : ''));
const latest = (...dates) => dates.filter(Boolean).sort().pop() || null;
const people = (list) => (Array.isArray(list) ? list.map(person).filter(Boolean).join(', ') : '');

// Flatten metadata to plain strings so every field is searchable.
function flatten(value, out = []) {
  if (value == null) return out;
  if (typeof value === 'object') {
    for (const v of Array.isArray(value) ? value : Object.values(value)) flatten(v, out);
  } else out.push(String(value));
  return out;
}

const NORMALIZE = {
  gmail(m, dir) {
    const body = readText(path.join(dir, 'body.txt')) || '';
    return {
      title: m.subject || '(no subject)',
      subtitle: `From ${person(m.from) || 'unknown'}${m.to && m.to.length ? ` · To ${people(m.to)}` : ''}`,
      date: m.received_at,
      url: m.web_url,
      tags: (m.labels || []).filter((l) => !/^CATEGORY_/.test(l)),
      sections: [
        { label: 'Email body', text: body },
        ...(m.attachments && m.attachments.length
          ? [{ label: 'Attachments', text: m.attachments.map((a) => `${a.filename} (${a.mime_type || 'unknown type'}${a.size_bytes ? `, ${a.size_bytes} bytes` : ''})`).join('\n') }]
          : []),
      ],
      facts: [['From', person(m.from)], ['To', people(m.to)], ['Cc', people(m.cc)], ['Received', m.received_at], ['Labels', (m.labels || []).join(', ')]],
    };
  },
  github(m, dir) {
    const readme = readText(path.join(dir, 'README.md')) || '';
    const issues = readJson(path.join(dir, 'issues.json'), []);
    const commits = readJson(path.join(dir, 'commits.json'), []);
    return {
      title: m.full_name || m.name,
      subtitle: m.description || 'No description',
      // Issue activity does not move pushed_at/updated_at, so include it in the item's date.
      date: latest(m.pushed_at, m.updated_at, ...issues.map((i) => i.updated_at)),
      url: m.html_url,
      tags: [m.primary_language, m.visibility, ...(m.topics || [])].filter(Boolean),
      sections: [
        { label: 'README', text: readme || '(This repository has no README.)' },
        { label: `Issues & pull requests (${issues.length})`, text: issues.map((i) => `#${i.number} [${i.state}] ${i.title}${person(i.author) ? ` (by ${person(i.author)})` : ''}${i.body ? `\n    ${String(i.body).replace(/\n/g, '\n    ')}` : ''}`).join('\n\n') || 'None' },
        { label: `Recent commits (${commits.length})`, text: commits.map((c) => `${String(c.sha || '').slice(0, 7)}  ${String(c.message || '').split('\n')[0]}  (${person(c.author)}, ${c.authored_at || ''})`).join('\n') || 'None' },
      ],
      facts: [['Owner', m.owner && m.owner.login], ['Language', m.primary_language], ['Default branch', m.default_branch], ['Stars', m.stargazers_count], ['Open issues', m.open_issues_count], ['Created', m.created_at], ['Last push', m.pushed_at], ['Last activity', latest(m.pushed_at, m.updated_at, ...issues.map((i) => i.updated_at))]],
    };
  },
  notion(m, dir) {
    const content = readText(path.join(dir, 'content.md')) || '';
    const props = m.properties && Object.keys(m.properties).length
      ? Object.entries(m.properties).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n') : '';
    return {
      title: `${m.icon && !/^https?:/.test(m.icon) ? `${m.icon} ` : ''}${m.title || 'Untitled'}`,
      subtitle: m.parent && m.parent.title ? `In ${m.parent.title}` : m.object_type === 'database_row' ? 'Database entry' : 'Page',
      date: m.last_edited_time,
      url: m.url,
      tags: [m.object_type === 'database_row' ? 'database entry' : 'page'],
      sections: [...(props ? [{ label: 'Properties', text: props }] : []), { label: 'Page content', text: content }],
      facts: [['Parent', m.parent && (m.parent.title || m.parent.type)], ['Created', m.created_time], ['Last edited', m.last_edited_time], ['Created by', person(m.created_by)], ['Edited by', person(m.last_edited_by)]],
    };
  },
  linear(m, dir) {
    const desc = readText(path.join(dir, 'description.md')) || '';
    const comments = readJson(path.join(dir, 'comments.json'), []);
    return {
      title: `${m.identifier} ${m.title || ''}`.trim(),
      subtitle: [m.state && m.state.name, m.priority_label, m.assignee ? `Assigned to ${person(m.assignee)}` : 'Unassigned'].filter(Boolean).join(' · '),
      date: m.updated_at,
      url: m.url,
      tags: [m.project, ...(m.labels || [])].filter(Boolean),
      sections: [
        { label: 'Description', text: desc },
        { label: `Comments (${comments.length})`, text: comments.map((c) => `${person(c.author) || 'Someone'} (${c.created_at || ''}):\n${c.body || ''}`).join('\n\n') || 'None' },
      ],
      facts: [['Team', m.team && `${m.team.name} (${m.team.key})`], ['Project', m.project], ['State', m.state && m.state.name], ['Priority', m.priority_label], ['Assignee', person(m.assignee)], ['Due', m.due_date], ['Created', m.created_at], ['Updated', m.updated_at]],
    };
  },
};

function loadAll() {
  const items = [];
  for (const service of Object.keys(SERVICES)) {
    const sdir = path.join(DATA_DIR, service);
    let entries = [];
    try { entries = fs.readdirSync(sdir, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith('_')) continue;
      const dir = path.join(sdir, e.name);
      const meta = readJson(path.join(dir, 'metadata.json'), null);
      if (!meta) continue;
      const n = NORMALIZE[service](meta, dir);
      const contentText = n.sections.map((s) => s.text).join('\n');
      items.push({
        service,
        id: e.name,
        path: path.relative(path.join(DATA_DIR, '..'), dir).split(path.sep).join('/'),
        ...n,
        facts: n.facts.filter(([, v]) => v != null && v !== ''),
        metadata: meta,
        _title: n.title.toLowerCase(),
        _content: contentText,
        _search: [n.title, n.subtitle, (n.tags || []).join(' '), contentText, flatten(meta).join(' ')].join('\n').toLowerCase(),
      });
    }
  }
  return items;
}

// ---------- search ----------

function parseQuery(q) {
  const terms = [];
  const re = /"([^"]+)"|(\S+)/g;
  let m;
  while ((m = re.exec(q || ''))) terms.push((m[1] || m[2]).toLowerCase());
  return terms.filter(Boolean);
}

function snippet(text, terms) {
  // Drop invisible preheader filler (combining grapheme joiner, soft hyphen, zero-width chars) common in marketing emails.
  const flat = String(text || '').replace(/[͏­​-‍⁠﻿]/g, '').replace(/\s+/g, ' ').trim();
  if (!flat) return '';
  const lower = flat.toLowerCase();
  let at = -1;
  for (const t of terms) { const i = lower.indexOf(t); if (i !== -1 && (at === -1 || i < at)) at = i; }
  if (at === -1) return flat.slice(0, 220) + (flat.length > 220 ? '…' : '');
  const start = Math.max(0, at - 90);
  const end = Math.min(flat.length, at + 160);
  return (start > 0 ? '…' : '') + flat.slice(start, end) + (end < flat.length ? '…' : '');
}

function search(items, q, services, sort) {
  const terms = parseQuery(q);
  const wanted = services && services.length ? new Set(services) : null;
  const results = [];
  const counts = Object.fromEntries(Object.keys(SERVICES).map((s) => [s, 0]));
  for (const it of items) {
    if (terms.length && !terms.every((t) => it._search.includes(t))) continue;
    counts[it.service] += 1; // counts ignore the service filter so the chips show what each service has
    if (wanted && !wanted.has(it.service)) continue;
    let score = 0;
    for (const t of terms) {
      if (it._title.includes(t)) score += 10;
      score += Math.min(5, it._search.split(t).length - 1);
    }
    results.push({ it, score });
  }
  results.sort((a, b) => (sort !== 'newest' && terms.length && b.score !== a.score)
    ? b.score - a.score
    : String(b.it.date || '').localeCompare(String(a.it.date || '')));
  return {
    query: q || '',
    terms,
    total: results.length,
    counts,
    results: results.map(({ it }) => ({
      service: it.service, id: it.id, title: it.title, subtitle: it.subtitle, date: it.date,
      url: it.url, tags: it.tags, snippet: snippet(it._content || it.subtitle, terms),
    })),
  };
}

// ---------- HTTP ----------

function sendJson(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

const STATIC = { '/': 'index.html', '/index.html': 'index.html', '/app.js': 'app.js', '/styles.css': 'styles.css' };
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname === '/api/search') {
      const services = (url.searchParams.get('services') || '').split(',').filter((s) => SERVICES[s]);
      return sendJson(res, 200, search(loadAll(), url.searchParams.get('q'), services, url.searchParams.get('sort')));
    }
    if (url.pathname === '/api/item') {
      const it = loadAll().find((x) => x.service === url.searchParams.get('service') && x.id === url.searchParams.get('id'));
      if (!it) return sendJson(res, 404, { error: 'Item not found' });
      const { _search, _title, _content, ...pub } = it;
      return sendJson(res, 200, pub);
    }
    if (url.pathname === '/api/stats') {
      const items = loadAll();
      const stats = Object.fromEntries(Object.entries(SERVICES).map(([k, v]) => [k, { ...v, count: items.filter((i) => i.service === k).length }]));
      return sendJson(res, 200, { dataDir: DATA_DIR, services: stats, total: items.length });
    }
    const file = STATIC[url.pathname];
    if (!file) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)], 'Cache-Control': 'no-store' });
    res.end(fs.readFileSync(path.join(PUBLIC_DIR, file)));
  } catch (e) {
    sendJson(res, 500, { error: e.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Dashboard running at http://localhost:${PORT}`);
  console.log(`Reading data from ${DATA_DIR}`);
  console.log('Press Ctrl+C to stop.');
});
