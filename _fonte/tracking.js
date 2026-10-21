(function () {
  // ===== CONFIGURAÇÃO — preencher com os códigos do escritório =====
  var CFG = {
    META_PIXEL_ID: "1374737941406426",   // ex.: "123456789012345" (Gerenciador de Eventos da Meta)
    GA_ID: "G-0XJ03T0HMW"            // ex.: "G-XXXXXXXXXX" (Google Analytics 4)
  };
  // =================================================================

  // 1) Origem da visita (anúncio, Instagram, Google…), guardada durante a visita
  var origem = "";
  try {
    var q = new URLSearchParams(location.search);
    var o = q.get("utm_campaign") || q.get("utm_source") || (q.get("fbclid") ? "facebook" : "") || (q.get("gclid") ? "google" : "");
    if (o) sessionStorage.setItem("origem", o.slice(0, 40));
    origem = sessionStorage.getItem("origem") || "";
  } catch (e) {}

  // 2) Clique no WhatsApp: acrescenta a origem na mensagem e registra o Lead
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="wa.me/"]') : null;
    if (!a) return;
    try {
      var href = a.getAttribute("href");
      if (href.indexOf("%5Bsite") === -1) {
        var partes = ["site"];
        if (window.ORIGEM_PAGINA) partes.push(window.ORIGEM_PAGINA);
        if (origem && origem !== window.ORIGEM_PAGINA) partes.push(origem);
        var tag = " [" + partes.join(" · ") + "]";
        a.setAttribute("href", href + (href.indexOf("?text=") > -1 ? encodeURIComponent(tag) : "?text=" + encodeURIComponent(tag.trim())));
      }
    } catch (x) {}
    var nome = a.getAttribute("data-evento") || document.title;
    // candidato a vaga nao e cliente: nao conta como Lead (nao atrapalha a otimizacao dos anuncios)
    if (a.hasAttribute("data-candidato")) {
      try { if (window.fbq) window.fbq("trackCustom", "Candidatura", { content_name: nome }); } catch (x) {}
      try { if (window.gtag) window.gtag("event", "candidatura", { method: "whatsapp" }); } catch (x) {}
      return;
    }
    try { if (window.fbq) window.fbq("track", "Lead", { content_name: nome }); } catch (x) {}
    try { if (window.gtag) window.gtag("event", "generate_lead", { method: "whatsapp", lead_source: [window.ORIGEM_PAGINA, origem].filter(Boolean).join(" · ") || "direto", item_name: nome }); } catch (x) {}
  }, true);

  // 3) Ferramentas de medição — só carregam depois do aceite
  var carregado = false;
  function carregar() {
    if (carregado) return; carregado = true;
    if (CFG.META_PIXEL_ID) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", CFG.META_PIXEL_ID);
      window.fbq("track", "PageView");
    }
    if (CFG.GA_ID) {
      var g = document.createElement("script"); g.async = true; g.src = "https://www.googletagmanager.com/gtag/js?id=" + CFG.GA_ID; document.head.appendChild(g);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", CFG.GA_ID, { anonymize_ip: true });
    }
  }

  // 4) Aviso de cookies
  function escolha(v) { try { localStorage.setItem("cookies-ok", v); } catch (e) {} }
  function lerEscolha() { try { return localStorage.getItem("cookies-ok"); } catch (e) { return null; } }
  function mostrarAviso() {
    if (document.getElementById("aviso-cookies")) return;
    var d = document.createElement("div");
    d.id = "aviso-cookies";
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-label", "Aviso de cookies");
    d.style.cssText = "position:fixed;left:16px;right:96px;bottom:16px;max-width:460px;z-index:60;background:#1A1A1A;color:#FFFFFF;border-radius:18px;padding:18px 20px;box-shadow:0 14px 40px rgba(0,0,0,.28);font-family:'DM Sans',system-ui,sans-serif;font-size:14px;line-height:1.5;display:flex;flex-direction:column;gap:12px";
    d.innerHTML = '<span>Usamos cookies para medir as visitas e os anúncios do escritório. Você escolhe. <a href="privacidade.html" style="color:#FF95A3">Política de privacidade</a></span>' +
      '<span style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" id="ck-sim" style="border:none;background:#25D366;color:#052E16;font-weight:800;font-size:14px;padding:11px 18px;border-radius:999px;cursor:pointer;min-height:44px">Aceitar</button>' +
      '<button type="button" id="ck-nao" style="border:1.5px solid #5A5A60;background:transparent;color:#FFFFFF;font-weight:700;font-size:14px;padding:11px 18px;border-radius:999px;cursor:pointer;min-height:44px">Recusar</button></span>';
    if (window.innerWidth < 640) {
      d.style.left = "10px"; d.style.right = "10px"; d.style.bottom = "10px"; d.style.maxWidth = "none";
      d.style.padding = "12px 14px"; d.style.gap = "8px"; d.style.fontSize = "13px"; d.style.zIndex = "70";
    }
    document.body.appendChild(d);
    document.getElementById("ck-sim").onclick = function () { escolha("sim"); d.remove(); carregar(); };
    document.getElementById("ck-nao").onclick = function () { escolha("nao"); d.remove(); };
  }
  window.preferenciasCookies = mostrarAviso;

  var c = lerEscolha();
  if (c === "sim") carregar();
  else if (c !== "nao" && (CFG.META_PIXEL_ID || CFG.GA_ID)) mostrarAviso();
})();
