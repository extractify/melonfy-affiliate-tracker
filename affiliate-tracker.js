/**
 * Affiliate Tracker v3.1 — Non-blocking, minimal
 * <script src="URL/affiliate-tracker-v3.1.min.js" defer></script>
 */
(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const clientId = params.get("client_reference_id");

  if (clientId) {
    document
      .querySelectorAll('a[href^="https://buy.stripe"]')
      .forEach((link) => {
        const url = new URL(link.href);
        url.searchParams.set("client_reference_id", clientId);
        link.href = url.toString();
      });
  }
})();
