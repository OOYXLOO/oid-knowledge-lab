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
      return {
        oid: decodeURIComponent(oidPath),
        source_url: entry.loc,
        markdown_url: `https://oid-base.com/get-md/${oidPath}`,
        sitemap_lastmod: entry.lastmod
      };
    });
}

module.exports = {
  getOidEntries,
  parseSitemap
};
