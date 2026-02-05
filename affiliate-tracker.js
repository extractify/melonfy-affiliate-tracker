(function () {
  const params = new URLSearchParams(window.location.search);
  const clientId = params.get("client_reference_id");

  if (!clientId) return;

  function updateLinks(root) {
    root.querySelectorAll('a[href^="https://buy.stripe"]').forEach((link) => {
      const url = new URL(link.href);
      if (url.searchParams.get("client_reference_id") !== clientId) {
        url.searchParams.set("client_reference_id", clientId);
        link.href = url.toString();
      }
    });
  }

  // Links já presentes no DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => updateLinks(document));
  } else {
    updateLinks(document);
  }

  // Links adicionados dinamicamente
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) {
          if (node.matches?.('a[href^="https://buy.stripe"]')) {
            updateLinks(node.parentElement);
          } else if (node.querySelectorAll) {
            updateLinks(node);
          }
        }
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
