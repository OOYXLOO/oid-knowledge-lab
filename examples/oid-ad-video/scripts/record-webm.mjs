import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = path.join(root, 'public', 'ad.html');
const outPath = path.join(root, 'dist', 'oid-intelligence-lab-ad.webm');
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

await fs.mkdir(path.dirname(outPath), { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`);
  await page.click('#record');
  await page.waitForFunction(() => window.__recordingDone === true, null, { timeout: 45000 });
  const base64 = await page.evaluate(async () => {
    const buffer = await window.__recordingBlob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  });
  await fs.writeFile(outPath, Buffer.from(base64, 'base64'));
  const stat = await fs.stat(outPath);
  console.log(`Wrote ${outPath}`);
  console.log(`Bytes ${stat.size}`);
} finally {
  await browser.close();
}
