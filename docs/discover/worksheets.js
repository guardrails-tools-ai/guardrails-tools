/* Guardrails Discovery — data model, worksheet generation, PDF, and share-link encoding.
   Loaded before discover.js. Exposes everything on window.GDW. No backend, no network calls. */
(function () {
  "use strict";

  var TOOLS = [
    { id: "chatgpt", name: "ChatGPT" },
    { id: "claude", name: "Claude" },
    { id: "gemini", name: "Google Gemini" },
    { id: "copilot", name: "Microsoft Copilot" },
    { id: "ghcopilot", name: "GitHub Copilot" },
    { id: "grok", name: "Grok" },
    { id: "metaai", name: "Meta AI" },
    { id: "perplexity", name: "Perplexity" },
    { id: "deepseek", name: "DeepSeek" }
  ];

  var PURPOSES = [
    "Writing or editing content",
    "Writing or reviewing code",
    "Research or analysis",
    "Talking with customers directly",
    "Internal notes or documentation",
    "Summarizing meetings"
  ];

  var SENSITIVITY = [
    { id: "public", label: "Public information only" },
    { id: "internal", label: "Internal or confidential business info" },
    { id: "customer", label: "Customer data" },
    { id: "financial", label: "Financial data" },
    { id: "proprietary", label: "Proprietary code or trade secrets" },
    { id: "unsure", label: "Not sure" }
  ];

  var VISIBILITY = [
    { id: "full", label: "Yes — we can see how these are used (managed/business accounts)" },
    { id: "partial", label: "Partially — some managed accounts, some personal" },
    { id: "none", label: "No — people mostly use their own personal accounts" },
    { id: "unsure", label: "Not sure" }
  ];

  var APPS = [
    { id: "salesforce", name: "Salesforce", features: ["Lead scoring or deal forecasting", "Chatbot or support routing"], data: ["Customer contact info", "Deal or pipeline data", "Communication history"] },
    { id: "m365", name: "Microsoft 365 (Copilot)", features: ["Copilot in Teams, Word, or Outlook", "Email or meeting summaries"], data: ["Email", "Calendar", "Documents"] },
    { id: "gworkspace", name: "Google Workspace", features: ["Gmail smart reply or Docs assist", "Meeting notes"], data: ["Email", "Calendar", "Documents"] },
    { id: "github", name: "GitHub", features: ["Copilot code suggestions", "Code review assistance"], data: ["Source code", "Issue or pull request content"] },
    { id: "zendesk", name: "Zendesk", features: ["Answer bot", "Ticket routing or summaries"], data: ["Customer questions", "Knowledge base content"] },
    { id: "servicenow", name: "ServiceNow", features: ["Chatbot or virtual agent", "Task automation"], data: ["Employee requests", "Internal tickets"] },
    { id: "workday", name: "Workday (or similar HR system)", features: ["Candidate or talent matching", "Compensation analysis"], data: ["Candidate or employee records", "Compensation data"] },
    { id: "projectmgmt", name: "Asana, Monday, or similar", features: ["Task write-up assistance", "Timeline or summary generation"], data: ["Project details", "Team communications"] }
  ];

  var INTERNAL_YESNO = [
    { id: "yes", label: "Yes" },
    { id: "no", label: "No" },
    { id: "unsure", label: "Not sure" }
  ];

  function emptyState() {
    return {
      version: 1,
      section1: {
        selectedTools: [],
        otherTool: "",
        purposesByTool: {},
        otherPurposeByTool: {},
        sensitivity: "",
        visibility: ""
      },
      section2: {
        apps: {} // { appId: { inUse, hasAI, features: [], otherFeature, data: [], otherData } }
      },
      section2Other: {
        inUse: false,
        name: "",
        feature: "",
        data: ""
      },
      section3: {
        hasInternal: "",
        systems: [] // { name, purpose, model, dataAccess, maintainedBy }
      },
      completedAt: null,
      walkthrough: null // set once the user picks a system to walk through — see walkthrough.js
    };
  }

  /* ---------- unicode-safe base64 ---------- */
  function b64EncodeUnicode(str) {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (_, p1) {
        return String.fromCharCode("0x" + p1);
      })
    );
  }
  function b64DecodeUnicode(str) {
    return decodeURIComponent(
      atob(str)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
  }

  /* ---------- derived data ---------- */

  function toolDisplayName(id) {
    var t = TOOLS.filter(function (x) { return x.id === id; })[0];
    return t ? t.name : id;
  }

  function appById(id) {
    return APPS.filter(function (a) { return a.id === id; })[0];
  }

  function sensitivityLabel(id) {
    var s = SENSITIVITY.filter(function (x) { return x.id === id; })[0];
    return s ? s.label : "";
  }

  // Flattens all three sections into one list of discovered "systems" for
  // the risk/authority/control-gap starter worksheets, which operate on
  // every AI system as a single unit regardless of which category it came from.
  function allSystems(state) {
    var out = [];

    state.section1.selectedTools.forEach(function (id) {
      var name = id === "other" ? (state.section1.otherTool || "Other direct tool") : toolDisplayName(id);
      var purposes = (state.section1.purposesByTool[id] || []).filter(function (p) { return p !== "__other__"; });
      if (state.section1.otherPurposeByTool[id]) purposes.push(state.section1.otherPurposeByTool[id]);
      out.push({
        category: "Direct AI tool",
        name: name,
        detail: purposes.join(", ") || "(purpose not specified)",
        dataAccess: sensitivityLabel(state.section1.sensitivity) || "(not specified)",
        owner: ""
      });
    });

    Object.keys(state.section2.apps).forEach(function (id) {
      var row = state.section2.apps[id];
      if (!row || !row.inUse) return;
      var app = appById(id);
      var name = app ? app.name : id;
      if (row.hasAI === "yes") {
        var features = (row.features || []).filter(function (f) { return f !== "__other__"; });
        if (row.otherFeature) features.push(row.otherFeature);
        var data = (row.data || []).filter(function (d) { return d !== "__other__"; });
        if (row.otherData) data.push(row.otherData);
        out.push({
          category: "Business app AI feature",
          name: name,
          detail: features.join(", ") || "(feature not specified)",
          dataAccess: data.join(", ") || "(not specified)",
          owner: ""
        });
      } else if (row.hasAI === "unsure") {
        out.push({
          category: "Business app — AI status unknown",
          name: name,
          detail: "Not sure whether AI features are enabled — worth checking admin settings or asking your vendor contact",
          dataAccess: "(unknown until confirmed)",
          owner: ""
        });
      }
    });

    if (state.section2Other.inUse && state.section2Other.name) {
      out.push({
        category: "Business app AI feature",
        name: state.section2Other.name,
        detail: state.section2Other.feature || "(feature not specified)",
        dataAccess: state.section2Other.data || "(not specified)",
        owner: ""
      });
    }

    state.section3.systems.forEach(function (sys) {
      if (!sys.name) return;
      out.push({
        category: "Internal system",
        name: sys.name,
        detail: sys.purpose || "(purpose not specified)",
        dataAccess: sys.dataAccess || "(not specified)",
        owner: sys.maintainedBy || "",
        model: sys.model || ""
      });
    });

    return out;
  }

  /* ---------- markdown ---------- */

  function mdEscape(s) {
    return String(s == null ? "" : s).replace(/\|/g, "\\|").replace(/\n/g, " ");
  }

  function buildFullMarkdown(state) {
    var systems = allSystems(state);
    var today = new Date().toISOString().slice(0, 10);
    var md = "";

    md += "# AI Discovery Worksheet Packet\n\n";
    md += "Generated " + today + " with the Guardrails discovery checklist — https://guardrails-tools.dev/discover/\n\n";
    md += "---\n\n";

    md += "## 1. Discovery Summary\n\n";
    if (systems.length === 0) {
      md += "No AI systems were recorded.\n\n";
    } else {
      md += "| System | Category | Used for | Data it can access | Maintained by |\n";
      md += "|---|---|---|---|---|\n";
      systems.forEach(function (s) {
        md += "| " + mdEscape(s.name) + " | " + mdEscape(s.category) + " | " + mdEscape(s.detail) + " | " + mdEscape(s.dataAccess) + " | " + mdEscape(s.owner) + " |\n";
      });
      md += "\n";
    }
    if (state.section1.visibility) {
      var v = VISIBILITY.filter(function (x) { return x.id === state.section1.visibility; })[0];
      md += "**Visibility into direct AI tool usage:** " + (v ? v.label : state.section1.visibility) + "\n\n";
    }

    md += "---\n\n## 2. Risk Classification Starter\n\n";
    md += "For each system above, rate the risk if it's misused or breached. This isn't computed for you — it's a judgment call your team makes.\n\n";
    if (systems.length === 0) {
      md += "No systems to classify yet.\n\n";
    } else {
      md += "| System | Data sensitivity | Impact if wrong | Risk tier (0-4) | Notes |\n";
      md += "|---|---|---|---|---|\n";
      systems.forEach(function (s) {
        md += "| " + mdEscape(s.name) + " | " + mdEscape(s.dataAccess) + " | | ? | |\n";
      });
      md += "\n";
    }
    md += "Risk tiers: **0** Minimal (public data, no real impact) · **1** Low (internal data, limited impact) · **2** Medium (confidential data, moderate impact) · **3** High (regulated data or real financial/legal consequence) · **4** Critical (privileged, regulated, or safety-critical data — breach creates liability or harm)\n\n";

    md += "---\n\n## 3. Authority Definition Starter\n\n";
    md += "For each system, decide what it's actually allowed to do — not what it's technically capable of.\n\n";
    if (systems.length === 0) {
      md += "No systems to define yet.\n\n";
    } else {
      md += "| System | Current authority (today, informally) | Intended authority | Gap? |\n";
      md += "|---|---|---|---|\n";
      systems.forEach(function (s) {
        md += "| " + mdEscape(s.name) + " | | | |\n";
      });
      md += "\n";
    }
    md += "Authority levels: **0** Observe · **1** Analyze · **2** Recommend · **3** Prepare · **4** Execute Bounded · **5** Execute Gated · **6** Prohibited\n\n";

    md += "---\n\n## 4. Control Gap Assessment Starter\n\n";
    md += "Once you know the risk and the intended authority, list what's missing to actually enforce that boundary.\n\n";
    if (systems.length === 0) {
      md += "No systems to assess yet.\n\n";
    } else {
      md += "| System | Risk tier | Authority level | Controls missing | Priority |\n";
      md += "|---|---|---|---|---|\n";
      systems.forEach(function (s) {
        md += "| " + mdEscape(s.name) + " | | | | |\n";
      });
      md += "\n";
    }
    md += "Priority: **P0** fix immediately · **P1** fix within 30 days · **P2** fix within 90 days\n\n";

    md += "---\n\n## Next Steps\n\n";
    md += "1. Review this inventory with your team — add anything this checklist missed.\n";
    md += "2. Work through the full written workflow: https://github.com/guardrails-tools-ai/guardrails-tools/tree/main/workflow\n";
    md += "3. Use the policy template to write it down: https://github.com/guardrails-tools-ai/guardrails-tools/blob/main/templates/policy-template-base.md\n";

    return md;
  }

  function downloadTextFile(filename, content, mime) {
    var blob = new Blob([content], { type: mime || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------- PDF ---------- */

  function buildPdf(state) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error("pdf-unavailable");
    }
    var systems = allSystems(state);
    var doc = new window.jspdf.jsPDF({ unit: "pt", format: "letter" });
    var today = new Date().toISOString().slice(0, 10);
    var margin = 40;
    var y = margin;

    function h1(text) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(text, margin, y);
      y += 22;
    }
    function h2(text) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(text, margin, y);
      y += 18;
    }
    function p(text) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      var lines = doc.splitTextToSize(text, 515);
      doc.text(lines, margin, y);
      y += lines.length * 13 + 8;
    }
    function ensureSpace(needed) {
      if (y + needed > 740) {
        doc.addPage();
        y = margin;
      }
    }
    function table(head, rows) {
      doc.autoTable({
        head: [head],
        body: rows,
        startY: y,
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 5 },
        headStyles: { fillColor: [0, 103, 134] },
        didDrawPage: function (data) { y = data.cursor.y + 16; }
      });
      y = doc.lastAutoTable.finalY + 16;
    }

    h1("AI Discovery Worksheet Packet");
    p("Generated " + today + " with the Guardrails discovery checklist — guardrails-tools.dev/discover");

    ensureSpace(60);
    h2("1. Discovery Summary");
    if (systems.length === 0) {
      p("No AI systems were recorded.");
    } else {
      table(
        ["System", "Category", "Used for", "Data it can access"],
        systems.map(function (s) { return [s.name, s.category, s.detail, s.dataAccess]; })
      );
    }

    ensureSpace(80);
    h2("2. Risk Classification Starter");
    p("For each system above, rate the risk if it's misused or breached.");
    if (systems.length > 0) {
      table(
        ["System", "Data sensitivity", "Impact if wrong", "Risk tier (0-4)"],
        systems.map(function (s) { return [s.name, s.dataAccess, "", "?"]; })
      );
    }
    p("Tiers: 0 Minimal, 1 Low, 2 Medium, 3 High, 4 Critical.");

    ensureSpace(80);
    h2("3. Authority Definition Starter");
    p("For each system, decide what it's actually allowed to do.");
    if (systems.length > 0) {
      table(
        ["System", "Current authority", "Intended authority", "Gap?"],
        systems.map(function (s) { return [s.name, "", "", ""]; })
      );
    }
    p("Levels: 0 Observe, 1 Analyze, 2 Recommend, 3 Prepare, 4 Execute Bounded, 5 Execute Gated, 6 Prohibited.");

    ensureSpace(80);
    h2("4. Control Gap Assessment Starter");
    if (systems.length > 0) {
      table(
        ["System", "Risk tier", "Authority level", "Controls missing", "Priority"],
        systems.map(function (s) { return [s.name, "", "", "", ""]; })
      );
    }
    p("Priority: P0 immediately, P1 within 30 days, P2 within 90 days.");

    ensureSpace(60);
    h2("Next Steps");
    p("1. Review this inventory with your team.\n2. Work through the full workflow: github.com/guardrails-tools-ai/guardrails-tools/tree/main/workflow\n3. Draft your policy: github.com/guardrails-tools-ai/guardrails-tools/blob/main/templates/policy-template-base.md");

    return doc;
  }

  /* ---------- share link ---------- */

  // Encodes a compact projection of state (not the full object) to keep URLs short.
  function encodeShareState(state) {
    // Only apps actually in use carry any information — dropping the rest
    // keeps the link from growing with every app in the catalog regardless
    // of whether the person answered anything about it.
    var usedApps = {};
    Object.keys(state.section2.apps).forEach(function (id) {
      var row = state.section2.apps[id];
      if (row && row.inUse) usedApps[id] = row;
    });

    var compact = {
      v: 1,
      t: state.section1.selectedTools,
      ot: state.section1.otherTool,
      p: state.section1.purposesByTool,
      op: state.section1.otherPurposeByTool,
      sn: state.section1.sensitivity,
      vs: state.section1.visibility,
      a: usedApps,
      ao: state.section2Other,
      hi: state.section3.hasInternal,
      s: state.section3.systems
    };
    return b64EncodeUnicode(JSON.stringify(compact));
  }

  function decodeShareState(encoded) {
    var c = JSON.parse(b64DecodeUnicode(encoded));
    var state = emptyState();
    state.section1.selectedTools = c.t || [];
    state.section1.otherTool = c.ot || "";
    state.section1.purposesByTool = c.p || {};
    state.section1.otherPurposeByTool = c.op || {};
    state.section1.sensitivity = c.sn || "";
    state.section1.visibility = c.vs || "";
    state.section2.apps = c.a || {};
    state.section2Other = c.ao || { inUse: false, name: "", feature: "", data: "" };
    state.section3.hasInternal = c.hi || "";
    state.section3.systems = c.s || [];
    return state;
  }

  window.GDW = {
    TOOLS: TOOLS,
    PURPOSES: PURPOSES,
    SENSITIVITY: SENSITIVITY,
    VISIBILITY: VISIBILITY,
    APPS: APPS,
    INTERNAL_YESNO: INTERNAL_YESNO,
    emptyState: emptyState,
    allSystems: allSystems,
    toolDisplayName: toolDisplayName,
    appById: appById,
    buildFullMarkdown: buildFullMarkdown,
    downloadTextFile: downloadTextFile,
    buildPdf: buildPdf,
    encodeShareState: encodeShareState,
    decodeShareState: decodeShareState
  };
})();
