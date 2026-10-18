// Shared rules from localStorageFormats.md (schema 1.0). Used by export_helper.js and validate_exports.js.
'use strict';

const SCHEMA_VERSION = '1.0';
const SERVICES = ['gmail', 'github', 'notion', 'linear'];

const MCP_SERVERS = {
  gmail: 'claude.ai Gmail connector (Anthropic)',
  github: 'https://api.githubcopilot.com/mcp/',
  notion: 'https://mcp.notion.com/mcp',
  linear: 'https://mcp.linear.app/mcp',
};

// Section 3.1
function slug(text, { email = false } = {}) {
  let s = String(text == null ? '' : text).toLowerCase();
  if (email) s = s.replace(/@/g, '-at-').replace(/\./g, '-dot-');
  s = s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  s = s.slice(0, 50).replace(/-+$/g, '');
  return s || 'untitled';
}

// Section 3.3
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

function toIsoUtc(value) {
  if (value == null || value === '') return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function stampForName(value) {
  const iso = toIsoUtc(value);
  if (!iso) throw new Error(`Cannot build a folder timestamp from "${value}"`);
  return iso.slice(0, 19).replace('T', '_').replace(/:/g, '-');
}

// Section 3.2 and per-service folder names (sections 4-7)
function folderName(service, m) {
  switch (service) {
    case 'gmail': {
      const sender = (m.from && (m.from.email || m.from.name)) || 'unknown-sender';
      return `${stampForName(m.received_at)}_${slug(sender, { email: true })}_${String(m.message_id).slice(-8)}`;
    }
    case 'github': {
      const [owner, repo] = String(m.full_name).split('/');
      const part = (x) => String(x).toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
      return `${part(owner)}__${part(repo)}`;
    }
    case 'notion':
      return `${slug(m.title)}_${String(m.page_id).replace(/-/g, '').slice(0, 8).toLowerCase()}`;
    case 'linear':
      return `${m.identifier}_${slug(m.title)}`;
    default:
      throw new Error(`Unknown service "${service}"`);
  }
}

const FOLDER_PATTERNS = {
  gmail: /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_[a-z0-9-]+_[A-Za-z0-9_-]{1,8}$/,
  github: /^[a-z0-9._-]+__[a-z0-9._-]+$/,
  notion: /^[a-z0-9-]+_[a-f0-9]{8}$/,
  linear: /^[A-Z0-9]+-\d+_[a-z0-9-]+$/,
};

const SOURCE_ID_FIELD = { gmail: 'message_id', github: 'full_name', notion: 'page_id', linear: 'issue_id' };

const REQUIRED_FIELDS = {
  gmail: ['message_id', 'thread_id', 'subject', 'from', 'to', 'cc', 'bcc', 'reply_to', 'date_raw',
    'received_at', 'labels', 'snippet', 'is_unread', 'has_attachments', 'attachments',
    'size_estimate_bytes', 'web_url', 'extra'],
  github: ['repo_id', 'name', 'full_name', 'owner', 'description', 'html_url', 'visibility',
    'default_branch', 'primary_language', 'topics', 'license', 'homepage', 'stargazers_count',
    'watchers_count', 'forks_count', 'open_issues_count', 'is_fork', 'is_archived',
    'readme_present', 'created_at', 'updated_at', 'pushed_at', 'extra'],
  notion: ['page_id', 'title', 'url', 'object_type', 'parent', 'icon', 'created_time',
    'last_edited_time', 'created_by', 'last_edited_by', 'properties', 'child_pages', 'extra'],
  linear: ['issue_id', 'identifier', 'title', 'url', 'team', 'project', 'state', 'priority',
    'priority_label', 'assignee', 'creator', 'labels', 'estimate', 'due_date', 'cycle',
    'parent_identifier', 'created_at', 'updated_at', 'completed_at', 'extra'],
};

const TIMESTAMP_FIELDS = {
  gmail: ['received_at'],
  github: ['created_at', 'updated_at', 'pushed_at'],
  notion: ['created_time', 'last_edited_time'],
  linear: ['created_at', 'updated_at', 'completed_at'],
};

const REQUIRED_FILES = {
  gmail: ['metadata.json', 'body.txt'],
  github: ['metadata.json', 'issues.json', 'commits.json'],
  notion: ['metadata.json', 'content.md'],
  linear: ['metadata.json', 'description.md', 'comments.json'],
};

const ALLOWED_FILES = {
  gmail: ['metadata.json', 'body.txt', 'body.html'],
  github: ['metadata.json', 'README.md', 'issues.json', 'commits.json'],
  notion: ['metadata.json', 'content.md'],
  linear: ['metadata.json', 'description.md', 'comments.json'],
};

const EXPORT_FIELDS = ['schema_version', 'service', 'source_id', 'first_exported_at', 'exported_at',
  'export_run_id', 'source_query', 'mcp_server', 'mcp_tools_used'];

const RUN_ID = /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_(gmail|github|notion|linear)$/;

module.exports = {
  SCHEMA_VERSION, SERVICES, MCP_SERVERS, slug, ISO_UTC, toIsoUtc, stampForName, folderName,
  FOLDER_PATTERNS, SOURCE_ID_FIELD, REQUIRED_FIELDS, TIMESTAMP_FIELDS, REQUIRED_FILES,
  ALLOWED_FILES, EXPORT_FIELDS, RUN_ID,
};
