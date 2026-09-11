/* Guardrails Discovery — UI controller. Depends on window.GDW (worksheets.js)
   and window.GDWalk (walkthrough.js). */
(function () {
  "use strict";

  var STORAGE_KEY = "gd_state_v1";
  var G = window.GDW;
  var W = window.GDWalk;
  var state = G.emptyState();

  var SCREENS = [
    "screen-intro", "screen-1", "screen-2", "screen-3",
    "screen-pick", "screen-w-data", "screen-w-authority", "screen-w-risk", "screen-w-controls",
    "screen-summary", "screen-inventory", "screen-shared"
  ];

  function $(id) { return document.getElementById(id); }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      var fresh = G.emptyState();
      return Object.assign(fresh, parsed);
    } catch (e) {
      return null;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* localStorage unavailable (private browsing, quota) — degrade silently, in-memory state still works for this session */
    }
  }

  function hasAnyProgress(s) {
    return (
      (s.section1.selectedTools && s.section1.selectedTools.length > 0) ||
      (s.section2.apps && Object.keys(s.section2.apps).some(function (k) { return s.section2.apps[k] && s.section2.apps[k].inUse; })) ||
      (s.section3.systems && s.section3.systems.length > 0) ||
      !!s.section3.hasInternal
    );
  }

  function showScreen(id) {
    SCREENS.forEach(function (s) {
      var node = $(s);
      if (node) node.hidden = s !== id;
    });
    state.lastScreen = id;
    saveState();
    updateProgress(id);
    window.scrollTo(0, 0);
  }

  var WALK_SCREEN_INDEX = { "screen-w-data": 1, "screen-w-authority": 2, "screen-w-risk": 3, "screen-w-controls": 4 };

  function updateProgress(id) {
    var progress = $("progress");
    var inventoryMap = { "screen-1": [1, 33], "screen-2": [2, 66], "screen-3": [3, 100] };
    if (inventoryMap[id]) {
      progress.hidden = false;
      $("progress-label").textContent = "Section " + inventoryMap[id][0] + " of 3";
      $("progress-fill").style.width = inventoryMap[id][1] + "%";
    } else if (WALK_SCREEN_INDEX[id]) {
      progress.hidden = false;
      $("progress-label").textContent = "Decision " + WALK_SCREEN_INDEX[id] + " of 4";
      $("progress-fill").style.width = (WALK_SCREEN_INDEX[id] * 25) + "%";
    } else {
      progress.hidden = true;
    }
  }

  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("visible");
    setTimeout(function () { t.classList.remove("visible"); }, 2600);
  }

  /* ---------------- Screen 1: Direct AI tools ---------------- */

  function renderScreen1() {
    var toolsHtml = G.TOOLS.map(function (t) {
      var checked = state.section1.selectedTools.indexOf(t.id) !== -1 ? "checked" : "";
      return (
        '<label class="check-item"><input type="checkbox" data-tool="' + t.id + '" ' + checked + '> ' + t.name + "</label>"
      );
    }).join("");

    var otherChecked = state.section1.selectedTools.indexOf("other") !== -1;
    toolsHtml +=
      '<label class="check-item"><input type="checkbox" data-tool="other" ' + (otherChecked ? "checked" : "") + "> Other</label>" +
      (otherChecked
        ? '<input type="text" class="other-text" id="other-tool-text" aria-label="Name the other AI tool" placeholder="Name it" value="' + escapeAttr(state.section1.otherTool) + '">'
        : "");

    $("tools-list").innerHTML = toolsHtml;

    renderToolFollowups();

    var anySelected = state.section1.selectedTools.length > 0;
    $("q-sensitivity").hidden = !anySelected;
    $("q-visibility").hidden = !anySelected;

    if (anySelected) {
      $("sensitivity-list").innerHTML = G.SENSITIVITY.map(function (s) {
        var checked = state.section1.sensitivity === s.id ? "checked" : "";
        return '<label class="radio-item"><input type="radio" name="sensitivity" value="' + s.id + '" ' + checked + "> " + s.label + "</label>";
      }).join("");

      $("visibility-list").innerHTML = G.VISIBILITY.map(function (v) {
        var checked = state.section1.visibility === v.id ? "checked" : "";
        return '<label class="radio-item"><input type="radio" name="visibility" value="' + v.id + '" ' + checked + "> " + v.label + "</label>";
      }).join("");
    }
  }

  function renderToolFollowups() {
    var container = $("tool-followups");
    var tools = state.section1.selectedTools;
    if (tools.length === 0) {
      container.innerHTML = "";
      return;
    }
    container.innerHTML = tools
      .map(function (id) {
        var label = id === "other" ? state.section1.otherTool || "that tool" : G.toolDisplayName(id);
        var purposes = state.section1.purposesByTool[id] || [];
        var otherVal = state.section1.otherPurposeByTool[id] || "";
        var checks = G.PURPOSES.map(function (p) {
          var checked = purposes.indexOf(p) !== -1 ? "checked" : "";
          return '<label class="check-item"><input type="checkbox" data-tool="' + id + '" data-purpose="' + escapeAttr(p) + '" ' + checked + "> " + p + "</label>";
        }).join("");
        var otherChecked = otherVal !== "" || purposes.indexOf("__other__") !== -1;
        checks +=
          '<label class="check-item"><input type="checkbox" data-tool="' + id + '" data-purpose="__other__" ' + (purposes.indexOf("__other__") !== -1 ? "checked" : "") + "> Something else</label>" +
          (purposes.indexOf("__other__") !== -1
            ? '<input type="text" class="other-text" data-other-purpose="' + id + '" aria-label="Describe the other purpose" placeholder="Describe it" value="' + escapeAttr(otherVal) + '">'
            : "");
        return (
          '<div class="discover-question subblock"><span class="q-label">What does your team use ' + escapeHtml(label) + " for?</span>" +
          '<div class="check-list">' + checks + "</div></div>"
        );
      })
      .join("");
  }

  function wireScreen1() {
    $("tools-list").addEventListener("change", function (e) {
      var t = e.target;
      if (t.matches("input[data-tool]")) {
        var id = t.getAttribute("data-tool");
        var idx = state.section1.selectedTools.indexOf(id);
        if (t.checked && idx === -1) state.section1.selectedTools.push(id);
        if (!t.checked && idx !== -1) state.section1.selectedTools.splice(idx, 1);
        saveState();
        renderScreen1();
      }
    });
    $("tools-list").addEventListener("input", function (e) {
      if (e.target.id === "other-tool-text") {
        state.section1.otherTool = e.target.value;
        saveState();
      }
    });

    $("tool-followups").addEventListener("change", function (e) {
      var t = e.target;
      if (t.matches("input[data-purpose]")) {
        var toolId = t.getAttribute("data-tool");
        var purpose = t.getAttribute("data-purpose");
        var list = state.section1.purposesByTool[toolId] || (state.section1.purposesByTool[toolId] = []);
        var idx = list.indexOf(purpose);
        if (t.checked && idx === -1) list.push(purpose);
        if (!t.checked && idx !== -1) list.splice(idx, 1);
        renderToolFollowups();
        saveState();
      }
    });
    $("tool-followups").addEventListener("input", function (e) {
      if (e.target.matches("[data-other-purpose]")) {
        var toolId = e.target.getAttribute("data-other-purpose");
        state.section1.otherPurposeByTool[toolId] = e.target.value;
        saveState();
      }
    });

    $("q-sensitivity").addEventListener("change", function (e) {
      if (e.target.name === "sensitivity") {
        state.section1.sensitivity = e.target.value;
        saveState();
      }
    });
    $("q-visibility").addEventListener("change", function (e) {
      if (e.target.name === "visibility") {
        state.section1.visibility = e.target.value;
        saveState();
      }
    });

    $("s1-back").addEventListener("click", function () { showScreen("screen-intro"); });
    $("s1-next").addEventListener("click", function () { showScreen("screen-2"); });
  }

  /* ---------------- Screen 2: Business app AI features ---------------- */

  function appRow(app) {
    var row = state.section2.apps[app.id] || { inUse: false, hasAI: "", features: [], otherFeature: "", data: [], otherData: "" };
    state.section2.apps[app.id] = row;

    var body = "";
    if (row.inUse) {
      body += '<div class="discover-question" style="margin:14px 0 0;">';
      body += '<span class="q-label">Does ' + escapeHtml(app.name) + " have AI features you know of?</span>";
      body += '<div class="radio-list">';
      G.INTERNAL_YESNO.forEach(function (opt) {
        var checked = row.hasAI === opt.id ? "checked" : "";
        body += '<label class="radio-item"><input type="radio" name="hasAI-' + app.id + '" value="' + opt.id + '" ' + checked + "> " + opt.label + "</label>";
      });
      body += "</div></div>";

      if (row.hasAI === "unsure") {
        body += '<p class="q-hint" style="margin-left:0;">No problem — check your admin settings or ask whoever manages this account. You can always come back and update this later.</p>';
      }

      if (row.hasAI === "yes") {
        var featureChecks = app.features
          .map(function (f) {
            var checked = row.features.indexOf(f) !== -1 ? "checked" : "";
            return '<label class="check-item"><input type="checkbox" data-app="' + app.id + '" data-feature="' + escapeAttr(f) + '" ' + checked + "> " + f + "</label>";
          })
          .join("");
        featureChecks +=
          '<label class="check-item"><input type="checkbox" data-app="' + app.id + '" data-feature="__other__" ' + (row.features.indexOf("__other__") !== -1 ? "checked" : "") + "> Something else</label>" +
          (row.features.indexOf("__other__") !== -1
            ? '<input type="text" class="other-text" data-other-feature="' + app.id + '" aria-label="Describe the other AI feature" placeholder="Describe it" value="' + escapeAttr(row.otherFeature) + '">'
            : "");

        var dataChecks = app.data
          .map(function (d) {
            var checked = row.data.indexOf(d) !== -1 ? "checked" : "";
            return '<label class="check-item"><input type="checkbox" data-app="' + app.id + '" data-data="' + escapeAttr(d) + '" ' + checked + "> " + d + "</label>";
          })
          .join("");
        dataChecks +=
          '<label class="check-item"><input type="checkbox" data-app="' + app.id + '" data-data="__other__" ' + (row.data.indexOf("__other__") !== -1 ? "checked" : "") + "> Something else</label>" +
          (row.data.indexOf("__other__") !== -1
            ? '<input type="text" class="other-text" data-other-data="' + app.id + '" aria-label="Describe the other data it can access" placeholder="Describe it" value="' + escapeAttr(row.otherData) + '">'
            : "");

        body +=
          '<div class="discover-question" style="margin:14px 0 0;"><span class="q-label">What\'s enabled?</span><div class="check-list">' + featureChecks + "</div></div>" +
          '<div class="discover-question" style="margin:14px 0 0;"><span class="q-label">What data can it access?</span><div class="check-list">' + dataChecks + "</div></div>";
      }
    }

    return (
      '<div class="app-row" data-app-row="' + app.id + '">' +
      '<div class="app-head"><label><input type="checkbox" data-app-inuse="' + app.id + '" ' + (row.inUse ? "checked" : "") + "> " + app.name + "</label></div>" +
      body +
      "</div>"
    );
  }

  function renderScreen2() {
    var html = G.APPS.map(appRow).join("");

    var other = state.section2Other;
    html +=
      '<div class="app-row"><div class="app-head"><label><input type="checkbox" id="other-app-inuse" ' + (other.inUse ? "checked" : "") + "> Other business app with AI</label></div>" +
      (other.inUse
        ? '<div class="discover-question" style="margin:14px 0 0;"><span class="q-label">Which app, and what does it do?</span>' +
          '<input type="text" class="other-text" id="other-app-name" aria-label="Other app name" placeholder="App name" value="' + escapeAttr(other.name) + '" style="margin-left:0;display:block;margin-bottom:8px;">' +
          '<input type="text" class="other-text" id="other-app-feature" aria-label="What AI feature the other app has" placeholder="What AI feature it has" value="' + escapeAttr(other.feature) + '" style="margin-left:0;display:block;margin-bottom:8px;">' +
          '<input type="text" class="other-text" id="other-app-data" aria-label="What data the other app can access" placeholder="What data it can access" value="' + escapeAttr(other.data) + '" style="margin-left:0;display:block;">' +
          "</div>"
        : "") +
      "</div>";

    $("apps-list").innerHTML = html;
  }

  function wireScreen2() {
    $("apps-list").addEventListener("change", function (e) {
      var t = e.target;
      var reRender = false;

      if (t.matches("[data-app-inuse]")) {
        var id = t.getAttribute("data-app-inuse");
        var row = state.section2.apps[id] || (state.section2.apps[id] = { inUse: false, hasAI: "", features: [], otherFeature: "", data: [], otherData: "" });
        row.inUse = t.checked;
        reRender = true;
      } else if (t.name && t.name.indexOf("hasAI-") === 0) {
        var appId = t.name.slice(6);
        state.section2.apps[appId].hasAI = t.value;
        reRender = true;
      } else if (t.matches("[data-feature]")) {
        var fAppId = t.getAttribute("data-app");
        var feature = t.getAttribute("data-feature");
        var frow = state.section2.apps[fAppId];
        var fidx = frow.features.indexOf(feature);
        if (t.checked && fidx === -1) frow.features.push(feature);
        if (!t.checked && fidx !== -1) frow.features.splice(fidx, 1);
        reRender = true;
      } else if (t.matches("[data-data]")) {
        var dAppId = t.getAttribute("data-app");
        var dataVal = t.getAttribute("data-data");
        var drow = state.section2.apps[dAppId];
        var didx = drow.data.indexOf(dataVal);
        if (t.checked && didx === -1) drow.data.push(dataVal);
        if (!t.checked && didx !== -1) drow.data.splice(didx, 1);
        reRender = true;
      } else if (t.id === "other-app-inuse") {
        state.section2Other.inUse = t.checked;
        reRender = true;
      }

      saveState();
      if (reRender) renderScreen2();
    });

    $("apps-list").addEventListener("input", function (e) {
      var t = e.target;
      if (t.matches("[data-other-feature]")) {
        state.section2.apps[t.getAttribute("data-other-feature")].otherFeature = t.value;
      } else if (t.matches("[data-other-data]")) {
        state.section2.apps[t.getAttribute("data-other-data")].otherData = t.value;
      } else if (t.id === "other-app-name") {
        state.section2Other.name = t.value;
      } else if (t.id === "other-app-feature") {
        state.section2Other.feature = t.value;
      } else if (t.id === "other-app-data") {
        state.section2Other.data = t.value;
      } else {
        return;
      }
      saveState();
    });

    $("s2-back").addEventListener("click", function () { showScreen("screen-1"); });
    $("s2-next").addEventListener("click", function () { showScreen("screen-3"); });
  }

  /* ---------------- Screen 3: Internal systems ---------------- */

  function renderScreen3() {
    $("internal-yesno-list").innerHTML = G.INTERNAL_YESNO.map(function (o) {
      var checked = state.section3.hasInternal === o.id ? "checked" : "";
      return '<label class="radio-item"><input type="radio" name="internal-yesno" value="' + o.id + '" ' + checked + "> " + o.label + "</label>";
    }).join("");

    var showSystems = state.section3.hasInternal === "yes";
    $("systems-block").hidden = !showSystems;
    if (showSystems) renderSystemsList();
  }

  function renderSystemsList() {
    var html = state.section3.systems
      .map(function (sys, i) {
        return (
          '<div class="system-entry" data-index="' + i + '">' +
          '<button type="button" class="remove-system" data-remove="' + i + '">Remove</button>' +
          '<div class="field"><label for="sys-name-' + i + '">System name</label><input type="text" id="sys-name-' + i + '" data-field="name" data-index="' + i + '" value="' + escapeAttr(sys.name) + '" placeholder="e.g. Document intake agent"></div>' +
          '<div class="field"><label for="sys-purpose-' + i + '">What does it do?</label><input type="text" id="sys-purpose-' + i + '" data-field="purpose" data-index="' + i + '" value="' + escapeAttr(sys.purpose) + '" placeholder="e.g. Processes incoming invoices"></div>' +
          '<div class="field"><label for="sys-model-' + i + '">What model or service does it use?</label><input type="text" id="sys-model-' + i + '" data-field="model" data-index="' + i + '" value="' + escapeAttr(sys.model) + '" placeholder="e.g. Claude API, OpenAI, an internal model"></div>' +
          '<div class="field"><label for="sys-data-' + i + '">What data can it access?</label><input type="text" id="sys-data-' + i + '" data-field="dataAccess" data-index="' + i + '" value="' + escapeAttr(sys.dataAccess) + '" placeholder="e.g. Internal invoices"></div>' +
          '<div class="field"><label for="sys-maintainer-' + i + '">Who maintains it?</label><input type="text" id="sys-maintainer-' + i + '" data-field="maintainedBy" data-index="' + i + '" value="' + escapeAttr(sys.maintainedBy) + '" placeholder="e.g. Finance team"></div>' +
          "</div>"
        );
      })
      .join("");
    $("systems-list").innerHTML = html;
  }

  function wireScreen3() {
    $("internal-yesno-list").addEventListener("change", function (e) {
      if (e.target.name === "internal-yesno") {
        state.section3.hasInternal = e.target.value;
        if (e.target.value === "yes" && state.section3.systems.length === 0) {
          state.section3.systems.push({ name: "", purpose: "", model: "", dataAccess: "", maintainedBy: "" });
        }
        saveState();
        renderScreen3();
      }
    });

    $("add-system").addEventListener("click", function () {
      state.section3.systems.push({ name: "", purpose: "", model: "", dataAccess: "", maintainedBy: "" });
      saveState();
      renderSystemsList();
    });

    $("systems-list").addEventListener("click", function (e) {
      if (e.target.matches("[data-remove]")) {
        var idx = parseInt(e.target.getAttribute("data-remove"), 10);
        state.section3.systems.splice(idx, 1);
        saveState();
        renderSystemsList();
      }
    });

    $("systems-list").addEventListener("input", function (e) {
      if (e.target.matches("[data-field]")) {
        var idx = parseInt(e.target.getAttribute("data-index"), 10);
        var field = e.target.getAttribute("data-field");
        if (state.section3.systems[idx]) {
          state.section3.systems[idx][field] = e.target.value;
          saveState();
        }
      }
    });

    $("s3-back").addEventListener("click", function () { showScreen("screen-2"); });
    $("s3-next").addEventListener("click", function () {
      state.completedAt = new Date().toISOString();
      saveState();
      renderPick();
      showScreen("screen-pick");
    });
  }

  /* ---------------- Inventory summary (shared by screen-pick teaser, screen-inventory, share view) ---------------- */

  function renderSummaryHTML(s) {
    var systems = G.allSystems(s);
    var byCategory = {};
    systems.forEach(function (sys) {
      (byCategory[sys.category] = byCategory[sys.category] || []).push(sys);
    });

    var order = ["Direct AI tool", "Business app AI feature", "Business app — AI status unknown", "Internal system"];
    var titles = {
      "Direct AI tool": "Direct AI Tools",
      "Business app AI feature": "AI Features in Business Apps",
      "Business app — AI status unknown": "Worth Double-Checking",
      "Internal system": "Internal Systems"
    };

    var html = "";
    if (systems.length === 0) {
      html += '<p class="summary-empty">No AI use was reported. If that\'s accurate, that\'s worth revisiting periodically — AI features get added to software quietly.</p>';
    }
    order.forEach(function (cat) {
      if (!byCategory[cat]) return;
      html += '<div class="summary-group"><h3>' + titles[cat] + "</h3>";
      byCategory[cat].forEach(function (sys) {
        html +=
          '<div class="summary-item"><span class="name">' + escapeHtml(sys.name) + "</span>" +
          '<div class="meta">' + escapeHtml(sys.detail) + " &middot; accesses: " + escapeHtml(sys.dataAccess) + (sys.owner ? " &middot; maintained by " + escapeHtml(sys.owner) : "") + "</div></div>";
      });
      html += "</div>";
    });

    if (s.section1.selectedTools.length > 0 && s.section1.visibility) {
      var v = G.VISIBILITY.filter(function (x) { return x.id === s.section1.visibility; })[0];
      html += '<div class="summary-group"><h3>Visibility</h3><p style="font-size:15px;margin:0;">' + (v ? escapeHtml(v.label) : "") + "</p></div>";
    }

    return html;
  }

  function renderInventorySummary() {
    $("summary-content").innerHTML = renderSummaryHTML(state);
  }

  function wireScreenInventory() {
    $("s4-back").addEventListener("click", function () { showScreen("screen-pick"); });
    $("s4-restart").addEventListener("click", function () {
      if (window.confirm("Clear everything you've entered and start over?")) {
        state = G.emptyState();
        saveState();
        renderAllScreens();
        showScreen("screen-intro");
      }
    });

    $("export-md").addEventListener("click", function () {
      G.downloadTextFile("ai-discovery-worksheet.md", G.buildFullMarkdown(state), "text/markdown;charset=utf-8");
      toast("Downloaded ai-discovery-worksheet.md");
    });

    $("export-pdf").addEventListener("click", function () {
      try {
        var doc = G.buildPdf(state);
        doc.save("ai-discovery-worksheet.pdf");
        toast("Downloaded ai-discovery-worksheet.pdf");
      } catch (e) {
        toast("PDF tool didn't load — printing instead. Choose “Save as PDF” in the print dialog.");
        document.body.classList.add("print-summary-only");
        window.print();
        setTimeout(function () { document.body.classList.remove("print-summary-only"); }, 500);
      }
    });

    $("export-share").addEventListener("click", function () {
      var encoded = G.encodeShareState(state);
      var url = location.origin + location.pathname + "?share=" + encoded;
      var box = $("share-box");
      box.innerHTML =
        '<div style="margin-bottom:8px;">Anyone with this link can see a read-only copy of this summary. It\'s not stored anywhere except in the link itself.</div>' +
        '<input type="text" readonly value="' + escapeAttr(url) + '" style="width:100%;padding:8px;font-size:13px;background:var(--color-bg);border:1px solid var(--color-divider);border-radius:var(--radius-md);color:var(--color-text);margin-bottom:8px;" onclick="this.select()">' +
        '<button type="button" class="btn btn-secondary" id="copy-share-link">Copy link</button>';
      box.classList.add("visible");
      $("copy-share-link").addEventListener("click", function () {
        var input = box.querySelector("input");
        input.select();
        var copied = false;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () { toast("Link copied"); }).catch(function () {});
          copied = true;
        }
        if (!copied) {
          try { document.execCommand("copy"); toast("Link copied"); } catch (e) { /* selection is still visible for manual copy */ }
        }
      });
    });

    $("inventory-to-pick").addEventListener("click", function () { renderPick(); showScreen("screen-pick"); });
  }

  /* ---------------- Screen: Pick a system to walk through ---------------- */

  function renderPick() {
    var systems = G.allSystems(state);
    var body = $("pick-body");
    var actions = $("pick-actions");

    if (systems.length === 0) {
      body.innerHTML = '<p class="summary-empty">You didn\'t identify any AI systems in the checklist. If that\'s accurate, that\'s worth revisiting periodically — AI features get added to software quietly.</p>';
      actions.innerHTML = '<button type="button" class="btn btn-primary" id="pick-none-back">← Back to the checklist</button>';
      $("pick-count").textContent = "You didn't identify any AI systems yet.";
      return;
    }

    $("pick-count").textContent = "You identified " + systems.length + " AI " + (systems.length === 1 ? "system" : "systems") + ". Which one concerns you most?";

    var currentKey = state.walkthrough && state.walkthrough.systemKey;
    body.innerHTML = systems.map(function (sys) {
      var key = W.systemKeyFor(sys);
      var checked = key === currentKey ? "checked" : "";
      return (
        '<label class="radio-item pick-item"><input type="radio" name="pick-system" value="' + escapeAttr(key) + '" ' + checked + '>' +
        '<span class="name">' + escapeHtml(sys.name) + '</span>' +
        '<span class="meta">' + escapeHtml(sys.category) + (sys.detail ? " &middot; " + escapeHtml(sys.detail) : "") + "</span>" +
        "</label>"
      );
    }).join("");

    actions.innerHTML =
      '<button type="button" class="btn-link" id="pick-back">← Back to the checklist</button>' +
      '<button type="button" class="btn-link" id="pick-skip">Skip — just download my inventory</button>' +
      '<button type="button" class="btn btn-primary" id="pick-continue" ' + (currentKey ? "" : "disabled") + '>Continue →</button>';
  }

  // Wired once at init — #pick-body and #pick-actions are persistent containers
  // that renderPick() only ever rewrites via innerHTML, so delegated listeners
  // here never need re-binding (re-binding on every render would stack up
  // duplicate handlers on those two elements).
  function wireScreenPick() {
    $("pick-body").addEventListener("change", function (e) {
      if (e.target.name !== "pick-system") return;
      var continueBtn = $("pick-continue");
      if (continueBtn) continueBtn.disabled = false;
    });

    $("pick-actions").addEventListener("click", function (e) {
      var t = e.target;
      if (t.id === "pick-none-back" || t.id === "pick-back") {
        showScreen("screen-3");
      } else if (t.id === "pick-skip") {
        renderInventorySummary();
        showScreen("screen-inventory");
      } else if (t.id === "pick-continue") {
        var checked = $("pick-body").querySelector('input[name="pick-system"]:checked');
        if (!checked) return;
        var key = checked.value;
        var systems = G.allSystems(state);
        var sys = systems.filter(function (s) { return W.systemKeyFor(s) === key; })[0];
        if (!sys) return;
        if (!state.walkthrough || state.walkthrough.systemKey !== key) {
          state.walkthrough = W.emptyWalkthrough();
          state.walkthrough.systemKey = key;
          state.walkthrough.system = sys;
        } else {
          state.walkthrough.system = sys; // keep answers, refresh snapshot in case inventory detail changed
        }
        saveState();
        renderWalkStep("data");
        showScreen("screen-w-data");
      }
    });
  }

  /* ---------------- Screens: guided walkthrough (See / Do / Risk) ---------------- */

  var WALK_STEP_SCREEN = { data: "screen-w-data", authority: "screen-w-authority", risk: "screen-w-risk" };
  var WALK_STEP_NEXT = { data: "authority", authority: "risk", risk: "controls" };
  var WALK_STEP_PREV = { data: "screen-pick", authority: "screen-w-data", risk: "screen-w-authority" };

  function unsurePanelHTML(step, systemName) {
    return (
      '<div class="unsure-panel">' +
      '<p><strong>What you\'re asking about:</strong> ' + escapeHtml(step.explain) + '</p>' +
      '<p><strong>Suggested prompt for ' + escapeHtml(W.fill(step.askWho, systemName)) + ':</strong> “' + escapeHtml(W.fill(step.prompt, systemName)) + '”</p>' +
      '<p><strong>What you\'re looking for:</strong></p>' +
      '<ul>' + step.examples.map(function (ex) { return "<li>" + escapeHtml(ex) + "</li>"; }).join("") + '</ul>' +
      '<div class="unsure-actions">' +
      '<button type="button" class="btn btn-secondary" data-unsure-action="ask">Ask ' + escapeHtml(W.fill(step.askWho, systemName)) + ' first, I\'ll come back</button>' +
      '<button type="button" class="btn-link" data-unsure-action="skip">Skip for now</button>' +
      '<button type="button" class="btn-link" data-unsure-action="guess">Continue with best guess</button>' +
      "</div></div>"
    );
  }

  function renderWalkStep(key) {
    var step = W.STEPS[key];
    var w = state.walkthrough;
    var systemName = w.system.name;
    var answer = w.answers[key];

    $(key === "data" ? "w-data-title" : key === "authority" ? "w-authority-title" : "w-risk-title").textContent = W.fill(step.question, systemName);
    $(key === "data" ? "w-data-system" : key === "authority" ? "w-authority-system" : "w-risk-system").textContent = "Walking through: " + systemName + " (" + w.system.category + ")";

    var listHtml = step.options.map(function (o) {
      var checked = answer.value === o.id ? "checked" : "";
      return '<label class="radio-item"><input type="radio" name="walk-' + key + '" value="' + o.id + '" ' + checked + "> " + escapeHtml(o.label) + "</label>";
    }).join("");
    listHtml += '<label class="radio-item"><input type="radio" name="walk-' + key + '" value="unsure" ' + (answer.value === "unsure" ? "checked" : "") + "> " + escapeHtml(step.unsureLabel) + "</label>";

    var container = $("w-" + key + "-list");
    container.innerHTML = listHtml;

    var panelContainer = $("w-" + key + "-panel");
    panelContainer.innerHTML = answer.value === "unsure" ? unsurePanelHTML(step, systemName) : "";
  }

  function wireWalkStep(key) {
    var listEl = $("w-" + key + "-list");
    var panelEl = $("w-" + key + "-panel");

    listEl.addEventListener("change", function (e) {
      if (e.target.name !== "walk-" + key) return;
      state.walkthrough.answers[key].value = e.target.value;
      state.walkthrough.answers[key].unsureAction = "";
      saveState();
      renderWalkStep(key);
    });

    panelEl.addEventListener("click", function (e) {
      var action = e.target.getAttribute("data-unsure-action");
      if (!action) return;
      if (action === "guess") {
        state.walkthrough.answers[key].value = "";
        state.walkthrough.answers[key].unsureAction = "";
      } else {
        state.walkthrough.answers[key].unsureAction = action;
      }
      saveState();
      renderWalkStep(key);
    });

    $("w-" + key + "-back").addEventListener("click", function () { showScreen(WALK_STEP_PREV[key]); });
    $("w-" + key + "-next").addEventListener("click", function () {
      var nextKey = WALK_STEP_NEXT[key];
      if (nextKey === "controls") {
        renderWalkControls();
        showScreen("screen-w-controls");
      } else {
        renderWalkStep(nextKey);
        showScreen(WALK_STEP_SCREEN[nextKey]);
      }
    });
  }

  /* ---------------- Screen: controls (multi-select) ---------------- */

  function renderWalkControls() {
    var w = state.walkthrough;
    var systemName = w.system.name;
    var c = w.answers.controls;

    $("w-controls-title").textContent = W.fill(W.CONTROLS_STEP.question, systemName);
    $("w-controls-system").textContent = "Walking through: " + systemName + " (" + w.system.category + ")";

    var listHtml = W.CONTROL_OPTIONS.map(function (o) {
      var checked = c.selected.indexOf(o.id) !== -1 ? "checked" : "";
      return '<label class="check-item"><input type="checkbox" data-control="' + o.id + '" ' + checked + "> " + escapeHtml(o.label) + "</label>";
    }).join("");
    listHtml += '<label class="check-item"><input type="checkbox" data-control="' + W.CONTROL_NONE + '" ' + (c.selected.indexOf(W.CONTROL_NONE) !== -1 ? "checked" : "") + "> We don't have any of these controls in place</label>";
    listHtml += '<label class="check-item"><input type="checkbox" id="controls-unsure" ' + (c.selected.length === 0 && c.unsureAction ? "checked" : "") + "> I'm not sure what controls are in place</label>";

    $("w-controls-list").innerHTML = listHtml;

    var panel = $("w-controls-panel");
    panel.innerHTML = (c.selected.length === 0 && c.unsureAction) ? unsurePanelHTML(Object.assign({}, W.CONTROLS_STEP, { unsureLabel: "" }), systemName) : "";
  }

  function wireWalkControls() {
    $("w-controls-list").addEventListener("change", function (e) {
      var t = e.target;
      var c = state.walkthrough.answers.controls;

      if (t.id === "controls-unsure") {
        if (t.checked) {
          c.selected = [];
          c.unsureAction = "guess-pending";
        } else {
          c.unsureAction = "";
        }
        saveState();
        renderWalkControls();
        return;
      }

      var id = t.getAttribute("data-control");
      if (!id) return;
      c.unsureAction = "";
      if (id === W.CONTROL_NONE) {
        c.selected = t.checked ? [W.CONTROL_NONE] : [];
      } else {
        var idx = c.selected.indexOf(id);
        if (t.checked) {
          c.selected = c.selected.filter(function (x) { return x !== W.CONTROL_NONE; });
          if (idx === -1) c.selected.push(id);
        } else if (idx !== -1) {
          c.selected.splice(idx, 1);
        }
      }
      saveState();
      renderWalkControls();
    });

    $("w-controls-panel").addEventListener("click", function (e) {
      var action = e.target.getAttribute("data-unsure-action");
      if (!action) return;
      var c = state.walkthrough.answers.controls;
      if (action === "guess") {
        c.unsureAction = "";
      } else {
        c.unsureAction = action;
      }
      saveState();
      renderWalkControls();
    });

    $("w-controls-back").addEventListener("click", function () { renderWalkStep("risk"); showScreen("screen-w-risk"); });
    $("w-controls-next").addEventListener("click", function () {
      state.walkthrough.completedAt = new Date().toISOString();
      saveState();
      renderWalkSummary();
      showScreen("screen-summary");
    });
  }

  /* ---------------- Screen: walkthrough summary ---------------- */

  function otherDiscoveredSystems() {
    var all = G.allSystems(state);
    var currentKey = state.walkthrough.systemKey;
    return all.filter(function (s) { return W.systemKeyFor(s) !== currentKey; });
  }

  function renderWalkSummary() {
    var w = state.walkthrough;
    var status = W.overallStatus(w);
    var priority = W.priorityFor(w);
    var rows = W.decisionSummaryRows(w);
    var actions = W.buildActionList(w);
    var missing = W.missingControls(w);
    var evidence = W.buildEvidencePlan(w.system.name);
    var others = otherDiscoveredSystems();

    $("summary-system-name").textContent = w.system.name + " (" + w.system.category + ")";

    $("summary-status").innerHTML =
      '<span class="status-badge status-' + status.code + '">' + status.icon + " " + status.label + "</span>" +
      '<span class="priority-tag">Priority: ' + priority + "</span>";

    $("summary-decisions").innerHTML = rows.map(function (r) {
      return '<div class="summary-item"><span class="name">' + escapeHtml(r.label) + (r.severity ? " " + W.severityDot(r.severity) : "") + '</span><div class="meta">' + escapeHtml(r.value) + "</div></div>";
    }).join("");

    $("summary-gaps").innerHTML = missing.length === 0
      ? '<li class="gap-none">None — every control on our checklist is already in place. Keep re-verifying periodically.</li>'
      : missing.map(function (m) { return "<li>" + escapeHtml(m.label) + "</li>"; }).join("");

    $("summary-actions").innerHTML = actions.length === 0
      ? '<li class="gap-none">No open items — nothing left to confirm or fix based on what you told us.</li>'
      : actions.map(function (a) { return "<li><strong>Ask " + escapeHtml(a.who) + ":</strong> " + escapeHtml(a.what) + "</li>"; }).join("");

    $("summary-evidence").innerHTML = evidence.map(function (e) { return "<li>" + escapeHtml(e) + "</li>"; }).join("");

    var teaser = $("summary-teaser");
    if (others.length > 0) {
      teaser.hidden = false;
      teaser.querySelector(".teaser-list").innerHTML = others.map(function (s) { return "<li>" + escapeHtml(s.name) + " (" + escapeHtml(s.category) + ")</li>"; }).join("");
    } else {
      teaser.hidden = true;
    }
  }

  function wireScreenSummary() {
    $("summary-back").addEventListener("click", function () { renderWalkControls(); showScreen("screen-w-controls"); });
    $("summary-pick-other").addEventListener("click", function () { renderPick(); showScreen("screen-pick"); });
    $("summary-inventory").addEventListener("click", function () { renderInventorySummary(); showScreen("screen-inventory"); });

    $("summary-export-pdf").addEventListener("click", function () {
      try {
        var doc = W.buildWalkthroughPdf(state.walkthrough, otherDiscoveredSystems());
        doc.save("ai-governance-decision-summary.pdf");
        toast("Downloaded ai-governance-decision-summary.pdf");
      } catch (e) {
        toast("PDF tool didn't load — try the Markdown download instead.");
      }
    });
    $("summary-export-md").addEventListener("click", function () {
      G.downloadTextFile("ai-governance-decision-summary.md", W.buildWalkthroughMarkdown(state.walkthrough, otherDiscoveredSystems()), "text/markdown;charset=utf-8");
      toast("Downloaded ai-governance-decision-summary.md");
    });
    $("summary-export-json").addEventListener("click", function () {
      G.downloadTextFile("ai-governance-decision-summary.json", W.buildWalkthroughJSON(state.walkthrough, otherDiscoveredSystems()), "application/json;charset=utf-8");
      toast("Downloaded ai-governance-decision-summary.json");
    });
  }

  /* ---------------- Shared read-only view ---------------- */

  function renderSharedView() {
    var params = new URLSearchParams(location.search);
    var encoded = params.get("share");
    if (!encoded) return false;
    try {
      var sharedState = G.decodeShareState(encoded);
      $("shared-summary").innerHTML = renderSummaryHTML(sharedState);
      showScreen("screen-shared");
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------------- Intro / resume ---------------- */

  function wireIntro() {
    $("btn-start").addEventListener("click", function () { showScreen("screen-1"); });
  }

  // Adopts saved progress into the live `state` immediately (before the
  // first showScreen() call, which persists whatever `state` currently is)
  // so a plain page reload can never overwrite real saved data with an
  // empty in-memory state. Returns the saved snapshot so wireResumeBanner
  // can still offer "start over" against it.
  function adoptSavedState() {
    var saved = loadState();
    if (saved && hasAnyProgress(saved)) {
      state = saved;
      return saved;
    }
    return null;
  }

  function wireResumeBanner(saved) {
    if (!saved) return;
    // `saved` and `state` are the same object (adoptSavedState aliases them),
    // and showScreen("screen-intro") during init already mutated
    // state.lastScreen by the time this runs — so the resume target must be
    // captured up front, before that happens, not read from `saved` here.
    var resumeTarget = SCREENS.indexOf(saved.lastScreen) !== -1 && saved.lastScreen !== "screen-intro" ? saved.lastScreen : "screen-1";
    $("resume-banner").hidden = false;
    $("resume-link").addEventListener("click", function (e) {
      e.preventDefault();
      renderAllScreens();
      showScreen(resumeTarget);
      $("resume-banner").hidden = true;
    });
    $("restart-link").addEventListener("click", function (e) {
      e.preventDefault();
      state = G.emptyState();
      saveState();
      renderAllScreens();
      $("resume-banner").hidden = true;
    });
  }

  /* ---------------- utils ---------------- */

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, "&quot;");
  }

  function renderAllScreens() {
    renderScreen1();
    renderScreen2();
    renderScreen3();
    renderInventorySummary();
    renderPick();
    if (state.walkthrough && state.walkthrough.system) {
      renderWalkStep("data");
      renderWalkStep("authority");
      renderWalkStep("risk");
      renderWalkControls();
      if (state.walkthrough.completedAt) renderWalkSummary();
    }
  }

  /* ---------------- init ---------------- */

  document.addEventListener("DOMContentLoaded", function () {
    if (renderSharedView()) return;

    var saved = adoptSavedState();

    wireIntro();
    wireScreen1();
    wireScreen2();
    wireScreen3();
    wireScreenInventory();
    wireScreenPick();
    wireWalkStep("data");
    wireWalkStep("authority");
    wireWalkStep("risk");
    wireWalkControls();
    wireScreenSummary();
    renderAllScreens();
    wireResumeBanner(saved);
    showScreen("screen-intro");
  });
})();
