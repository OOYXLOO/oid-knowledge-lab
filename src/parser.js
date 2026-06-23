"use strict";

const { sha256 } = require("./net");

function parseFrontMatter(markdown) {
  const text = String(markdown || "");
  if (!text.startsWith("---\n")) return { data: {}, body: text };
  const end = text.indexOf("\n---", 4);
  if (end === -1) return { data: {}, body: text };
  const raw = text.slice(4, end).trim();
  const data = {};

  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/\\"/g, '"');
    } else if (value.startsWith("[") && value.endsWith("]")) {
      value = value.slice(1, -1).split(",").map((part) => part.trim()).filter(Boolean);
    }
    data[key] = value;
  }

  return {
    data,
    body: text.slice(end + 4).replace(/^\r?\n/, "")
  };
}

function sectionNames(markdownBody) {
  const names = [];
  for (const line of String(markdownBody || "").split(/\r?\n/)) {
    const match = line.match(/^###\s+(.+?)\s*$/);
    if (match) names.push(match[1].trim());
  }
  return names;
}

function parseChildOids(markdownBody) {
  const marker = "### Child OIDs";
  const start = String(markdownBody || "").indexOf(marker);
  if (start === -1) return [];
  const after = markdownBody.slice(start + marker.length);
  const end = after.search(/\n###\s+/);
  const section = end === -1 ? after : after.slice(0, end);
  const children = [];

  for (const line of section.split(/\r?\n/)) {
    const match = line.match(/^-\s+`([^`]+)`:\s+`([^`]+)`/);
    if (match) {
      children.push({ oid: match[1], label: match[2] });
    }
  }

  return children;
}

function parseOidMarkdown(markdown, context = {}) {
  const { data, body } = parseFrontMatter(markdown);
  return {
    oid: data.oid || context.oid || null,
    source_url: context.source_url || null,
    markdown_url: context.markdown_url || null,
    sitemap_lastmod: context.sitemap_lastmod || null,
    last_modified: data["last-modified"] || context.sitemap_lastmod || null,
    asn1_notation: data["asn1-notation"] || null,
    description: data.description || null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    child_oids: parseChildOids(body),
    sections_present: sectionNames(body),
    body_hash: sha256(body),
    fetched_at: context.fetched_at || new Date().toISOString()
  };
}

module.exports = {
  parseChildOids,
  parseFrontMatter,
  parseOidMarkdown,
  sectionNames
};
