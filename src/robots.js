"use strict";

function parseRobots(text) {
  const groups = [];
  let current = null;

  for (const rawLine of String(text || "").split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    if (!line) continue;
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1].toLowerCase();
    const value = match[2].trim();
    if (key === "user-agent") {
      current = { agents: [value.toLowerCase()], rules: [], sitemap: [] };
      groups.push(current);
      continue;
    }
    if (!current) continue;
    if (key === "disallow" || key === "allow") {
      current.rules.push({ type: key, path: value });
    }
    if (key === "sitemap") {
      current.sitemap.push(value);
    }
  }

  return groups;
}

function ruleMatches(rulePath, pathname) {
  if (!rulePath) return false;
  if (rulePath.endsWith("$")) {
    return pathname === rulePath.slice(0, -1);
  }
  return pathname.startsWith(rulePath);
}

function matchingGroups(groups, userAgent) {
  const normalized = String(userAgent || "*").toLowerCase();
  const exact = groups.filter((group) => group.agents.some((agent) => normalized.includes(agent) && agent !== "*"));
  if (exact.length) return exact;
  return groups.filter((group) => group.agents.includes("*"));
}

function isAllowedByRobots(robotsText, targetUrl, userAgent = "*") {
  const groups = matchingGroups(parseRobots(robotsText), userAgent);
  const target = new URL(targetUrl);
  const pathname = `${target.pathname}${target.search}`;
  let matched = null;

  for (const group of groups) {
    for (const rule of group.rules) {
      if (!ruleMatches(rule.path, pathname)) continue;
      if (!matched || rule.path.length > matched.path.length) {
        matched = rule;
      }
    }
  }

  return !matched || matched.type !== "disallow";
}

function sitemapUrls(robotsText) {
  return parseRobots(robotsText).flatMap((group) => group.sitemap);
}

module.exports = {
  isAllowedByRobots,
  parseRobots,
  sitemapUrls
};
