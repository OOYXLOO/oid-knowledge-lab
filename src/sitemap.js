"use strict";

function decodeXml(text) {
  return String(text || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseSitemap(text) {
  const urls = [];
  const urlBlocks = String(text || "").match(/<url>[\s\S]*?<\/url>/g) || [];
  for (const block of urlBlocks) {
    const loc = block.match(/<loc>([\s\S]*?)<\/loc>/);
    const lastmod = block.match(/<lastmod>([\s\S]*?)<\/lastmod>/);
    if (!loc) continue;
    urls.push({
      loc: decodeXml(loc[1].trim()),
      lastmod: lastmod ? decodeXml(lastmod[1].trim()) : null
    });
  }
  return urls;
}

function getOidEntries(urls) {
  return urls
    .filter((entry) => entry.loc.startsWith("https://oid-base.com/get/"))
    .map((entry) => {
      const oidPath = entry.loc.slice("https://oid-base.com/get/".length);
      const oid = decodeURIComponent(oidPath);
      return {
        oid,
        source_url: entry.loc,
        markdown_url: `https://oid-base.com/get-md/${oidPath}`,
        sitemap_lastmod: entry.lastmod,
        root_arc: String(oid).split(".")[0] || null,
        depth: String(oid).split(".").filter(Boolean).length
      };
    });
}

function countBy(items, keyFn) {
  const counts = new Map();
  for (const item of items) {
    const key = keyFn(item) || "unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .map(([key, count]) => ({ key, count }));
}

function buildSitemapIndex(entries, meta = {}) {
  const sorted = [...entries].sort((a, b) => String(a.oid).localeCompare(String(b.oid), "en", { numeric: true }));
  const latest = [...entries]
    .filter((entry) => entry.sitemap_lastmod)
    .sort((a, b) => String(b.sitemap_lastmod).localeCompare(String(a.sitemap_lastmod)))
    .slice(0, 20)
    .map((entry) => ({
      oid: entry.oid,
      source_url: entry.source_url,
      sitemap_lastmod: entry.sitemap_lastmod
    }));

  return {
    source_url: meta.sourceUrl || "https://oid-base.com/sitemap.xml",
    source_kind: "sitemap metadata",
    generated_at: meta.generatedAt || new Date().toISOString(),
    content_boundary: "This index contains sitemap metadata only; it does not copy OID-base page bodies.",
    oid_count: sorted.length,
    root_arc_counts: countBy(sorted, (entry) => entry.root_arc),
    depth_counts: countBy(sorted, (entry) => String(entry.depth)),
    lastmod_year_counts: countBy(sorted, (entry) => String(entry.sitemap_lastmod || "").slice(0, 4)).filter((entry) => entry.key !== "unknown"),
    latest_sitemap_updates: latest,
    entries: sorted
  };
}

module.exports = {
  buildSitemapIndex,
  getOidEntries,
  parseSitemap
};
