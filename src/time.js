"use strict";

function generatedTimestamp() {
  return process.env.OID_KNOWLEDGE_GENERATED_AT || new Date().toISOString();
}

module.exports = {
  generatedTimestamp
};
