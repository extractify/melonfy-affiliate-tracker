/**
 * Script de Rastreamento de Afiliados v3.0 (Mínimo e Não-Invasivo)
 *
 * Abordagem: Detecta URLs Stripe e adiciona client_reference_id.
 * Não sobrescreve protótipos nativos do browser.
 *
 * Métodos:
 * 1. Modifica links <a> existentes e dinâmicos (MutationObserver)
 * 2. Intercepta window.open() (usado por React/Lovable)
 * 3. Click listener como fallback
 *
 * <script src="URL/affiliate-tracker-v3.js" defer></script>
 */
(function () {
  "use strict";

  var PARAM = "client_reference_id";
  var STORAGE_KEY = "client_reference_id";
  var STRIPE = "https://buy.stripe.com/";

  // --- Captura o ID ---
  var id = null;
  try {
    var fromUrl = new URLSearchParams(window.location.search).get(PARAM);
    if (fromUrl) {
      id = fromUrl;
      localStorage.setItem(STORAGE_KEY, fromUrl);
    } else {
      id = localStorage.getItem(STORAGE_KEY);
    }
  } catch (e) {}

  if (!id) return; // Sem afiliado, não faz nada

  // --- Utilitários ---
  function isStripe(url) {
    return url && typeof url === "string" && url.startsWith(STRIPE);
  }

  function addParam(url) {
    try {
      var u = new URL(url);
      u.searchParams.set(PARAM, id);
      return u.toString();
    } catch (e) {
      return url;
    }
  }

  function tagLink(link) {
    if (link && link.href && isStripe(link.href)) {
      link.href = addParam(link.href);
    }
  }

  // --- 1. Modifica links <a> já existentes ---
  document.querySelectorAll("a").forEach(tagLink);

  // --- 2. Observa novos links e mudanças de href ---
  try {
    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.type === "childList") {
          m.addedNodes.forEach(function (node) {
            if (node.nodeType !== 1) return;
            if (node.tagName === "A") tagLink(node);
            if (node.querySelectorAll) {
              node.querySelectorAll("a").forEach(tagLink);
            }
          });
        }
        if (m.type === "attributes" && m.target.tagName === "A") {
          tagLink(m.target);
        }
      });
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["href"],
    });
  } catch (e) {}

  // --- 3. Intercepta window.open() ---
  try {
    var _open = window.open;
    window.open = function (url) {
      if (isStripe(url)) {
        arguments[0] = addParam(url);
      }
      return _open.apply(this, arguments);
    };
  } catch (e) {}

  // --- 4. Click fallback para links <a> ---
  document.addEventListener(
    "click",
    function (e) {
      var a = e.target.closest("a");
      if (a && isStripe(a.href)) {
        a.href = addParam(a.href);
      }
    },
    { capture: true }
  );
})();
