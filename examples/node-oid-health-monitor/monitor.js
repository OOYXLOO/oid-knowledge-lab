"use strict";

const http = require("node:http");

const sampleFindings = [
  {
    oid: "1.3.6.1.4.1",
    name: "Private Enterprise Numbers",
    severity: "medium",
    status: "open",
    owner: "platform"
  },
  {
    oid: "2.5.29.37",
    name: "Extended Key Usage",
    severity: "low",
    status: "triaged",
    owner: "security"
  },
  {
    oid: "1.3.6.1.5.5.7.3.1",
    name: "TLS Web Server Authentication",
    severity: "high",
    status: "open",
    owner: "security"
  }
];

function createSnapshot(findings) {
  const counts = {
    total: findings.length,
    open: 0,
    triaged: 0,
    resolved: 0,
    severity: {
      low: 0,
      medium: 0,
      high: 0
    }
  };

  findings.forEach((finding) => {
    counts[finding.status] = (counts[finding.status] || 0) + 1;
    counts.severity[finding.severity] = (counts.severity[finding.severity] || 0) + 1;
  });

  return {
    service: "oid-health-monitor",
    ok: counts.open === 0,
    counts,
    openFindings: findings.filter((finding) => finding.status === "open")
  };
}

function renderPrometheus(snapshot) {
  const lines = [
    "# HELP oid_findings_total Sanitized OID review findings by status.",
    "# TYPE oid_findings_total gauge",
    `oid_findings_total{status="open"} ${snapshot.counts.open}`,
    `oid_findings_total{status="triaged"} ${snapshot.counts.triaged}`,
    `oid_findings_total{status="resolved"} ${snapshot.counts.resolved}`,
    "# HELP oid_findings_by_severity Sanitized OID review findings by severity.",
    "# TYPE oid_findings_by_severity gauge",
    `oid_findings_by_severity{severity="low"} ${snapshot.counts.severity.low}`,
    `oid_findings_by_severity{severity="medium"} ${snapshot.counts.severity.medium}`,
    `oid_findings_by_severity{severity="high"} ${snapshot.counts.severity.high}`
  ];
  return `${lines.join("\n")}\n`;
}

function createServer(findings = sampleFindings) {
  return http.createServer((request, response) => {
    const snapshot = createSnapshot(findings);

    if (request.url === "/health") {
      response.writeHead(snapshot.ok ? 200 : 503, {
        "content-type": "application/json; charset=utf-8"
      });
      response.end(JSON.stringify(snapshot, null, 2));
      return;
    }

    if (request.url === "/metrics") {
      response.writeHead(200, {
        "content-type": "text/plain; version=0.0.4; charset=utf-8"
      });
      response.end(renderPrometheus(snapshot));
      return;
    }

    response.writeHead(404, {"content-type": "application/json; charset=utf-8"});
    response.end(JSON.stringify({error: "not_found"}));
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 4317);
  createServer().listen(port, () => {
    process.stdout.write(`OID health monitor listening on http://localhost:${port}\n`);
  });
}

module.exports = {
  createServer,
  createSnapshot,
  renderPrometheus,
  sampleFindings
};
