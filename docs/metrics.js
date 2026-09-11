/* Guardrails anonymous usage tracking. Fires a small set of allow-listed
   funnel events (see metrics-worker/src/index.js for the full contract) to
   a Cloudflare Worker. Never sends free text, answer content, names, or
   email addresses — only closed-option choices and counts.

   `sid` is a random id kept in sessionStorage only: it resets every time the
   tab/browser session ends, is never a cookie, and is never linked to a
   person. It exists purely so we can count how many distinct visits reach
   each step, rather than counting duplicate reloads as new people.

   Fails silently and never throws — a blocked or missing script must never
   affect the product itself. */
(function () {
  "use strict";

  var ENDPOINT = "https://guardrails-metrics.carthyb.workers.dev/track";
  var SID_KEY = "gd_sid_v1";

  function sessionId() {
    try {
      var sid = sessionStorage.getItem(SID_KEY);
      if (!sid) {
        sid = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2)).replace(/[^a-zA-Z0-9-]/g, "");
        sessionStorage.setItem(SID_KEY, sid);
      }
      return sid;
    } catch (e) {
      return "unknown";
    }
  }

  function track(event, meta) {
    try {
      var payload = JSON.stringify({ event: event, meta: meta || {}, sid: sessionId() });
      if (navigator.sendBeacon) {
        var blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(ENDPOINT, blob);
      } else {
        fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(function () {});
      }
    } catch (e) {
      /* metrics must never break the page */
    }
  }

  window.GTrack = track;
})();
