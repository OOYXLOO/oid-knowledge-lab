"use strict";

const vscode = require("vscode");
const { analyzeFile, driverSummary, markdownReport } = require("./analyzer");

const SUPPORTED = [
  { language: "typescript", scheme: "file" },
  { language: "typescriptreact", scheme: "file" }
];

function config() {
  const cfg = vscode.workspace.getConfiguration("tsperfTypeLens");
  return {
    minimumScore: cfg.get("minimumScore", 20),
    maximumItems: cfg.get("maximumItems", 50)
  };
}

function metricTitle(metric) {
  return `TSPerf ${metric.score} · ${metric.checkerTotalMs}ms checker · depth ${metric.typeDepth} · ${driverSummary(metric, 3)}`;
}

class TypeLensProvider {
  provideCodeLenses(document) {
    if (document.isUntitled || document.isDirty) {
      const range = new vscode.Range(0, 0, 0, 0);
      return [
        new vscode.CodeLens(range, {
          title: "TSPerf Type Lens: save file to analyze",
          command: "tsperfTypeLens.openReport"
        })
      ];
    }
    const { minimumScore, maximumItems } = config();
    let result;
    try {
      result = analyzeFile(document.uri.fsPath);
    } catch (error) {
      const range = new vscode.Range(0, 0, 0, 0);
      return [
        new vscode.CodeLens(range, {
          title: `TSPerf Type Lens error: ${error.message}`,
          command: "tsperfTypeLens.openReport"
        })
      ];
    }
    return result.metrics
      .filter((metric) => metric.score >= minimumScore)
      .slice(0, maximumItems)
      .map((metric) => {
        const range = new vscode.Range(Math.max(0, metric.line - 1), 0, Math.max(0, metric.line - 1), 0);
        return new vscode.CodeLens(range, {
          title: metricTitle(metric),
          command: "tsperfTypeLens.openReport",
          arguments: [document.uri.fsPath]
        });
      });
  }
}

async function openReport(fileName) {
  const target = fileName || vscode.window.activeTextEditor?.document.uri.fsPath;
  if (!target) {
    vscode.window.showWarningMessage("Open a TypeScript file before running TSPerf Type Lens.");
    return;
  }
  try {
    const result = analyzeFile(target);
    const doc = await vscode.workspace.openTextDocument({
      language: "markdown",
      content: markdownReport(result)
    });
    await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });
  } catch (error) {
    vscode.window.showErrorMessage(`TSPerf Type Lens failed: ${error.message}`);
  }
}

function activate(context) {
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(SUPPORTED, new TypeLensProvider()),
    vscode.commands.registerCommand("tsperfTypeLens.openReport", openReport)
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
