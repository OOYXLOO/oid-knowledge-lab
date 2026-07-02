"use strict";

const assert = require("assert");
const toolsHandler = require("../api/agent/tools");
const callHandler = require("../api/agent/call");

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    payload: undefined,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };
}

function createJsonRequest(method, payload) {
  const listeners = {};
  return {
    method,
    on(event, callback) {
      listeners[event] = callback;
      return this;
    },
    destroy() {},
    emitBody() {
      if (payload !== undefined) {
        listeners.data(Buffer.from(JSON.stringify(payload)));
      }
      listeners.end();
    }
  };
}

async function invoke(handler, request) {
  const response = createResponse();
  const result = handler(request, response);
  if (request.emitBody) {
    request.emitBody();
  }
  await result;
  return response;
}

async function testListsAgentTools() {
  const response = await invoke(toolsHandler, { method: "GET" });
  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.tools[0].name, "build_review_log");
  assert.match(response.payload.boundary, /sanitized Slack-style/);
}

async function testRejectsWrongMethod() {
  const response = await invoke(toolsHandler, { method: "POST" });
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.allow, "GET");
}

async function testCallsReviewLogTool() {
  const request = createJsonRequest("POST", {
    name: "build_review_log",
    arguments: {
      thread: {
        title: "API answer review",
        messages: [
          { kind: "question", text: "Can we publish this answer?" },
          { kind: "sourceFact", text: "The old token remains valid for 24 hours." }
        ]
      }
    }
  });
  const response = await invoke(callHandler, request);
  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.tool, "build_review_log");
  assert.match(response.payload.result.content[0].text, /# Evidence Log: API answer review/);
  assert.match(response.payload.boundary, /No Slack tokens/);
}

async function testRejectsUnknownTool() {
  const response = await invoke(callHandler, createJsonRequest("POST", { name: "missing_tool" }));
  assert.equal(response.statusCode, 422);
  assert.match(response.payload.error, /Unknown tool/);
}

(async () => {
  await testListsAgentTools();
  await testRejectsWrongMethod();
  await testCallsReviewLogTool();
  await testRejectsUnknownTool();
  console.log("agent api tests passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
