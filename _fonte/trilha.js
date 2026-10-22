// Trilha de estudo do estágio (22/10/2026): módulos com "marcar como lido" + quiz pelo link pessoal (?t=TOKEN).
// O quiz é sorteado e corrigido pelo robô do escritório (selecao.js no middleware) — o gabarito não fica na página.
window.ORIGEM_PAGINA = "trilha-estagio";
(function () {
  var API = "https://claude-kommo-middleware-production.up.railway.app";
  try { var qa = new URLSearchParams(location.search).get("api"); if (qa && /^http:\/\/localhost(:\d+)?$/.test(qa)) API = qa; } catch (e) {}
  var NUMERO = "5568999993427";
  var token = ""; try { token = new URLSearchParams(location.search).get("t") || ""; } catch (e) {}
  var CHAVE = "trilha-lidos";
  var mods = Array.prototype.slice.call(document.querySelectorAll(".tr-mod"));
  var lidos = {}; try { lidos = JSON.parse(localStorage.getItem(CHAVE) || "{}") || {}; } catch (e) {}
  var qz = document.getElementById("qz");
  var info = null;
  var prova = null, resp = {}, idx = 0;

  function salvarLidos() { try { localStorage.setItem(CHAVE, JSON.stringify(lidos)); } catch (e) {} }
  function totalLidos() { return mods.filter(function (m) { return lidos[m.dataset.mod]; }).length; }
  function progresso() {
    var n = totalLidos();
    document.getElementById("tr-prog").style.width = Math.round(n / mods.length * 100) + "%";
    document.getElementById("tr-prog-txt").textContent = n + " de " + mods.length + " módulos";
    mods.forEach(function (m) {
      var ok = !!lidos[m.dataset.mod]; m.classList.toggle("lido", ok);
      var b = m.querySelector(".tr-lido"); if (b) b.textContent = ok ? "✓ Lido" : "Marcar como lido";
    });
    if (info && !prova) desenharInicio();
  }
  mods.forEach(function (m, i) {
    var b = m.querySelector(".tr-lido");
    if (b) b.addEventListener("click", function () {
      lidos[m.dataset.mod] = !lidos[m.dataset.mod]; salvarLidos(); progresso();
      if (lidos[m.dataset.mod]) { m.open = false; var prox = mods[i + 1]; if (prox && !lidos[prox.dataset.mod]) { prox.open = true; setTimeout(function () { prox.scrollIntoView({ behavior: "smooth", block: "start" }); }, 150); } else if (totalLidos() === mods.length) document.getElementById("quiz").scrollIntoView({ behavior: "smooth" }); }
    });
  });
  if (!totalLidos() && mods[0]) mods[0].open = true;

  function el(tag, attrs, filhos) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) { if (k === "text") e.textContent = attrs[k]; else if (k === "html") e.innerHTML = attrs[k]; else e.setAttribute(k, attrs[k]); }
    (filhos || []).forEach(function (f) { if (f) e.appendChild(typeof f === "string" ? document.createTextNode(f) : f); });
    return e;
  }
  function limpa() { qz.innerHTML = ""; }
  function msg(t) { limpa(); qz.appendChild(el("p", { style: "margin:0;font-size:16px;line-height:1.6", html: t })); }
  function waLink(texto) { return "https://wa.me/" + NUMERO + "?text=" + encodeURIComponent(texto); }
  function botaoWa(texto, rotulo) { var a = el("a", { "class": "wa-bt", href: waLink(texto), target: "_blank", rel: "noopener", "data-candidato": "1" }, [rotulo]); return a; }

  function carregar() {
    if (!token) { msg("O quiz abre pelo <strong>link pessoal</strong> que você recebeu no WhatsApp do escritório depois de enviar a ficha. Ainda não se inscreveu? <a href=\"trabalhe-conosco.html\">Preencha a ficha aqui</a>."); return; }
    fetch(API + "/selecao/quiz?t=" + encodeURIComponent(token), { cache: "no-store" }).then(function (r) { return r.json().then(function (j) { return { st: r.status, j: j }; }); })
      .then(function (x) {
        if (x.st !== 200) { msg("Este link não é válido ou é de uma inscrição antiga. Use o link mais recente que chegou no seu WhatsApp."); return; }
        info = x.j;
        if (info.nome) document.getElementById("tr-ola").textContent = "Oi, " + info.nome + "! Esta é a sua trilha de estudo";
        desenharInicio();
      }).catch(function () { msg("Não consegui carregar o quiz agora. Verifique a internet e recarregue a página."); });
  }

  function desenharInicio() {
    limpa();
    if (info.passou) {
      qz.appendChild(el("h3", { "class": "qz-q", text: "Você já passou no quiz (" + info.melhor + " de " + info.total + ") 🎉" }));
      qz.appendChild(el("p", { style: "margin:0;font-size:16px;line-height:1.6", text: "Próxima etapa: o teste prático. Quando estiver pronto(a), com uns 40 minutos livres e no computador, mande QUERO FAZER O TESTE no WhatsApp do escritório." }));
      qz.appendChild(el("div", {}, [botaoWa("QUERO FAZER O TESTE", "Estou pronto(a): quero fazer o teste")]));
      return;
    }
    if (!info.podeFazer) {
      qz.appendChild(el("h3", { "class": "qz-q", text: "Suas tentativas do quiz terminaram" }));
      qz.appendChild(el("p", { style: "margin:0;font-size:16px;line-height:1.6", text: "Obrigado pela dedicação! O resultado já foi enviado no seu WhatsApp. O material continua aqui para você estudar." }));
      return;
    }
    var faltam = mods.length - totalLidos();
    qz.appendChild(el("h3", { "class": "qz-q", text: faltam ? "Leia os módulos antes do quiz" : "Tudo lido. Pronto(a) para o quiz?" }));
    qz.appendChild(el("p", { style: "margin:0;font-size:16px;line-height:1.6", text: (faltam ? "Faltam " + faltam + " módulo" + (faltam > 1 ? "s" : "") + " para marcar como lido. " : "") + "São " + info.total + " perguntas; passa com " + info.minimo + " acertos. Tentativa " + (info.tentativas + 1) + " de " + info.max + "." }));
    var b = el("button", { type: "button", "class": "qz-bt verm", text: "Começar o quiz" });
    if (faltam) b.disabled = true;
    b.addEventListener("click", comecar);
    qz.appendChild(el("div", {}, [b]));
  }

  function comecar() {
    msg("Sorteando as perguntas…");
    fetch(API + "/selecao/quiz?prova=1&t=" + encodeURIComponent(token), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.perguntas) { info = j; desenharInicio(); return; }
      prova = j.perguntas; resp = {}; idx = 0; pergunta();
    }).catch(function () { msg("Não consegui sortear as perguntas. Recarregue a página."); });
  }
  function pergunta() {
    limpa();
    var q = prova[idx];
    qz.appendChild(el("div", { style: "display:flex;justify-content:space-between;font-size:14px;color:#6B6258" }, [el("span", { text: "Pergunta " + (idx + 1) + " de " + prova.length }), idx ? (function () { var v = el("button", { type: "button", "class": "qz-sec", text: "← Voltar" }); v.addEventListener("click", function () { idx--; pergunta(); }); return v; })() : el("span")]));
    var tr = el("div", { "class": "qz-trilho" }, [el("div", { "class": "qz-barra", style: "width:" + Math.round(idx / prova.length * 100) + "%" })]);
    qz.appendChild(tr);
    var h = el("h3", { "class": "qz-q", tabindex: "-1", text: q.p }); qz.appendChild(h);
    var lista = el("div", { style: "display:flex;flex-direction:column;gap:10px", role: "radiogroup", "aria-label": q.p });
    q.alt.forEach(function (a) {
      var b = el("button", { type: "button", "class": "qz-op", "aria-pressed": resp[q.id] === a.id ? "true" : "false" }, [el("span", { "class": "l", text: a.id }), el("span", { text: a.texto })]);
      b.addEventListener("click", function () {
        resp[q.id] = a.id;
        Array.prototype.forEach.call(lista.children, function (x) { x.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true");
        setTimeout(function () { if (idx < prova.length - 1) { idx++; pergunta(); } else revisar(); }, 260);
      });
      lista.appendChild(b);
    });
    qz.appendChild(lista);
    try { h.focus({ preventScroll: true }); } catch (e) {}
  }
  function revisar() {
    limpa();
    var faltam = prova.filter(function (q) { return !resp[q.id]; }).length;
    qz.appendChild(el("h3", { "class": "qz-q", text: faltam ? "Faltam " + faltam + " resposta(s)" : "Tudo respondido!" }));
    qz.appendChild(el("p", { style: "margin:0;font-size:16px;line-height:1.6", text: faltam ? "Volte e responda todas antes de enviar." : "Quer conferir alguma? Use o Voltar. Quando estiver seguro(a), envie." }));
    var acoes = el("div", { style: "display:flex;flex-wrap:wrap;gap:12px;align-items:center" });
    var v = el("button", { type: "button", "class": "qz-sec", text: "← Voltar às perguntas" }); v.addEventListener("click", function () { idx = prova.length - 1; pergunta(); });
    var e = el("button", { type: "button", "class": "qz-bt verm", text: "Enviar respostas" }); if (faltam) e.disabled = true;
    e.addEventListener("click", enviar);
    acoes.appendChild(e); acoes.appendChild(v); qz.appendChild(acoes);
  }
  function enviar() {
    msg("Corrigindo…");
    fetch(API + "/selecao/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t: token, respostas: resp }) })
      .then(function (r) { return r.json(); }).then(resultado).catch(function () { msg("Não consegui enviar. Verifique a internet e tente de novo."); });
  }
  function resultado(r) {
    limpa();
    if (r.erro) { msg(r.erro); return; }
    try { if (window.gtag) window.gtag("event", "quiz_estagio", { acertos: r.acertos, passou: r.passou }); } catch (e) {}
    qz.appendChild(el("h3", { "class": "qz-q", text: r.passou ? "Você passou: " + r.acertos + " de " + r.total + "! 🎉" : "Você fez " + r.acertos + " de " + r.total }));
    if (r.passou) {
      qz.appendChild(el("p", { style: "margin:0;font-size:16px;line-height:1.6", text: "Próxima etapa: o teste prático, que você começa quando quiser. Escolha um momento tranquilo, com uns 40 minutos livres e no computador, e mande QUERO FAZER O TESTE no WhatsApp do escritório." }));
      qz.appendChild(el("div", {}, [botaoWa("QUERO FAZER O TESTE", "Estou pronto(a): quero fazer o teste")]));
    } else if (r.tentativasRestantes > 0) {
      qz.appendChild(el("p", { style: "margin:0;font-size:16px;line-height:1.6", text: "Para passar são " + r.minimo + " acertos. Revise os módulos com calma, principalmente os temas abaixo, e tente de novo (resta " + r.tentativasRestantes + " tentativa). As perguntas mudam." }));
    } else {
      qz.appendChild(el("p", { style: "margin:0;font-size:16px;line-height:1.6", text: "Desta vez não deu. Obrigado pela dedicação! Abaixo estão as respostas certas, para você estudar." }));
    }
    var lista = el("div", { style: "display:flex;flex-direction:column;gap:8px" });
    (r.itens || []).forEach(function (i) {
      if (!r.passou && r.tentativasRestantes > 0 && i.acertou) return; // na 1ª reprovação mostra só os temas que errou
      lista.appendChild(el("div", { "class": "qz-item " + (i.acertou ? "ok" : "err") }, [el("strong", { text: (i.acertou ? "✓ " : "✗ ") + i.p }), i.certa ? el("div", { style: "margin-top:4px", text: "Resposta: " + i.certa }) : null, i.explicacao ? el("div", { style: "margin-top:4px;color:#5A5248", text: i.explicacao }) : null]));
    });
    if (lista.children.length) { qz.appendChild(el("h4", { style: "margin:6px 0 0;font-family:Montserrat,sans-serif", text: r.passou ? "Confira as explicações" : "Temas para revisar" })); qz.appendChild(lista); }
    if (!r.passou && r.tentativasRestantes > 0) { var b = el("button", { type: "button", "class": "qz-sec", text: "Voltar aos módulos ↑" }); b.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); }); qz.appendChild(b); info = Object.assign({}, info, { tentativas: (info.tentativas || 0) + 1 }); }
  }

  progresso();
  carregar();
})();
