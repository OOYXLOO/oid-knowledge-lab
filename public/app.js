(function () {
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  const count = document.querySelector("[data-search-count]");
  const index = Array.isArray(window.OID_KNOWLEDGE_INDEX) ? window.OID_KNOWLEDGE_INDEX : [];

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalize(value) {
    return String(value == null ? "" : value).trim().toLowerCase();
  }

  function matches(record, query) {
    if (!query) return true;
    return String(record.number).includes(query) ||
      normalize(record.oid).includes(query) ||
      normalize(record.organization).includes(query);
  }

  function render() {
    if (!input || !results || !count) return;
    const query = normalize(input.value);
    const matchesList = index.filter((record) => matches(record, query));
    const shown = matchesList.slice(0, query ? 25 : 12);
    count.textContent = query
      ? "Showing " + shown.length.toLocaleString("en-US") + " of " + matchesList.length.toLocaleString("en-US") + " matches"
      : "Showing first " + shown.length.toLocaleString("en-US") + " of " + index.length.toLocaleString("en-US") + " searchable assignments";
    results.innerHTML = "<table><thead><tr><th>Number</th><th>OID</th><th>Organization</th></tr></thead><tbody>" +
      shown.map((record) => "<tr><td>" + Number(record.number).toLocaleString("en-US") + "</td><td><code>" + escapeHtml(record.oid) + "</code></td><td>" + escapeHtml(record.organization) + "</td></tr>").join("") +
      "</tbody></table>";
  }

  if (input) input.addEventListener("input", render);
  render();
}());
