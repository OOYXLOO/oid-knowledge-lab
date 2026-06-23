"use strict";

const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const DEFAULT_USER_AGENT = "oid-knowledge-lab/0.1 responsible-research";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sha256(text) {
  return `sha256:${crypto.createHash("sha256").update(text).digest("hex")}`;
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function fetchText(url, options = {}) {
  const timeoutMs = options.timeoutMs || 30000;
  const userAgent = options.userAgent || DEFAULT_USER_AGENT;
  const redirectsLeft = options.redirectsLeft === undefined ? 5 : options.redirectsLeft;

  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === "http:" ? http : https;
    const request = client.get(parsed, {
      timeout: timeoutMs,
      headers: {
        "user-agent": userAgent,
        "accept": "text/plain,text/markdown,text/html,application/xml;q=0.9,*/*;q=0.5"
      }
    }, (response) => {
      const status = response.statusCode || 0;
      const location = response.headers.location;
      if ([301, 302, 303, 307, 308].includes(status) && location && redirectsLeft > 0) {
        response.resume();
        const nextUrl = new URL(location, parsed).toString();
        fetchText(nextUrl, { ...options, redirectsLeft: redirectsLeft - 1 }).then(resolve, reject);
        return;
      }

      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        if (status < 200 || status >= 300) {
          reject(new Error(`HTTP ${status} for ${url}`));
          return;
        }
        resolve({
          url,
          status,
          headers: response.headers,
          body
        });
      });
    });

    request.on("timeout", () => {
      request.destroy(new Error(`Timeout fetching ${url}`));
    });
    request.on("error", reject);
  });
}

module.exports = {
  DEFAULT_USER_AGENT,
  ensureDir,
  fetchText,
  sha256,
  sleep,
  writeJson
};
