/* Assistente virtual do site — Matheus Silva Advocacia
   - Conversa com a IA no servidor do escritório (Railway). Nada fica gravado.
   - Nome e CPF NÃO passam pela IA: vão direto do aparelho da pessoa para o WhatsApp do escritório. */
(function () {
  "use strict";
  var API = "https://guias-clientes-production.up.railway.app/site/";
  var WA = "5568999993427";
  var calmo = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var msgs = [], tema = "outro", ocupado = false, aberto = false, montado = false;
  var SUGESTOES = ["Fui demitido(a) e acho que não recebi tudo", "O INSS negou meu benefício", "Salário-maternidade", "Minha mala foi extraviada", "Meu nome foi negativado", "Minha empresa foi processada"];

  function el(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function formatar(t) {
    return esc(t).replace(/(https?:\/\/(?:www\.)?matheussilvaadv\.com\.br\/[\w\-.\/]*)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
  }
  function evento(nome, extra) { try { if (window.gtag) window.gtag("event", nome, extra || {}); } catch (e) {} }

  var CSS = '' +
    '.as-bt{position:fixed;right:26px;bottom:98px;z-index:55;display:flex;align-items:center;gap:10px;border:none;cursor:pointer;background:#1A1A1A;color:#fff;border-radius:999px;padding:0 18px 0 6px;height:52px;box-shadow:0 10px 26px rgba(0,0,0,.28);font:700 14px/1 "DM Sans",system-ui,sans-serif}' +
    '.as-bt .as-ic{width:40px;height:40px;border-radius:50%;background:#C8102E;display:flex;align-items:center;justify-content:center;position:relative}' +
    '.as-bt .as-ia{position:absolute;top:-4px;right:-6px;background:#F5B82E;color:#1A1A1A;font:800 9px/1 Montserrat,sans-serif;padding:3px 4px;border-radius:6px}' +
    '.as-bt:hover{transform:translateY(-2px)}.as-bt{transition:transform .2s}' +
    '@media (max-width:640px){.as-bt{right:18px;bottom:92px;padding:0;width:52px;justify-content:center}.as-bt .as-tx{display:none}.as-bt .as-ic{width:52px;height:52px}}' +
    '@media (max-width:640px){#aviso-cookies ~ .as-bt{bottom:178px}}' +
    '.as-pn{position:fixed;right:22px;bottom:22px;z-index:80;width:390px;height:min(640px,calc(100vh - 44px));background:#FFFDF9;border-radius:22px;box-shadow:0 24px 60px rgba(0,0,0,.32);display:flex;flex-direction:column;overflow:hidden;font-family:"DM Sans",system-ui,sans-serif;color:#1A1A1A;transform-origin:bottom right}' +
    '.as-pn[hidden]{display:none}' +
    '.as-pn.as-in{animation:asin .28s cubic-bezier(.2,.7,.2,1)}@keyframes asin{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:none}}' +
    '@media (max-width:640px){.as-pn{right:0;bottom:0;width:100%;height:100%;height:100dvh;border-radius:0}}' +
    '.as-hd{display:flex;align-items:center;gap:12px;padding:14px 16px;background:#1A1A1A;color:#fff}' +
    '.as-hd img{width:38px;height:38px;border-radius:50%;object-fit:contain;background:#0A0510;padding:4px;box-sizing:border-box}' +
    '.as-hd b{display:block;font:800 15px/1.2 Montserrat,sans-serif}.as-hd small{display:block;font-size:12px;color:#C9C6BF;line-height:1.35}' +
    '.as-x{margin-left:auto;border:none;background:transparent;color:#fff;width:44px;height:44px;border-radius:50%;cursor:pointer;font-size:26px;line-height:1}' +
    '.as-x:hover{background:rgba(255,255,255,.12)}' +
    '.as-ms{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px;background:#F5EBD9}' +
    '.as-m{max-width:86%;padding:10px 13px;border-radius:16px;font-size:15px;line-height:1.5;word-wrap:break-word}' +
    '.as-m a{color:#A50D26;font-weight:700}' +
    '.as-a{align-self:flex-start;background:#fff;border-radius:4px 16px 16px 16px;box-shadow:0 1px 2px rgba(0,0,0,.08)}' +
    '.as-p{align-self:flex-end;background:#1A1A1A;color:#fff;border-radius:16px 4px 16px 16px}' +
    '.as-ch{display:flex;flex-wrap:wrap;gap:8px}' +
    '.as-ch button{border:1.5px solid #D8C8AC;background:#FFFDF9;color:#1A1A1A;border-radius:999px;padding:9px 13px;font:600 14px "DM Sans",system-ui,sans-serif;cursor:pointer;min-height:40px;text-align:left}' +
    '.as-ch button:hover{border-color:#C8102E}' +
    '.as-ty{display:flex;gap:4px;padding:14px}.as-ty i{width:7px;height:7px;border-radius:50%;background:#8A8378;animation:asd 1.1s infinite}.as-ty i:nth-child(2){animation-delay:.15s}.as-ty i:nth-child(3){animation-delay:.3s}' +
    '@keyframes asd{0%,80%,100%{opacity:.3;transform:none}40%{opacity:1;transform:translateY(-3px)}}' +
    '.as-en{display:none;margin:0 14px 10px;border:none;border-radius:14px;background:#25D366;color:#052E16;font:800 15px "DM Sans",system-ui,sans-serif;padding:13px 14px;cursor:pointer;align-items:center;justify-content:center;gap:8px;min-height:48px}' +
    '.as-en.on{display:flex}.as-en.pronto{box-shadow:0 0 0 4px rgba(37,211,102,.28)}' +
    '.as-ft{display:flex;gap:8px;align-items:flex-end;padding:10px 12px 12px;border-top:1px solid #EFE4D2;background:#FFFDF9}' +
    '.as-ft textarea{flex:1;resize:none;border:1.5px solid #D8C8AC;border-radius:14px;padding:11px 12px;font:15px/1.4 "DM Sans",system-ui,sans-serif;max-height:110px;min-height:46px;box-sizing:border-box;background:#fff;color:#1A1A1A}' +
    '.as-ft textarea:focus{outline:2px solid #C8102E;outline-offset:1px;border-color:transparent}' +
    '.as-sd{border:none;background:#C8102E;color:#fff;width:46px;height:46px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;flex:none}' +
    '.as-sd:disabled{opacity:.45;cursor:default}' +
    '.as-av{padding:0 14px 8px;font-size:11.5px;color:#6B6358;line-height:1.4;background:#FFFDF9}' +
    '.as-cd{background:#fff;border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;box-shadow:0 2px 6px rgba(0,0,0,.08);align-self:stretch}' +
    '.as-cd label{font:700 13px "DM Sans",system-ui,sans-serif;display:flex;flex-direction:column;gap:5px}' +
    '.as-cd input[type=text],.as-cd textarea{border:1.5px solid #D8C8AC;border-radius:10px;padding:10px;font:15px "DM Sans",system-ui,sans-serif;width:100%;box-sizing:border-box;color:#1A1A1A;background:#fff}' +
    '.as-cd textarea{min-height:84px;resize:vertical}' +
    '.as-cd .as-ok{flex-direction:row;align-items:flex-start;gap:8px;font-weight:500;font-size:12.5px;line-height:1.45;color:#4A443C}' +
    '.as-cd .as-ok input{margin-top:3px;width:18px;height:18px;flex:none}' +
    '.as-cd .as-er{color:#A50D26;font-size:13px;font-weight:700;min-height:1em}' +
    '.as-cd .as-go{border:none;border-radius:12px;background:#25D366;color:#052E16;font:800 15px "DM Sans",system-ui,sans-serif;padding:13px;cursor:pointer;min-height:48px}' +
    '.as-cd .as-vt{border:none;background:none;color:#5A5248;text-decoration:underline;cursor:pointer;font:600 13px "DM Sans",system-ui,sans-serif;align-self:flex-start;padding:4px 0}' +
    (calmo ? '.as-pn.as-in{animation:none}.as-ty i{animation:none}' : '');

  var bt, pn, ms, ta, sd, en;
  function montar() {
    if (montado) return; montado = true;
    pn = el("div", { class: "as-pn", role: "dialog", "aria-modal": "true", "aria-label": "Assistente virtual do escritório", hidden: "" });
    pn.innerHTML =
      '<div class="as-hd"><img src="assets/logo-ms.jpg" alt=""><span><b>Assistente virtual · IA</b><small>Tira dúvidas gerais. Quem analisa o seu caso é o Dr. Matheus.</small></span><button class="as-x" type="button" aria-label="Fechar">×</button></div>' +
      '<div class="as-ms" aria-live="polite"></div>' +
      '<button class="as-en" type="button"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="#052E16"><path d="M12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.69 1.45c6.55 0 11.89-5.34 11.89-11.9A11.82 11.82 0 0 0 12.05 0z"/></svg>Enviar meu caso ao Dr. Matheus</button>' +
      '<div class="as-ft"><textarea rows="1" maxlength="500" placeholder="Escreva sua dúvida…" aria-label="Sua mensagem"></textarea><button class="as-sd" type="button" aria-label="Enviar mensagem"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div>' +
      '<div class="as-av">Assistente com inteligência artificial: dá informações gerais, não é consulta. Não mande CPF, documentos ou senhas por aqui. A conversa não fica gravada. <a href="privacidade.html" target="_blank" rel="noopener" style="color:#5A5248">Privacidade</a></div>';
    document.body.appendChild(pn);
    ms = pn.querySelector(".as-ms"); ta = pn.querySelector("textarea"); sd = pn.querySelector(".as-sd"); en = pn.querySelector(".as-en");
    pn.querySelector(".as-x").addEventListener("click", fechar);
    sd.addEventListener("click", function () { enviar(ta.value); });
    ta.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(ta.value); } });
    ta.addEventListener("input", function () { ta.style.height = "auto"; ta.style.height = Math.min(110, ta.scrollHeight) + "px"; });
    pn.addEventListener("keydown", function (e) { if (e.key === "Escape") fechar(); });
    en.addEventListener("click", cartao);
    bolha("a", "Olá! Sou o <strong>assistente virtual</strong> do escritório, uma inteligência artificial. Explico seus direitos de um jeito simples e, se quiser, ajudo a mandar o seu caso para o Dr. Matheus pelo WhatsApp.<br><br>Sobre o que é a sua dúvida?", true);
    var ch = el("div", { class: "as-ch" });
    SUGESTOES.forEach(function (s) { var b = el("button", { type: "button" }); b.textContent = s; b.addEventListener("click", function () { ch.remove(); enviar(s); }); ch.appendChild(b); });
    ms.appendChild(ch);
  }
  function bolha(quem, html, jaHtml) {
    var d = el("div", { class: "as-m " + (quem === "a" ? "as-a" : "as-p") });
    d.innerHTML = jaHtml ? html : formatar(html);
    ms.appendChild(d); ms.scrollTop = ms.scrollHeight; return d;
  }
  function abrir() {
    montar(); aberto = true; pn.hidden = false; pn.classList.remove("as-in"); void pn.offsetWidth; pn.classList.add("as-in");
    bt.style.display = "none"; document.documentElement.style.overflow = window.innerWidth < 640 ? "hidden" : "";
    setTimeout(function () { ta.focus(); }, 60);
    evento("assistente_aberto");
  }
  function fechar() { aberto = false; pn.hidden = true; bt.style.display = ""; document.documentElement.style.overflow = ""; bt.focus(); }

  function chamar(rota, corpo) {
    return fetch(API + rota, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._st = r.status; return j; }); });
  }
  function enviar(t) {
    t = String(t || "").trim(); if (!t || ocupado) return;
    var ch = ms.querySelector(".as-ch"); if (ch) ch.remove();
    var cd = ms.querySelector(".as-cd"); if (cd) cd.remove();
    var tinhaCpf = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/.test(t);
    if (tinhaCpf) t = t.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, "[CPF removido]");
    ta.value = ""; ta.style.height = "auto";
    bolha("p", t); msgs.push({ de: "pessoa", t: t });
    if (tinhaCpf) bolha("a", "Por segurança, tirei o CPF da sua mensagem. Ele vai só no formulário de envio para o WhatsApp, que não passa pela IA.");
    ocupado = true; sd.disabled = true;
    var ty = el("div", { class: "as-m as-a as-ty", "aria-label": "Assistente digitando" }, "<i></i><i></i><i></i>"); ms.appendChild(ty); ms.scrollTop = ms.scrollHeight;
    chamar("chat", { msgs: msgs.slice(-14) }).then(function (j) {
      ty.remove();
      var r = j.resposta || "Desculpe, não consegui responder agora. Você pode falar direto com o escritório pelo botão verde do WhatsApp.";
      bolha("a", r); msgs.push({ de: "assistente", t: r });
      if (j.tema && j.tema !== "outro") tema = j.tema;
      en.classList.add("on"); if (j.pronto) en.classList.add("pronto");
      evento("assistente_mensagem", { item_name: tema });
    }).catch(function () {
      ty.remove(); bolha("a", "Sem conexão com o assistente agora. Você pode falar direto com o escritório pelo botão verde do WhatsApp.");
      en.classList.add("on");
    }).then(function () { ocupado = false; sd.disabled = false; ta.focus(); });
  }

  // ---------- CPF ----------
  function cpfValido(c) {
    c = String(c).replace(/\D/g, ""); if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
    for (var t = 9; t < 11; t++) { var s = 0; for (var i = 0; i < t; i++) s += +c[i] * (t + 1 - i); var d = (s * 10) % 11 % 10; if (+c[t] !== d) return false; }
    return true;
  }
  function mascara(v) { v = v.replace(/\D/g, "").slice(0, 11); return v.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"); }

  function cartao() {
    if (ms.querySelector(".as-cd")) { ms.querySelector(".as-cd").scrollIntoView({ block: "nearest" }); return; }
    en.classList.remove("on");
    var cd = el("div", { class: "as-cd" });
    cd.innerHTML =
      '<strong style="font:800 15px Montserrat,sans-serif">Enviar ao Dr. Matheus pelo WhatsApp</strong>' +
      '<label>Resumo do caso <textarea class="as-rs" placeholder="Preparando o resumo…"></textarea></label>' +
      '<label>Seu nome completo <input type="text" class="as-nm" autocomplete="name" maxlength="80"></label>' +
      '<label>CPF (para o escritório consultar o seu caso) <input type="text" class="as-cpf" inputmode="numeric" autocomplete="off" maxlength="14" placeholder="000.000.000-00"></label>' +
      '<label class="as-ok"><input type="checkbox" class="as-au"><span>Autorizo o escritório Matheus Silva Advocacia a usar meu nome e CPF para analisar meu caso e consultar meus dados (INSS, processos e cadastros), conforme a <a href="privacidade.html" target="_blank" rel="noopener">política de privacidade</a>.</span></label>' +
      '<span class="as-er" role="alert"></span>' +
      '<button type="button" class="as-go">Abrir o WhatsApp com a mensagem pronta</button>' +
      '<button type="button" class="as-vt">Voltar para a conversa</button>';
    ms.appendChild(cd); cd.scrollIntoView({ block: "start" });
    var rs = cd.querySelector(".as-rs"), nm = cd.querySelector(".as-nm"), cpf = cd.querySelector(".as-cpf"), au = cd.querySelector(".as-au"), er = cd.querySelector(".as-er");
    cpf.addEventListener("input", function () { cpf.value = mascara(cpf.value); });
    cd.querySelector(".as-vt").addEventListener("click", function () { cd.remove(); en.classList.add("on"); ta.focus(); });
    if (msgs.length) {
      chamar("resumo", { msgs: msgs.slice(-14) }).then(function (j) { if (!rs.value) rs.value = j.resumo || ""; if (j.tema && j.tema !== "outro") tema = j.tema; rs.placeholder = "Conte em poucas linhas o que aconteceu"; })
        .catch(function () { rs.placeholder = "Conte em poucas linhas o que aconteceu"; });
    } else rs.placeholder = "Conte em poucas linhas o que aconteceu";
    nm.focus();
    cd.querySelector(".as-go").addEventListener("click", function () {
      var n = nm.value.trim(), c = cpf.value.trim(), r = rs.value.trim();
      if (n.split(/\s+/).length < 2) { er.textContent = "Escreva seu nome completo."; nm.focus(); return; }
      if (!cpfValido(c)) { er.textContent = "Confira o CPF: os números não batem."; cpf.focus(); return; }
      if (!au.checked) { er.textContent = "Marque a autorização para continuar."; au.focus(); return; }
      er.textContent = "";
      var txt = "Olá Dr. Matheus, vim pelo assistente do site.\n\nNome: " + n + "\nCPF: " + mascara(c) + (r ? "\n\nResumo: " + r : "") +
        "\n\nAutorizo o uso dos meus dados para a análise do caso. Vou mandar as fotos dos documentos por aqui.\n[site · assistente" + (tema && tema !== "outro" ? " · " + tema : "") + "]";
      try { if (window.fbq) window.fbq("track", "Lead", { content_name: "Assistente · " + tema }); } catch (e) {}
      evento("generate_lead", { method: "assistente", lead_source: "assistente · " + tema });
      // abre por window.open (e não por link): assim o endereço com o CPF não é registrado como "clique em link" pelo Analytics
      var destino = "https://wa.me/" + WA + "?text=" + encodeURIComponent(txt);
      var w = window.open(destino, "_blank");
      if (w) { try { w.opener = null; } catch (e) {} } else location.href = destino;
      nm.value = ""; cpf.value = ""; au.checked = false;
      bolha("a", "Pronto! Abri o WhatsApp com a sua mensagem. É só tocar em enviar lá. Depois mande as fotos dos documentos na mesma conversa.");
    });
  }

  function iniciar() {
    document.head.appendChild(el("style", {}, CSS));
    bt = el("button", { class: "as-bt", type: "button", "aria-label": "Abrir o assistente virtual" });
    bt.innerHTML = '<span class="as-ic"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg><span class="as-ia">IA</span></span><span class="as-tx">Tire sua dúvida</span>';
    bt.addEventListener("click", function () { aberto ? fechar() : abrir(); });
    document.body.appendChild(bt);
    document.querySelectorAll("[data-assistente]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); abrir(); }); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
