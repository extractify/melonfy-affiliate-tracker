/**
 * Affiliate Tracker v3.1 — Non-blocking, minimal
 * <script src="URL/affiliate-tracker-v3.1.min.js" defer></script>
 */
(function () {
  "use strict";

  var P = "client_reference_id";
  var S = "https://buy.stripe.com/";
  var id = null;

  try {
    var f = new URLSearchParams(window.location.search).get(P);
    if (f) {
      id = f;
      localStorage.setItem(P, f);
    } else {
      id = localStorage.getItem(P);
    }
  } catch (e) {}

  if (!id) return;

  function isStripe(u) {
    return typeof u === "string" && u.indexOf(S) === 0;
  }

  function stamp(u) {
    try {
      var o = new URL(u);
      o.searchParams.set(P, id);
      return o.toString();
    } catch (e) {
      return u;
    }
  }

  // --- window.open (React/Lovable) ---
  try {
    var _open = window.open;
    window.open = function (u) {
      if (isStripe(u)) arguments[0] = stamp(u);
      return _open.apply(this, arguments);
    };
  } catch (e) {}

  // --- Click fallback ---
  document.addEventListener(
    "click",
    function (e) {
      var a = e.target.closest && e.target.closest("a");
      if (a && a.href && isStripe(a.href)) a.href = stamp(a.href);
    },
    { capture: true, passive: true }
  );

  // --- MutationObserver (deferred, non-blocking) ---
  function startObserver() {
    try {
      new MutationObserver(function (ms) {
        for (var i = 0; i < ms.length; i++) {
          var m = ms[i];
          if (m.type === "attributes" && m.target.tagName === "A") {
            if (isStripe(m.target.href)) m.target.href = stamp(m.target.href);
            continue;
          }
          var nodes = m.addedNodes;
          for (var j = 0; j < nodes.length; j++) {
            var n = nodes[j];
            if (n.nodeType !== 1) continue;
            if (n.tagName === "A" && isStripe(n.href)) n.href = stamp(n.href);
            if (n.getElementsByTagName) {
              var links = n.getElementsByTagName("a");
              for (var k = 0; k < links.length; k++) {
                if (isStripe(links[k].href))
                  links[k].href = stamp(links[k].href);
              }
            }
          }
        }
      }).observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["href"],
      });
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver);
  } else {
    setTimeout(startObserver, 0);
  }
})();
