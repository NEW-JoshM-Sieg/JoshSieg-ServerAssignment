'use strict';

const SERVICES = [
  { key: 'gmail', label: 'Gmail', icon: 'M' },
  { key: 'github', label: 'GitHub', icon: 'G' },
  { key: 'notion', label: 'Notion', icon: 'N' },
  { key: 'linear', label: 'Linear', icon: 'L' },
];
const LABEL = Object.fromEntries(SERVICES.map((s) => [s.key, s]));
const OPEN_IN = { gmail: 'Open in Gmail', github: 'Open on GitHub', notion: 'Open in Notion', linear: 'Open in Linear' };

const state = { q: '', selected: new Set(), sort: 'relevance', terms: [] };
const $ = (id) => document.getElementById(id);

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function highlight(text) {
  const safe = esc(text);
  if (!state.terms.length) return safe;
  const pattern = state.terms.map((t) => reEsc(esc(t))).sort((a, b) => b.length - a.length).join('|');
  return safe.replace(new RegExp(`(${pattern})`, 'gi'), '<mark>$1</mark>');
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

const badge = (svc) => `<span class="badge svc-${svc}"><span class="dot" aria-hidden="true">${LABEL[svc].icon}</span>${LABEL[svc].label}</span>`;

function readUrl() {
  const p = new URLSearchParams(location.search);
  state.q = p.get('q') || '';
  state.sort = p.get('sort') === 'newest' ? 'newest' : 'relevance';
  state.selected = new Set((p.get('services') || '').split(',').filter((s) => LABEL[s]));
  $('q').value = state.q;
  $('sort').value = state.sort;
}

function writeUrl() {
  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.selected.size) p.set('services', [...state.selected].join(','));
  if (state.sort !== 'relevance') p.set('sort', state.sort);
  history.replaceState(null, '', `${location.pathname}${p.toString() ? `?${p}` : ''}`);
}

function renderChips(counts = {}) {
  const all = state.selected.size === 0;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  $('chips').innerHTML =
    `<button type="button" class="chip all" data-svc="" aria-pressed="${all}">All services <span class="n">${total}</span></button>` +
    SERVICES.map((s) => `<button type="button" class="chip svc-${s.key}" data-svc="${s.key}" aria-pressed="${state.selected.has(s.key)}">${s.label} <span class="n">${counts[s.key] ?? 0}</span></button>`).join('');
}

async function loadStats() {
  try {
    const r = await fetch('/api/stats');
    const s = await r.json();
    $('stats').innerHTML = SERVICES.map((x) => `<span class="stat"><b>${s.services[x.key].count}</b> ${x.label}</span>`).join('');
  } catch { /* stats are decorative */ }
}

async function runSearch() {
  writeUrl();
  const p = new URLSearchParams({ q: state.q, services: [...state.selected].join(','), sort: state.sort });
  $('summary').textContent = 'Searching…';
  let data;
  try {
    data = await (await fetch(`/api/search?${p}`)).json();
  } catch {
    $('summary').textContent = '';
    $('results').innerHTML = '<div class="empty">Could not reach the dashboard server. Is <code>node dashboard/server.js</code> still running?</div>';
    return;
  }
  state.terms = data.terms;
  renderChips(data.counts);

  const scope = state.selected.size ? [...state.selected].map((s) => LABEL[s].label).join(', ') : 'all services';
  $('summary').innerHTML = state.q
    ? `<b>${data.total}</b> result${data.total === 1 ? '' : 's'} for <b>${esc(state.q)}</b> in ${esc(scope)}`
    : `Showing all <b>${data.total}</b> downloaded item${data.total === 1 ? '' : 's'} in ${esc(scope)}`;

  if (!data.results.length) {
    $('results').innerHTML = `<div class="empty">${state.q ? 'Nothing matched. Try fewer words, or select <b>All services</b>.' : 'No downloaded data yet. Run the download skill in Claude Code to fill <code>dataExports/</code>.'}</div>`;
    return;
  }

  $('results').innerHTML = data.results.map((r) => `
    <article class="card svc-${r.service}" tabindex="0" data-svc="${r.service}" data-id="${esc(r.id)}" aria-label="${esc(LABEL[r.service].label)}: ${esc(r.title)}">
      <div class="card-top">${badge(r.service)}<span class="date">${esc(fmtDate(r.date))}</span></div>
      <h3>${highlight(r.title)}</h3>
      <p class="meta">${highlight(r.subtitle)}</p>
      ${r.snippet ? `<p class="snip">${highlight(r.snippet)}</p>` : ''}
      ${r.tags && r.tags.length ? `<div class="tags">${r.tags.slice(0, 6).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
    </article>`).join('');
}

async function openItem(service, id) {
  const r = await fetch(`/api/item?${new URLSearchParams({ service, id })}`);
  if (!r.ok) return;
  const it = await r.json();
  $('d-badge').innerHTML = badge(service);
  $('d-title').innerHTML = highlight(it.title);
  $('d-sub').innerHTML = highlight(it.subtitle);
  $('d-links').innerHTML =
    (it.url ? `<a href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">${OPEN_IN[service]} ↗</a>` : '') +
    `<span>Stored at <code>${esc(it.path)}</code></span>`;
  $('d-facts').innerHTML = it.facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${highlight(/^\d{4}-\d{2}-\d{2}T/.test(v) ? fmtDate(v) : v)}</dd>`).join('');
  $('d-sections').innerHTML = it.sections.map((s) => `<div class="section"><h4>${esc(s.label)}</h4><pre>${highlight(s.text || '(empty)')}</pre></div>`).join('');
  $('d-raw').textContent = JSON.stringify(it.metadata, null, 2);
  $('drawer').hidden = false;
  $('backdrop').hidden = false;
  $('drawer').scrollTop = 0;
  $('d-close').focus();
}

function closeDrawer() {
  $('drawer').hidden = true;
  $('backdrop').hidden = true;
}

$('search-form').addEventListener('submit', (e) => { e.preventDefault(); state.q = $('q').value.trim(); runSearch(); });
let timer;
$('q').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { state.q = $('q').value.trim(); runSearch(); }, 250); });
$('sort').addEventListener('change', () => { state.sort = $('sort').value; runSearch(); });
$('chips').addEventListener('click', (e) => {
  const b = e.target.closest('.chip');
  if (!b) return;
  const svc = b.dataset.svc;
  if (!svc) state.selected.clear();
  else if (state.selected.has(svc)) state.selected.delete(svc);
  else state.selected.add(svc);
  if (state.selected.size === SERVICES.length) state.selected.clear();
  runSearch();
});
$('results').addEventListener('click', (e) => { const c = e.target.closest('.card'); if (c) openItem(c.dataset.svc, c.dataset.id); });
$('results').addEventListener('keydown', (e) => { if (e.key === 'Enter') { const c = e.target.closest('.card'); if (c) openItem(c.dataset.svc, c.dataset.id); } });
$('d-close').addEventListener('click', closeDrawer);
$('backdrop').addEventListener('click', closeDrawer);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

readUrl();
renderChips();
loadStats();
runSearch();
