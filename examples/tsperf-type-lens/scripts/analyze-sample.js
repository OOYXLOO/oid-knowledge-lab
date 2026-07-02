"use strict";

const path = require("path");
const { analyzeFile, markdownReport } = require("../src/analyzer");

const file = process.argv[2] || path.join(__dirname, "..", "samples", "heavy-types.ts");
const result = analyzeFile(file);
console.log(markdownReport(result));
