"use strict";

const assert = require("assert");
const { renderSubmissionPage } = require("../src/renderSubmissionPage");

function testRendersSubmissionPageWithCoreLinks() {
  const html = renderSubmissionPage();

  assert.match(html, /Review Log Agent for Slack/);
  assert.match(html, /Submission Pack/);
  assert.match(html, /playground\.html/);
  assert.match(html, /media\/review-log-agent-slack-demo\.mp4/);
  assert.match(html, /docs\/architecture\.md/);
  assert.match(html, /docs\/devpost-field-pack\.md/);
  assert.match(html, /docs\/judge-verification\.md/);
  assert.match(html, /docs\/official-submission-requirements\.md/);
  assert.match(html, /Official submission requirements map/);
  assert.match(html, /docs\/reviewer-quickstart\.md/);
  assert.match(html, /does not require Slack credentials/);
  assert.match(html, /Submission Readiness/);
  assert.match(html, /public video/);
  assert.match(html, /Slack developer sandbox URL/);
  assert.match(html, /github\.com\/OOYXLOO\/oid-knowledge-lab/);
  assert.match(html, /public GitHub source snapshot/);
  assert.match(html, /Slack app manifest template/);
  assert.match(html, /Slack app handler contract/);
  assert.match(html, /Judge Fit Checklist/);
  assert.match(html, /New Slack Agent/);
  assert.match(html, /MCP-style tool wrapper/);
  assert.match(html, /Sandbox URL/);
  assert.match(html, /remaining account-side field, not a code gap/);
}

function testRendersNoPrivateMoneyLanguage() {
  const html = renderSubmissionPage();

  assert.doesNotMatch(html, new RegExp("money" + "-goal", "i"));
  assert.doesNotMatch(html, /payout/i);
  assert.doesNotMatch(html, /KYC/i);
}

testRendersSubmissionPageWithCoreLinks();
testRendersNoPrivateMoneyLanguage();

console.log("submission page tests passed");
