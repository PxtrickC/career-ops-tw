/**
 * lib/states.mjs — Single source of truth loader for templates/states.yml.
 *
 * Reads the canonical state list (id + label + aliases) from states.yml and
 * exposes helpers for validating / resolving status strings to the canonical
 * English label. All career-ops scripts that touch tracker status fields
 * (merge-tracker, verify-pipeline, normalize-statuses) MUST go through here
 * — no hardcoded canonical lists anywhere else.
 *
 * Aliases include legacy Spanish (evaluada, aplicado…), zh-TW (已申請, 面試中…),
 * and English shorthand (sent, skip…). The resolver normalizes any of them to
 * the canonical English label declared in states.yml.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const STATES_FILE = join(HERE, '..', 'templates', 'states.yml');

/**
 * Tiny YAML parser scoped to the exact structure of templates/states.yml.
 * Handles: `- id:`, `label:`, `aliases: [a, b, c]`, `description:`, `dashboard_group:`.
 * Comments (`#`) are stripped.
 */
function parseStatesYml(text) {
  const states = [];
  let cur = null;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/(^|\s)#.*$/, '').trimEnd();
    const idMatch = line.match(/^\s*-\s*id:\s*(\S.*?)\s*$/);
    if (idMatch) {
      if (cur) states.push(cur);
      cur = { id: idMatch[1], aliases: [] };
      continue;
    }
    if (!cur) continue;
    const labelMatch = line.match(/^\s*label:\s*(\S.*?)\s*$/);
    if (labelMatch) { cur.label = labelMatch[1]; continue; }
    const aliasMatch = line.match(/^\s*aliases:\s*\[(.*)\]\s*$/);
    if (aliasMatch) {
      cur.aliases = aliasMatch[1]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      continue;
    }
    const descMatch = line.match(/^\s*description:\s*(\S.*?)\s*$/);
    if (descMatch) { cur.description = descMatch[1]; continue; }
    const dgMatch = line.match(/^\s*dashboard_group:\s*(\S.*?)\s*$/);
    if (dgMatch) { cur.dashboard_group = dgMatch[1]; continue; }
  }
  if (cur) states.push(cur);
  return states;
}

let _cached = null;

function load() {
  if (_cached) return _cached;
  if (!existsSync(STATES_FILE)) {
    throw new Error(`states.yml not found at ${STATES_FILE}`);
  }
  _cached = parseStatesYml(readFileSync(STATES_FILE, 'utf-8'));
  if (_cached.length === 0) {
    throw new Error(`states.yml at ${STATES_FILE} parsed to 0 states — file format unexpected`);
  }
  return _cached;
}

/** Returns the full state list as parsed from states.yml. */
export function getStates() {
  return load();
}

/** Returns the array of canonical English labels in declaration order. */
export function getCanonicalLabels() {
  return load().map(s => s.label);
}

/** Returns the array of canonical lowercase ids in declaration order. */
export function getCanonicalIds() {
  return load().map(s => s.id);
}

/**
 * Resolve any status string (canonical label, canonical id, or alias) to the
 * canonical English label. Strips markdown bold and trailing dates first.
 * Returns null if no match.
 *
 * Accepts legacy Spanish (Evaluada, Aplicado), zh-TW (已申請, 面試中), and
 * shorthand (sent, skip). Special-cases duplicado/dup/repost → Discarded.
 */
export function resolveLabel(input) {
  if (input == null) return null;
  const clean = String(input)
    .replace(/\*\*/g, '')
    .replace(/\s+\d{4}-\d{2}-\d{2}.*$/, '')
    .trim();
  if (!clean) return null;
  const lower = clean.toLowerCase();

  for (const s of load()) {
    if (s.label.toLowerCase() === lower) return s.label;
    if (s.id.toLowerCase() === lower) return s.label;
    for (const a of s.aliases) {
      if (a.toLowerCase() === lower) return s.label;
    }
  }
  // Legacy: duplicate-style annotations historically meant Discarded
  if (/^(duplicado|dup\b|repost)/i.test(clean)) {
    const discarded = load().find(s => s.id === 'discarded');
    if (discarded) return discarded.label;
  }
  return null;
}

/**
 * Validate input status. Returns canonical English label, or falls back to
 * the named state id (default: 'evaluated') with a warning. Use this when
 * you need a guaranteed-non-null label and a soft failure mode.
 */
export function validateStatus(input, fallbackId = 'evaluated') {
  const resolved = resolveLabel(input);
  if (resolved) return resolved;
  const fallback = load().find(s => s.id === fallbackId);
  const fallbackLabel = fallback ? fallback.label : 'Evaluated';
  if (input != null && String(input).trim()) {
    console.warn(`⚠️  Non-canonical status "${input}" → defaulting to "${fallbackLabel}"`);
  }
  return fallbackLabel;
}

/**
 * Returns true if the input matches a canonical label, id, or known alias.
 * Use in verify-pipeline to flag rows whose status can't be resolved.
 */
export function isKnownStatus(input) {
  return resolveLabel(input) !== null;
}
