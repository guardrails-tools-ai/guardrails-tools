/* Guardrails anonymous usage metrics collector.
 *
 * Privacy contract (matches what the site tells visitors): this worker never
 * receives free text, answer content, names, or email addresses. Every event
 * is validated against a fixed allowlist of event types and enum-only meta
 * fields below — anything else sent by a buggy or malicious client is
 * dropped, not stored. `sid` is a random id generated client-side and held
 * only in sessionStorage (never a cookie, never persisted across visits) so
 * we can count unique sessions through the funnel instead of raw clicks.
 */

const ALLOWED_ORIGINS = [
  "https://guardrails-tools.dev",
  "https://guardrails-tools.pages.dev",
];

const ALLOWED_PATHS = ["/", "/discover/", "/faq.html", "/why-ai-needs-boundaries.html"];

const SID_RE = /^[a-zA-Z0-9-]{8,64}$/;

// Every event type lists the only meta fields it may carry, each with a
// validator. Unknown events, unknown fields, and invalid values are rejected
// outright rather than silently stored — this is the enforcement point for
// the "we don't collect anything else" promise, not just a docs claim.
const EVENT_SCHEMAS = {
  page_view: {
    path: (v) => ALLOWED_PATHS.includes(v),
  },
  discover_start: {},
  inventory_complete: {
    systemCount: (v) => Number.isInteger(v) && v >= 0 && v <= 100,
  },
  system_picked: {
    category: (v) =>
      ["Direct AI tool", "Business app AI feature", "Business app — AI status unknown", "Internal system"].includes(v),
  },
  question_unsure: {
    question: (v) => ["data", "authority", "risk", "controls"].includes(v),
    action: (v) => ["ask", "skip", "unanswered"].includes(v),
  },
  walkthrough_complete: {
    status: (v) => ["incomplete", "complete-monitor", "complete"].includes(v),
    priority: (v) => ["HIGH", "MEDIUM", "LOW"].includes(v),
    pendingCount: (v) => Number.isInteger(v) && v >= 0 && v <= 4,
    missingControlsCount: (v) => Number.isInteger(v) && v >= 0 && v <= 5,
  },
  export: {
    format: (v) => ["pdf", "markdown", "json", "share"].includes(v),
    scope: (v) => ["walkthrough", "inventory"].includes(v),
  },
  survey_response: {
    q1: (v) => ["yes", "no", "unsure"].includes(v),
    q2: (v) => ["week", "month", "maybe", "no"].includes(v),
    q3: (v) => ["clear", "mostly", "unclear"].includes(v),
  },
};

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : "";
  const headers = {
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Metrics-Key",
    "Vary": "Origin",
  };
  if (allow) {
    // navigator.sendBeacon issues cross-origin requests with credentials
    // mode "include" (browsers do this unconditionally; JS can't opt out),
    // so the preflight only succeeds if Allow-Credentials is present
    // alongside a specific (non-wildcard) Allow-Origin. No cookies are
    // actually set or read here — this is purely to satisfy that check.
    headers["Access-Control-Allow-Origin"] = allow;
    headers["Access-Control-Allow-Credentials"] = "true";
  }
  return headers;
}

function json(data, status, extraHeaders) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: Object.assign({ "Content-Type": "application/json" }, extraHeaders || {}),
  });
}

function sanitizeMeta(event, rawMeta) {
  const schema = EVENT_SCHEMAS[event];
  if (!schema) return null;
  const meta = {};
  if (rawMeta && typeof rawMeta === "object") {
    for (const key of Object.keys(schema)) {
      if (Object.prototype.hasOwnProperty.call(rawMeta, key) && schema[key](rawMeta[key])) {
        meta[key] = rawMeta[key];
      }
    }
  }
  return meta;
}

async function handleTrack(request, env, origin) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "invalid-json" }, 400, corsHeaders(origin));
  }

  const event = typeof body.event === "string" ? body.event : "";
  if (!EVENT_SCHEMAS.hasOwnProperty(event)) {
    return json({ error: "unknown-event" }, 400, corsHeaders(origin));
  }

  const sid = typeof body.sid === "string" && SID_RE.test(body.sid) ? body.sid : "unknown";
  const meta = sanitizeMeta(event, body.meta);
  const now = Date.now();
  const day = new Date(now).toISOString().slice(0, 10);
  const key = "evt:" + day + ":" + now + ":" + Math.random().toString(36).slice(2, 8);

  await env.EVENTS.put(key, JSON.stringify({ event: event, meta: meta, sid: sid, ts: now }), {
    // Auto-expire raw events after 90 days — this is a launch-week
    // measurement tool, not a permanent log.
    expirationTtl: 60 * 60 * 24 * 90,
  });

  return json({ ok: true }, 200, corsHeaders(origin));
}

async function handleSummary(request, env, origin) {
  const key = request.headers.get("X-Metrics-Key") || new URL(request.url).searchParams.get("key");
  if (!env.METRICS_KEY || key !== env.METRICS_KEY) {
    return json({ error: "unauthorized" }, 401, corsHeaders(origin));
  }

  const counts = {}; // event -> count
  const byMeta = {}; // event -> { field=value -> count }
  const sessionsByEvent = {}; // event -> Set of sid
  let cursor;
  let scanned = 0;
  const MAX_KEYS = 20000; // generous ceiling for a launch-week volume; avoids unbounded work if this endpoint is ever hit repeatedly

  do {
    const page = await env.EVENTS.list({ prefix: "evt:", cursor: cursor, limit: 1000 });
    for (const k of page.keys) {
      scanned++;
      const raw = await env.EVENTS.get(k.name);
      if (!raw) continue;
      let rec;
      try { rec = JSON.parse(raw); } catch (e) { continue; }
      counts[rec.event] = (counts[rec.event] || 0) + 1;
      sessionsByEvent[rec.event] = sessionsByEvent[rec.event] || new Set();
      sessionsByEvent[rec.event].add(rec.sid);
      if (rec.meta) {
        byMeta[rec.event] = byMeta[rec.event] || {};
        for (const field of Object.keys(rec.meta)) {
          const dim = field + "=" + rec.meta[field];
          byMeta[rec.event][dim] = (byMeta[rec.event][dim] || 0) + 1;
        }
      }
    }
    cursor = page.cursor;
    if (page.list_complete) cursor = undefined;
  } while (cursor && scanned < MAX_KEYS);

  const uniqueSessions = {};
  for (const evt of Object.keys(sessionsByEvent)) uniqueSessions[evt] = sessionsByEvent[evt].size;

  return json(
    {
      scannedEvents: scanned,
      truncated: scanned >= MAX_KEYS,
      counts: counts,
      uniqueSessions: uniqueSessions,
      breakdown: byMeta,
    },
    200,
    corsHeaders(origin)
  );
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname === "/track" && request.method === "POST") {
      return handleTrack(request, env, origin);
    }

    if (url.pathname === "/summary" && request.method === "GET") {
      return handleSummary(request, env, origin);
    }

    return json({ error: "not-found" }, 404, corsHeaders(origin));
  },
};
