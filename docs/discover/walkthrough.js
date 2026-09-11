/* Guardrails Discovery — guided walkthrough content model, decision engine, and
   output generation for the "See → Do → Risk → Controls" flow. Loaded after
   worksheets.js, before discover.js. Exposes everything on window.GDWalk.
   No backend, no network calls. */
(function () {
  "use strict";

  /* ---------- question content ---------- */
  /* Every option carries a severity band used only to color-code the result
     card (none/low -> green, medium -> yellow, high -> red). The band is a
     rough signal for the user, not a computed risk score. */

  var DATA_OPTIONS = [
    { id: "public", label: "Public information only", severity: "none" },
    { id: "internal", label: "Everyday internal business information", severity: "low" },
    { id: "confidential", label: "Confidential or proprietary business information", severity: "medium" },
    { id: "personal", label: "Customer, employee, or other personal data", severity: "high" },
    { id: "regulated", label: "Regulated data (financial, health, legal, or government)", severity: "high" },
    { id: "multiple", label: "More than one of these", severity: "medium" }
  ];

  var AUTHORITY_OPTIONS = [
    { id: "readonly", label: "Read-only — it analyzes, summarizes, or recommends", severity: "low" },
    { id: "drafts", label: "It can create documents or drafts (a person still sends or approves them)", severity: "low" },
    { id: "messages", label: "It can send emails or messages on someone's behalf", severity: "medium" },
    { id: "records", label: "It can access or update records in a database or business system", severity: "medium" },
    { id: "acts", label: "It can complete actions or transactions without anyone reviewing them first", severity: "high" }
  ];

  var RISK_OPTIONS = [
    { id: "trivial", label: "Inconvenient, but not serious", severity: "none" },
    { id: "internal", label: "Could cause internal confusion or wasted time", severity: "low" },
    { id: "customer", label: "Could upset a customer or damage a relationship", severity: "medium" },
    { id: "compliance", label: "Could create legal, regulatory, or compliance exposure", severity: "high" },
    { id: "severe", label: "Could expose sensitive data, or cause real financial or reputational harm", severity: "high" }
  ];

  var CONTROL_OPTIONS = [
    { id: "restricted-access", label: "Only specific people or roles have access to it" },
    { id: "managed-account", label: "It's a managed business account, not someone's personal one" },
    { id: "logged-reviewed", label: "What it does is logged, and someone actually reviews the logs" },
    { id: "technical-limit", label: "There's a technical limit on what it can do (permissions, blocked exports, restricted scope)" },
    { id: "approval-required", label: "Someone has to approve it before higher-stakes actions happen" }
  ];
  var CONTROL_NONE = "none";

  var SEVERITY_ORDER = { none: 0, low: 1, medium: 2, high: 3 };
  var SEVERITY_DOT = { none: "🟢", low: "🟢", medium: "🟡", high: "🔴", pending: "⚪" };
  var SEVERITY_WORD = { none: "Minimal", low: "Low", medium: "Medium", high: "High", pending: "Not yet determined" };

  var STEPS = {
    data: {
      key: "data",
      title: "What can it see?",
      question: "What kind of information does {system} have access to?",
      options: DATA_OPTIONS,
      unsureLabel: "I'm not sure",
      explain: "Whether the data it receives is public, everyday internal information, or something confidential, personal, or regulated. This determines how carefully it needs to be governed.",
      askWho: "whoever actually uses {system} day to day",
      prompt: "When people use {system}, what kind of information do they put into it? Is it public info, everyday internal stuff, or anything confidential, personal, or regulated?",
      examples: [
        "Just public info, nothing sensitive",
        "Everyday internal notes and documents",
        "Confidential business plans or trade secrets",
        "Customer names, contact info, or other personal data",
        "Financial, health, legal, or other regulated data"
      ],
      resultLabel: "Data boundary"
    },
    authority: {
      key: "authority",
      title: "What can it do?",
      question: "Besides reading data, what can {system} actually do?",
      options: AUTHORITY_OPTIONS,
      unsureLabel: "I'm not sure what it's allowed to do",
      explain: "Whether it's limited to reading and recommending, or whether it has broader permission to create, send, change, or execute things on its own.",
      askWho: "IT, or whoever manages the account or integration",
      prompt: "Is {system} just reading data and suggesting things, or does it have any integration that lets it send messages, change records, or take action on its own?",
      examples: [
        "It's read-only — someone still has to act on what it says",
        "It drafts things, but a person sends or approves them",
        "It can send messages on its own",
        "It's connected to our systems and can pull or change records",
        "It can complete actions or transactions without a person double-checking first"
      ],
      resultLabel: "Authority"
    },
    risk: {
      key: "risk",
      title: "What happens if it's wrong?",
      question: "If {system} makes a mistake, gets something wrong, or the information in it gets out — what's the realistic impact?",
      options: RISK_OPTIONS,
      unsureLabel: "I'm not sure",
      explain: "The severity if it fails: does it just waste some time, or could it create a customer, legal, regulatory, or financial problem?",
      askWho: "Legal or Compliance (or a trusted advisor if you don't have in-house counsel)",
      prompt: "If {system} got something wrong, or the information in it got out, what would the realistic impact be? Any legal, regulatory, customer, or financial exposure we should worry about?",
      examples: [
        "Not a big deal — mostly wastes time",
        "Could confuse or annoy someone internally",
        "Could upset a customer or damage a relationship",
        "Could create a legal, regulatory, or compliance problem",
        "Could expose sensitive data or cost real money or reputation"
      ],
      resultLabel: "Impact if wrong"
    }
  };

  var CONTROLS_STEP = {
    key: "controls",
    title: "What keeps that risk bounded?",
    question: "What controls exist today for {system}?",
    explain: "The technical or procedural safeguards that keep a mistake or misuse from turning into real damage.",
    askWho: "IT/Security for technical controls, and the team's manager for process controls",
    prompt: "What's actually stopping {system} from being misused today? Is access limited to certain people, is it a managed account, is usage logged and reviewed, and does anything higher-stakes need approval first?",
    examples: [
      "Yes — only specific people have access",
      "It's a shared or personal account, not managed by the business",
      "We log what it does, but nobody really reviews it",
      "There's no real limit on what it can do",
      "Someone has to approve bigger actions before they happen"
    ]
  };

  var STEP_ORDER = ["data", "authority", "risk", "controls"];

  function fill(template, systemName) {
    return template.replace(/\{system\}/g, systemName);
  }

  function severityDot(sev) { return SEVERITY_DOT[sev] || SEVERITY_DOT.pending; }
  function severityWord(sev) { return SEVERITY_WORD[sev] || SEVERITY_WORD.pending; }

  function optionSeverity(step, optionId) {
    var opts = step === "controls" ? [] : STEPS[step].options;
    var found = opts.filter(function (o) { return o.id === optionId; })[0];
    return found ? found.severity : "pending";
  }

  /* ---------- walkthrough state ---------- */

  function emptyAnswer() {
    return { value: "", unsureAction: "", note: "" };
  }

  function emptyControlsAnswer() {
    return { selected: [], otherNote: "", unsureAction: "" };
  }

  function emptyWalkthrough() {
    return {
      systemKey: "",
      system: null, // { category, name, detail, dataAccess, owner } snapshot at time of selection
      answers: {
        data: emptyAnswer(),
        authority: emptyAnswer(),
        risk: emptyAnswer(),
        controls: emptyControlsAnswer()
      },
      completedAt: null
    };
  }

  function systemKeyFor(sys) {
    return sys.category + "::" + sys.name;
  }

  /* ---------- decision computation ---------- */

  function dataDecisionSeverity(w) {
    var a = w.answers.data;
    if (!a.value || a.value === "unsure") return "pending";
    return optionSeverity("data", a.value);
  }
  function authorityDecisionSeverity(w) {
    var a = w.answers.authority;
    if (!a.value || a.value === "unsure") return "pending";
    return optionSeverity("authority", a.value);
  }
  function riskDecisionSeverity(w) {
    var a = w.answers.risk;
    if (!a.value || a.value === "unsure") return "pending";
    return optionSeverity("risk", a.value);
  }

  function missingControls(w) {
    var c = w.answers.controls;
    if (!c || c.selected.length === 0) return CONTROL_OPTIONS.slice();
    if (c.selected.indexOf(CONTROL_NONE) !== -1) return CONTROL_OPTIONS.slice();
    return CONTROL_OPTIONS.filter(function (opt) { return c.selected.indexOf(opt.id) === -1; });
  }

  function controlsPending(w) {
    var c = w.answers.controls;
    return !c || c.selected.length === 0;
  }

  function pendingSteps(w) {
    var pending = [];
    STEP_ORDER.forEach(function (key) {
      if (key === "controls") {
        if (controlsPending(w)) pending.push(key);
      } else {
        var a = w.answers[key];
        if (!a.value || a.value === "unsure") pending.push(key);
      }
    });
    return pending;
  }

  function maxSeverity(w) {
    var sevs = [dataDecisionSeverity(w), authorityDecisionSeverity(w), riskDecisionSeverity(w)].filter(function (s) { return s !== "pending"; });
    if (sevs.length === 0) return "pending";
    var top = "none";
    sevs.forEach(function (s) { if (SEVERITY_ORDER[s] > SEVERITY_ORDER[top]) top = s; });
    return top;
  }

  function overallStatus(w) {
    var pending = pendingSteps(w);
    var missing = missingControls(w);
    if (pending.length > 0) return { code: "incomplete", label: "INCOMPLETE", icon: "⚠️" };
    if (missing.length > 0) return { code: "incomplete", label: "INCOMPLETE", icon: "⚠️" };
    var sev = maxSeverity(w);
    if (sev === "high") return { code: "complete-monitor", label: "COMPLETE — KEEP MONITORING", icon: "🟡" };
    return { code: "complete", label: "LOOKS REASONABLY CONTROLLED", icon: "✅" };
  }

  function priorityFor(w) {
    var sev = maxSeverity(w);
    var missing = missingControls(w).length;
    if (sev === "high" || missing >= 3) return "HIGH";
    if (sev === "medium" || missing >= 1) return "MEDIUM";
    return "LOW";
  }

  /* ---------- action list ---------- */

  function buildActionList(w) {
    var systemName = w.system.name;
    var actions = [];

    STEP_ORDER.forEach(function (key) {
      if (key === "controls") return;
      var step = STEPS[key];
      var a = w.answers[key];
      if ((!a.value || a.value === "unsure") && a.unsureAction === "ask") {
        actions.push({
          who: fill(step.askWho, systemName),
          what: fill(step.prompt, systemName),
          reason: step.resultLabel
        });
      }
    });

    var c = w.answers.controls;
    if (c && c.unsureAction === "ask") {
      actions.push({
        who: fill(CONTROLS_STEP.askWho, systemName),
        what: fill(CONTROLS_STEP.prompt, systemName),
        reason: "Controls"
      });
    }

    missingControls(w).forEach(function (opt) {
      actions.push({
        who: "IT/Security or the team that owns " + systemName,
        what: "Put this in place, or confirm it already exists: " + opt.label.toLowerCase(),
        reason: "Control gap"
      });
    });

    return actions;
  }

  function buildEvidencePlan(systemName) {
    return [
      "Confirm each control above is actually turned on — check the settings yourself or ask IT to show you, rather than taking it on faith.",
      "Set a date (90 days is reasonable) to re-check " + systemName + " — permissions and integrations change quietly over time.",
      "Write down who's responsible for " + systemName + " so there's a clear owner if something goes wrong.",
      "Make sure you could answer, after the fact: who used it, what it accessed, and what it did. That's your audit trail."
    ];
  }

  /* ---------- markdown / pdf / json output ---------- */

  function labelFor(step, id) {
    var opts = STEPS[step].options;
    var found = opts.filter(function (o) { return o.id === id; })[0];
    return found ? found.label : "";
  }

  function decisionSummaryRows(w) {
    var rows = [];
    STEP_ORDER.forEach(function (key) {
      if (key === "controls") {
        var c = w.answers.controls;
        var text;
        if (!c || (c.selected.length === 0 && !c.unsureAction)) {
          text = "Not answered yet";
        } else if (c.selected.indexOf(CONTROL_NONE) !== -1) {
          text = "No controls in place today";
        } else if (c.selected.length === 0 && c.unsureAction) {
          text = "Not sure yet (" + (c.unsureAction === "ask" ? "will confirm with " + fill(CONTROLS_STEP.askWho, w.system.name) : "skipped for now") + ")";
        } else {
          text = c.selected.map(function (id) {
            var opt = CONTROL_OPTIONS.filter(function (o) { return o.id === id; })[0];
            return opt ? opt.label : id;
          }).join("; ");
        }
        rows.push({ label: "Controls in place", value: text, severity: null });
      } else {
        var step = STEPS[key];
        var a = w.answers[key];
        var text2;
        if (!a.value) {
          text2 = "Not answered yet";
        } else if (a.value === "unsure") {
          text2 = "Not sure (" + (a.unsureAction === "ask" ? "will confirm with " + fill(step.askWho, w.system.name) : "skipped for now") + ")";
        } else {
          text2 = labelFor(key, a.value);
        }
        var sev = key === "data" ? dataDecisionSeverity(w) : key === "authority" ? authorityDecisionSeverity(w) : riskDecisionSeverity(w);
        rows.push({ label: step.resultLabel, value: text2, severity: sev });
      }
    });
    return rows;
  }

  function buildWalkthroughMarkdown(w, otherSystems) {
    var sys = w.system;
    var status = overallStatus(w);
    var priority = priorityFor(w);
    var rows = decisionSummaryRows(w);
    var actions = buildActionList(w);
    var missing = missingControls(w);
    var evidence = buildEvidencePlan(sys.name);
    var today = new Date().toISOString().slice(0, 10);

    var md = "";
    md += "# AI Governance Decision Summary\n\n";
    md += "**System:** " + sys.name + " (" + sys.category + ")\n\n";
    md += "Generated " + today + " with the Guardrails guided walkthrough — https://guardrails-tools.dev/discover/\n\n";
    md += "---\n\n";

    md += "## Your Decisions\n\n";
    rows.forEach(function (r) {
      md += "- **" + r.label + ":** " + r.value + (r.severity ? " " + severityDot(r.severity) : "") + "\n";
    });
    md += "\n**Governance status:** " + status.icon + " " + status.label + "  \n**Priority:** " + priority + "\n\n";

    md += "---\n\n## Controls Needed\n\n";
    if (missing.length === 0) {
      md += "None — every control on our checklist is already in place. Keep re-verifying periodically.\n\n";
    } else {
      missing.forEach(function (m) { md += "- [ ] " + m.label + "\n"; });
      md += "\n";
    }

    md += "---\n\n## Action List\n\n";
    if (actions.length === 0) {
      md += "No open items — nothing left to confirm or fix based on what you told us.\n\n";
    } else {
      actions.forEach(function (a, i) {
        md += (i + 1) + ". **Ask " + a.who + ":** " + a.what + "\n";
      });
      md += "\n";
    }

    md += "---\n\n## Evidence Plan\n\n";
    evidence.forEach(function (e) { md += "- " + e + "\n"; });
    md += "\n";

    if (otherSystems && otherSystems.length > 0) {
      md += "---\n\n## You Also Identified\n\n";
      md += "This walkthrough only covers " + sys.name + ". You told us about these other systems too — each deserves its own walkthrough:\n\n";
      otherSystems.forEach(function (s) { md += "- " + s.name + " (" + s.category + ")\n"; });
      md += "\n";
    }

    md += "---\n\n## Next Steps\n\n";
    md += "1. Work through the action list above.\n";
    md += "2. Read the full written workflow: https://github.com/guardrails-tools-ai/guardrails-tools/tree/main/workflow\n";
    md += "3. Write it down using the policy template: https://github.com/guardrails-tools-ai/guardrails-tools/blob/main/templates/policy-template-base.md\n";

    return md;
  }

  function buildWalkthroughJSON(w, otherSystems) {
    var status = overallStatus(w);
    return JSON.stringify({
      version: 1,
      generatedAt: new Date().toISOString(),
      system: w.system,
      decisions: {
        dataBoundary: w.answers.data,
        authority: w.answers.authority,
        risk: w.answers.risk,
        controls: w.answers.controls
      },
      governanceStatus: status.code,
      priority: priorityFor(w),
      controlsNeeded: missingControls(w).map(function (m) { return m.id; }),
      actionList: buildActionList(w),
      evidencePlan: buildEvidencePlan(w.system.name),
      otherSystemsIdentified: otherSystems || []
    }, null, 2);
  }

  function buildWalkthroughPdf(w, otherSystems) {
    if (!window.jspdf || !window.jspdf.jsPDF) throw new Error("pdf-unavailable");
    var sys = w.system;
    var status = overallStatus(w);
    var priority = priorityFor(w);
    var rows = decisionSummaryRows(w);
    var actions = buildActionList(w);
    var missing = missingControls(w);
    var evidence = buildEvidencePlan(sys.name);
    var today = new Date().toISOString().slice(0, 10);

    var doc = new window.jspdf.jsPDF({ unit: "pt", format: "letter" });
    var margin = 40, y = margin;

    function h1(t) { doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.text(t, margin, y); y += 22; }
    function h2(t) { doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.text(t, margin, y); y += 18; }
    function p(t) { doc.setFont("helvetica", "normal"); doc.setFontSize(10); var lines = doc.splitTextToSize(t, 515); doc.text(lines, margin, y); y += lines.length * 13 + 8; }
    function ensureSpace(n) { if (y + n > 740) { doc.addPage(); y = margin; } }
    function table(head, body) {
      doc.autoTable({ head: [head], body: body, startY: y, margin: { left: margin, right: margin }, styles: { fontSize: 9, cellPadding: 5 }, headStyles: { fillColor: [0, 103, 134] }, didDrawPage: function (d) { y = d.cursor.y + 16; } });
      y = doc.lastAutoTable.finalY + 16;
    }

    h1("AI Governance Decision Summary");
    p(sys.name + " (" + sys.category + ") — generated " + today + " with guardrails-tools.dev/discover");

    ensureSpace(100);
    h2("Your Decisions");
    table(["Decision", "Answer"], rows.map(function (r) { return [r.label, r.value + (r.severity ? " " + severityDot(r.severity) : "")]; }));
    p("Governance status: " + status.icon + " " + status.label + "     Priority: " + priority);

    ensureSpace(80);
    h2("Controls Needed");
    if (missing.length === 0) {
      p("None — every control on our checklist is already in place.");
    } else {
      missing.forEach(function (m) { p("- " + m.label); });
    }

    ensureSpace(80);
    h2("Action List");
    if (actions.length === 0) {
      p("No open items.");
    } else {
      actions.forEach(function (a, i) { p((i + 1) + ". Ask " + a.who + ": " + a.what); });
    }

    ensureSpace(80);
    h2("Evidence Plan");
    evidence.forEach(function (e) { p("- " + e); });

    if (otherSystems && otherSystems.length > 0) {
      ensureSpace(60);
      h2("You Also Identified");
      p(otherSystems.map(function (s) { return s.name + " (" + s.category + ")"; }).join(", "));
    }

    ensureSpace(60);
    h2("Next Steps");
    p("1. Work through the action list above.\n2. Read the full workflow: github.com/guardrails-tools-ai/guardrails-tools/tree/main/workflow\n3. Draft your policy: github.com/guardrails-tools-ai/guardrails-tools/blob/main/templates/policy-template-base.md");

    return doc;
  }

  window.GDWalk = {
    STEPS: STEPS,
    STEP_ORDER: STEP_ORDER,
    CONTROLS_STEP: CONTROLS_STEP,
    CONTROL_OPTIONS: CONTROL_OPTIONS,
    CONTROL_NONE: CONTROL_NONE,
    fill: fill,
    severityDot: severityDot,
    severityWord: severityWord,
    optionSeverity: optionSeverity,
    emptyWalkthrough: emptyWalkthrough,
    systemKeyFor: systemKeyFor,
    dataDecisionSeverity: dataDecisionSeverity,
    authorityDecisionSeverity: authorityDecisionSeverity,
    riskDecisionSeverity: riskDecisionSeverity,
    missingControls: missingControls,
    pendingSteps: pendingSteps,
    maxSeverity: maxSeverity,
    overallStatus: overallStatus,
    priorityFor: priorityFor,
    buildActionList: buildActionList,
    buildEvidencePlan: buildEvidencePlan,
    decisionSummaryRows: decisionSummaryRows,
    buildWalkthroughMarkdown: buildWalkthroughMarkdown,
    buildWalkthroughJSON: buildWalkthroughJSON,
    buildWalkthroughPdf: buildWalkthroughPdf
  };
})();
