"use strict";

const fs = require("fs");
const path = require("path");
const { sha256 } = require("./net");
const { parseRobots, sitemapUrls } = require("./robots");

const SOURCE_URLS = {
  robots: "https://oid-base.com/robots.txt",
  sitemap: "https://oid-base.com/sitemap.xml",
  llms: "https://oid-base.com/llms.txt",
  terms: "https://oid-base.com/disclaimer.htm.md"
};

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
}

function groupsForUserAgent(groups, userAgent) {
  const normalized = String(userAgent || "*").toLowerCase();
  const exact = groups.filter((group) => group.agents.some((agent) => agent !== "*" && normalized.includes(agent)));
  return exact.length ? exact : groups.filter((group) => group.agents.includes("*"));
}

function disallowedPaths(robotsText, userAgent) {
  const groups = groupsForUserAgent(parseRobots(robotsText), userAgent);
  return uniqueSorted(groups
    .flatMap((group) => group.rules)
    .filter((rule) => rule.type === "disallow")
    .map((rule) => rule.path));
}

function extractLlmsLastUpdated(text) {
  const match = String(text || "").match(/Last updated:\s*([0-9-]+)/i);
  return match ? match[1] : null;
}

function summarizeTerms(text) {
  const normalized = String(text || "").replace(/\s+/g, " ");
  const mentionsAuthorization = /authorization/i.test(normalized);
  const mentionsSmallPart = /small part/i.test(normalized);
  const mentionsNoncommercial = /noncommercial/i.test(normalized);

  if (mentionsAuthorization && mentionsSmallPart && mentionsNoncommercial) {
    return "Copying is limited to noncommercial personal use and a small part unless specific authorization is granted.";
  }

  return "Review the source terms before expanding collection beyond sitemap metadata and small parser-validation samples.";
}

function buildSourcePolicySnapshot(options = {}) {
  const robotsText = options.robotsText || "";
  const llmsText = options.llmsText || "";
  const termsText = options.termsText || "";
  const sitemapUrl = options.sitemapUrl || sitemapUrls(robotsText)[0] || SOURCE_URLS.sitemap;
  const userAgent = options.userAgent || "oid-knowledge-lab";

  return {
    source: "OID-base",
    generated_at: options.generatedAt || new Date().toISOString(),
    source_urls: {
      robots: options.robotsUrl || SOURCE_URLS.robots,
      sitemap: sitemapUrl,
      llms: options.llmsUrl || SOURCE_URLS.llms,
      terms: options.termsUrl || SOURCE_URLS.terms
    },
    hashes: {
      robots: sha256(robotsText),
      llms: sha256(llmsText),
      terms: sha256(termsText)
    },
    robots: {
      user_agent: userAgent,
      disallowed_paths: disallowedPaths(robotsText, userAgent),
      sitemap_urls: sitemapUrls(robotsText)
    },
    llms: {
      last_updated: extractLlmsLastUpdated(llmsText)
    },
    sitemap: {
      oid_entries: Number(options.sitemapOidCount || 0)
    },
    terms: {
      summary: summarizeTerms(termsText),
      full_terms_copied: false
    },
    collection_boundary: {
      sitemap_metadata_publishable: true,
      small_parser_validation_samples: true,
      page_bodies_publishable_without_authorization: false,
      full_crawl_requires_authorization: true
    }
  };
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function renderSourcePolicyMarkdown(snapshot) {
  const disallowed = (snapshot.robots?.disallowed_paths || [])
    .map((item) => `- \`${item}\``)
    .join("\n") || "- none observed";

  return `# Source Policy Snapshot

Generated at: \`${snapshot.generated_at}\`

## Source URLs

- Robots: ${snapshot.source_urls.robots}
- Sitemap: ${snapshot.source_urls.sitemap}
- LLM summary: ${snapshot.source_urls.llms}
- Terms: ${snapshot.source_urls.terms}

## Collection Boundary

- OID entries from sitemap: \`${formatNumber(snapshot.sitemap?.oid_entries)}\`
- Sitemap metadata is publishable as a directory index.
- Small parser-validation samples are local evidence only.
- Full page-body crawl requires explicit authorization.
- Full OID-base page bodies are not publishable from this repository without authorization.

## Terms Summary

${snapshot.terms?.summary || "Review the source terms before expanding collection."}

The full terms text is not copied into this report. Use the terms URL and hash below for verification.

## Hashes

- robots: \`${snapshot.hashes?.robots}\`
- llms: \`${snapshot.hashes?.llms}\`
- terms: \`${snapshot.hashes?.terms}\`

## Robots Disallow Paths

Effective user-agent: \`${snapshot.robots?.user_agent || "oid-knowledge-lab"}\`

${disallowed}
`;
}

function writeSourcePolicyFiles({ snapshot, jsonFile, markdownFile }) {
  fs.mkdirSync(path.dirname(jsonFile), { recursive: true });
  fs.mkdirSync(path.dirname(markdownFile), { recursive: true });
  fs.writeFileSync(jsonFile, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  fs.writeFileSync(markdownFile, renderSourcePolicyMarkdown(snapshot), "utf8");
}

module.exports = {
  buildSourcePolicySnapshot,
  renderSourcePolicyMarkdown,
  writeSourcePolicyFiles
};
