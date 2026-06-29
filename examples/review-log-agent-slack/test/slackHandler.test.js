"use strict";

const assert = require("assert");
const crypto = require("crypto");
const {
  buildInteractivityResponse,
  buildSlashCommandResponse,
  threadFromText,
  verifySlackSignature
} = require("../src/slackHandler");

function sign(secret, timestamp, body) {
  return `v0=${crypto.createHmac("sha256", secret).update(`v0:${timestamp}:${body}`).digest("hex")}`;
}

function testThreadFromText() {
  const thread = threadFromText("Question: ship this?; Source: docs say yes; Risk: missing warning");
  assert.strictEqual(thread.messages.length, 3);
  assert.match(thread.messages[0].text, /Question/);
}

function testSlashCommandUnsignedDemo() {
  const result = buildSlashCommandResponse("text=Question%3A%20Can%20we%20publish%3F%0ASource%3A%20docs%20say%20yes");
  assert.strictEqual(result.statusCode, 200);
  assert.match(result.body.blocks[0].text.text, /Evidence Log/);
  assert.match(result.body.blocks[0].text.text, /Source Facts/);
}

function testInteractivityUnsignedDemo() {
  const payload = encodeURIComponent(JSON.stringify({ message: { text: "Question: publish? Source: docs say yes" } }));
  const result = buildInteractivityResponse(`payload=${payload}`);
  assert.strictEqual(result.statusCode, 200);
  assert.match(result.body.blocks[0].text.text, /Message Shortcut Review Log/);
}

function testSignatureVerification() {
  const secret = "test-secret";
  const body = "text=hello";
  const timestamp = "1800000000";
  const signature = sign(secret, timestamp, body);
  assert.deepStrictEqual(
    verifySlackSignature({ signingSecret: secret, timestamp, signature, rawBody: body, nowSeconds: 1800000000 }),
    { ok: true, mode: "signed" }
  );
  assert.strictEqual(
    verifySlackSignature({ signingSecret: secret, timestamp, signature: "v0=bad", rawBody: body, nowSeconds: 1800000000 }).ok,
    false
  );
}

testThreadFromText();
testSlashCommandUnsignedDemo();
testInteractivityUnsignedDemo();
testSignatureVerification();

console.log("slack handler tests passed");
