// Página "Trabalhe com a gente" — ficha INTERATIVA (21/10/2026, v2): uma pergunta por vez, escolha com um toque
// avança sozinha, prévia da mensagem no fim. Nada vai para servidor: abre o WhatsApp com a ficha escrita.
// A 1ª linha "FICHA DE CANDIDATO" e a etiqueta "[site · trabalhe-conosco]" são lidas pelo robô (simulador.js, triagem).
// Sem emoji na mensagem: no WhatsApp do computador o emoji do link wa.me pode chegar como "�".
window.ORIGEM_PAGINA = "trabalhe-conosco";
(function () {
  var NUMERO = "5568999993427";
  var CHAVE = "ficha-candidato-v2";
  var raiz = document.getElementById("fx");
  if (!raiz) return;
  var corpo = document.getElementById("fx-corpo");
  var barra = document.getElementById("fx-barra");
  var cont = document.getElementById("fx-cont");
  var btVoltar = document.getElementById("fx-voltar");
  var tplWa = document.getElementById("fx-wa-svg");

  var R = {};          // respostas
  var pilha = [];      // passos visitados (para o Voltar)
  var atual = null;

  var estagio = function () { return R.vaga && R.vaga !== "Atendimento"; };
  var PASSOS = [
    { id: "vaga", tipo: "um", q: "Qual vaga te interessa?", dica: "Se você não cursa Direito, escolha Atendimento.",
      ops: [["Estágio em Direito", "para estudantes de Direito"], ["Atendimento", "qualquer formação"], ["Qualquer uma das duas", "curso Direito e topo as duas"]] },
    { id: "nome", tipo: "texto", q: "Qual é o seu nome completo?", ph: "Nome e sobrenome", auto: "name",
      valida: function (v) { return v.split(/\s+/).length >= 2 ? "" : "Escreva nome e sobrenome."; } },
    { id: "cidade", tipo: "texto", q: function () { return "Prazer, " + primeiro() + "! Em que cidade você mora?"; }, ph: "Ex.: Rio Branco/AC", auto: "address-level2" },
    { id: "faculdade", tipo: "texto", q: "Em qual faculdade você estuda?", ph: "Ex.: UFAC, Uninorte", se: estagio },
    { id: "periodo", tipo: "um", q: "Em que período do curso você está?", se: estagio,
      ops: [["1º ou 2º período"], ["3º ou 4º período"], ["5º ou 6º período"], ["7º ou 8º período"], ["9º ou 10º período"]] },
    { id: "formacao", tipo: "um", q: "Qual é a sua formação?", se: function () { return !estagio(); },
      ops: [["Ensino médio completo"], ["Curso técnico"], ["Faculdade em andamento", "outro curso"], ["Faculdade completa"]] },
    { id: "turno", tipo: "um", q: "Qual turno você pode trabalhar?", dica: "São duas vagas: uma de manhã e uma à tarde.",
      ops: [["Manhã"], ["Tarde"], ["Qualquer um"]] },
    { id: "inicio", tipo: "um", q: "Se for aprovado(a), quando poderia começar?",
      ops: [["Imediatamente"], ["Em até 15 dias"], ["Depois de 15 dias"]] },
    { id: "pc", tipo: "um", q: "Você tem computador (ou notebook) e internet estável em casa?",
      ops: [["Sim"], ["Só celular"], ["Não"]],
      nota: function (v) { return v && v !== "Sim" ? "Tudo bem seguir. Só para você saber: o trabalho é feito no computador, então isso vai ser conversado na entrevista." : ""; } },
    { id: "exp", tipo: "um", q: "Já trabalhou com atendimento ao público?", dica: "Loja, call center, recepção, escritório… tudo conta.",
      ops: [["Ainda não"], ["Sim, até 6 meses"], ["Sim, mais de 6 meses"]] },
    { id: "ondeexp", tipo: "texto", q: "Legal! Onde foi?", ph: "Ex.: call center, loja, outro escritório", opcional: true,
      se: function () { return R.exp && R.exp !== "Ainda não"; } },
    { id: "ferr", tipo: "varios", q: "Já usou alguma destas ferramentas?", dica: "Marque quantas quiser.",
      ops: [["WhatsApp Business"], ["CRM", "Kommo, RD Station…"], ["PJe ou sistema de tribunal"], ["Word ou Google Docs"], ["Planilhas"], ["Inteligência artificial", "ChatGPT, Claude…"]] },
    { id: "area", tipo: "um", q: "Qual área do escritório mais te interessa?",
      ops: [["Trabalhista"], ["Previdenciário (INSS)"], ["Consumidor"], ["Ainda não sei"]] },
    { id: "porque", tipo: "longo", q: "Em poucas palavras: por que você quer trabalhar com a gente?", dica: "Opcional, mas ajuda a te conhecer.", opcional: true, max: 400 },
    { id: "soube", tipo: "um", q: "Como você soube da vaga?",
      ops: [["Instagram"], ["Indicação de alguém"], ["Faculdade"], ["Google"], ["Site do escritório"], ["Outro"]] },
    { id: "fim", tipo: "fim", q: "Pronto! Confira sua ficha" }
  ];

  function primeiro() { return String(R.nome || "").trim().split(/\s+/)[0] || "tudo bem"; }
  function txt(x) { return typeof x === "function" ? x() : x; }
  function visiveis() { return PASSOS.filter(function (p) { return !p.se || p.se(); }); }
  function passo(id) { for (var i = 0; i < PASSOS.length; i++) if (PASSOS[i].id === id) return PASSOS[i]; }
  function proximo(id) {
    var v = visiveis(); var i = -1;
    for (var k = 0; k < v.length; k++) if (v[k].id === id) i = k;
    return v[i + 1] ? v[i + 1].id : "fim";
  }
  function el(tag, attrs, filhos) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) { if (k === "text") e.textContent = attrs[k]; else if (k === "html") e.innerHTML = attrs[k]; else e.setAttribute(k, attrs[k]); }
    (filhos || []).forEach(function (f) { if (f) e.appendChild(typeof f === "string" ? document.createTextNode(f) : f); });
    return e;
  }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify({ R: R, pilha: pilha, atual: atual })); } catch (e) {} }
  function evento(nome, extra) { try { if (window.gtag) window.gtag("event", nome, extra || {}); } catch (e) {} }

  function progresso() {
    var v = visiveis(); var i = 0;
    for (var k = 0; k < v.length; k++) if (v[k].id === atual) i = k;
    var total = v.length - 1; // a revisão não conta como pergunta
    barra.style.width = Math.round((Math.min(i, total) / total) * 100) + "%";
    cont.textContent = atual === "fim" ? "Revisão" : "Pergunta " + (i + 1);
    btVoltar.hidden = !pilha.length;
  }

  function ir(id, voltando) {
    atual = id; salvar(); progresso();
    var p = passo(id);
    corpo.innerHTML = "";
    var caixa = el("div", { "class": "fx-passo" + (voltando ? " volta" : "") });
    var h = el("h3", { "class": "fx-q", tabindex: "-1", text: txt(p.q) });
    caixa.appendChild(h);
    if (p.dica) caixa.appendChild(el("p", { "class": "fx-dica", text: txt(p.dica) }));
    var erro = el("p", { "class": "fx-erro", role: "alert", hidden: "" });

    function avancar() { pilha.push(id); ir(proximo(id)); }

    if (p.tipo === "um" || p.tipo === "varios") {
      var multi = p.tipo === "varios";
      var grade = el("div", { "class": "fx-ops", role: multi ? "group" : "radiogroup", "aria-label": txt(p.q) });
      var sel = multi ? (R[id] || []).slice() : R[id];
      var notaBox = el("div", { "class": "fx-nota", hidden: "" });
      p.ops.forEach(function (o) {
        var marcado = multi ? sel.indexOf(o[0]) > -1 : sel === o[0];
        var b = el("button", { type: "button", "class": "fx-op" + (multi ? " multi" : ""), "aria-pressed": marcado ? "true" : "false" }, [
          el("span", { "class": "fx-ic", "aria-hidden": "true", text: marcado ? "✓" : "" }),
          el("span", {}, [o[0], o[1] ? el("small", { text: o[1] }) : null])
        ]);
        b.addEventListener("click", function () {
          if (multi) {
            var i = sel.indexOf(o[0]); if (i > -1) sel.splice(i, 1); else sel.push(o[0]);
            R[id] = sel.slice(); salvar();
            var on = sel.indexOf(o[0]) > -1; b.setAttribute("aria-pressed", on ? "true" : "false"); b.firstChild.textContent = on ? "✓" : "";
            seguir.textContent = sel.length ? "Continuar" : "Nenhuma delas";
            return;
          }
          R[id] = o[0]; salvar();
          Array.prototype.forEach.call(grade.children, function (x) { x.setAttribute("aria-pressed", "false"); x.firstChild.textContent = ""; });
          b.setAttribute("aria-pressed", "true"); b.firstChild.textContent = "✓";
          var n = p.nota ? p.nota(o[0]) : "";
          if (n) { notaBox.textContent = n; notaBox.hidden = false; seguir.hidden = false; seguir.focus(); return; } // mostra o aviso e espera
          setTimeout(avancar, 280);
        });
        grade.appendChild(b);
      });
      caixa.appendChild(grade);
      caixa.appendChild(notaBox);
      var seguir = el("button", { type: "button", "class": "fx-seguir", text: multi ? ((sel && sel.length) ? "Continuar" : "Nenhuma delas") : "Continuar" });
      seguir.addEventListener("click", function () { if (!multi && !R[id]) return; if (multi) R[id] = sel.slice(); avancar(); });
      if (!multi) {
        var n0 = p.nota && R[id] ? p.nota(R[id]) : "";
        if (n0) { notaBox.textContent = n0; notaBox.hidden = false; }
        seguir.hidden = !R[id]; // se já respondeu (voltou), pode seguir sem trocar
      }
      caixa.appendChild(el("div", { "class": "fx-acoes" }, [seguir]));
    } else if (p.tipo === "texto" || p.tipo === "longo") {
      var campo = p.tipo === "texto"
        ? el("input", { type: "text", placeholder: p.ph || "", maxlength: "120", autocomplete: p.auto || "off", "aria-label": txt(p.q) })
        : el("textarea", { maxlength: String(p.max || 400), "aria-label": txt(p.q) });
      campo.value = R[id] || "";
      var bt = el("button", { type: "button", "class": "fx-seguir", text: "Continuar" });
      var ok = function () { return String(campo.value).trim().length > 0; };
      var atualiza = function () { bt.disabled = !p.opcional && !ok(); };
      campo.addEventListener("input", function () { R[id] = campo.value; erro.hidden = true; atualiza(); salvar(); });
      var confirmar = function () {
        var v = String(campo.value).replace(/\s+/g, " ").trim();
        if (!v && !p.opcional) return;
        var msg = v && p.valida ? p.valida(v) : "";
        if (msg) { erro.textContent = msg; erro.hidden = false; campo.focus(); return; }
        R[id] = v; avancar();
      };
      bt.addEventListener("click", confirmar);
      if (p.tipo === "texto") campo.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); confirmar(); } });
      caixa.appendChild(campo);
      caixa.appendChild(erro);
      var acoes = el("div", { "class": "fx-acoes" }, [bt]);
      if (p.opcional) { var pular = el("button", { type: "button", "class": "fx-pular", text: "Pular" }); pular.addEventListener("click", function () { R[id] = ""; avancar(); }); acoes.appendChild(pular); }
      else if (p.tipo === "texto") acoes.appendChild(el("span", { "class": "fx-enter", text: "ou aperte Enter" }));
      caixa.appendChild(acoes);
      atualiza();
      setTimeout(function () { try { campo.focus({ preventScroll: true }); } catch (e) {} }, 60);
    } else if (p.tipo === "fim") {
      var msg = montar();
      caixa.appendChild(el("p", { "class": "fx-dica", text: "É assim que a mensagem vai chegar no WhatsApp do escritório. Se algo estiver errado, use o Voltar." }));
      var bolha = el("div", { "class": "fx-bolha" });
      bolha.innerHTML = msg.split("\n").map(function (l) {
        var e = l.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return e.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");
      }).join("\n");
      caixa.appendChild(el("div", { "class": "fx-wa" }, [bolha]));
      var chk = el("input", { type: "checkbox" });
      var lab = el("label", { "class": "fx-lgpd" }, [chk, el("span", { html: 'Autorizo o escritório a usar estes dados só para este processo seletivo, como explica a <a href="privacidade.html">política de privacidade</a>.' })]);
      caixa.appendChild(lab);
      var env = el("button", { type: "button", "class": "fx-enviar" });
      if (tplWa) env.appendChild(tplWa.content.cloneNode(true));
      env.appendChild(document.createTextNode(" Enviar minha ficha pelo WhatsApp"));
      env.disabled = true;
      chk.addEventListener("change", function () { env.disabled = !chk.checked; });
      env.addEventListener("click", function () {
        if (!chk.checked) return;
        var url = "https://wa.me/" + NUMERO + "?text=" + encodeURIComponent(montar() + "\nAutorizo o uso dos dados para o processo seletivo (LGPD).\n" + etiqueta());
        try { if (window.fbq) window.fbq("trackCustom", "Candidatura", { vaga: R.vaga }); } catch (x) {}
        evento("candidatura", { vaga: R.vaga, turno: R.turno });
        var w = null;
        if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) { try { w = window.open(url, "_blank"); if (w) w.opener = null; } catch (x) {} }
        if (!w) window.location.href = url;
        concluido();
      });
      caixa.appendChild(el("div", { "class": "fx-acoes" }, [env, el("span", { "class": "fx-dica", style: "margin:0;font-size:14px;max-width:340px", text: "Depois de enviar, se tiver currículo em PDF, mande na mesma conversa." })]));
    }
    corpo.appendChild(caixa);
    if (pilha.length) { try { h.focus({ preventScroll: true }); } catch (e) {} }
    if (pilha.length && raiz.getBoundingClientRect().top < 0) raiz.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function etiqueta() {
    var origem = ""; try { origem = sessionStorage.getItem("origem") || ""; } catch (x) {}
    return "[site · trabalhe-conosco" + (origem ? " · " + origem : "") + "]";
  }
  function montar() {
    var L = ["*FICHA DE CANDIDATO - site*"];
    L.push("*Vaga:* " + R.vaga);
    L.push("*Nome:* " + R.nome);
    L.push("*Cidade:* " + R.cidade);
    if (estagio()) L.push("*Faculdade:* " + R.faculdade + " · *Período:* " + R.periodo);
    else L.push("*Formação:* " + R.formacao);
    L.push("*Turno:* " + R.turno + " · *Pode começar:* " + R.inicio);
    L.push("*Computador e internet em casa:* " + R.pc);
    L.push("*Experiência com atendimento:* " + R.exp + (R.exp !== "Ainda não" && R.ondeexp ? " (" + R.ondeexp + ")" : ""));
    L.push("*Ferramentas que já usou:* " + ((R.ferr && R.ferr.length) ? R.ferr.join(", ") : "nenhuma das listadas"));
    L.push("*Área de interesse:* " + R.area);
    if (R.porque) { L.push(""); L.push("*Por que quero trabalhar com vocês:*"); L.push(R.porque); }
    L.push(""); L.push("*Soube da vaga:* " + R.soube);
    return L.join("\n");
  }
  function concluido() {
    try { localStorage.removeItem(CHAVE); } catch (e) {}
    pilha = []; btVoltar.hidden = true; barra.style.width = "100%"; cont.textContent = "Ficha enviada";
    corpo.innerHTML = "";
    corpo.appendChild(el("div", { "class": "fx-passo fx-fim" }, [
      el("h3", { "class": "fx-q", text: "Seu WhatsApp abriu com a ficha. Agora é só tocar em enviar." }),
      el("p", { "class": "fx-dica", text: "Assim que ela chegar, você recebe a confirmação e o manual de estudo por lá. Se o WhatsApp não abriu, toque no botão abaixo." }),
      (function () { var a = el("button", { type: "button", "class": "fx-seguir", text: "Abrir de novo" }); a.addEventListener("click", function () { window.location.href = "https://wa.me/" + NUMERO + "?text=" + encodeURIComponent(montar() + "\nAutorizo o uso dos dados para o processo seletivo (LGPD).\n" + etiqueta()); }); return a; })()
    ]));
  }

  btVoltar.addEventListener("click", function () { if (!pilha.length) return; ir(pilha.pop(), true); });

  // retoma o rascunho (só neste navegador)
  try {
    var d = JSON.parse(localStorage.getItem(CHAVE) || "null");
    if (d && d.R && d.atual && passo(d.atual)) { R = d.R; pilha = d.pilha || []; ir(d.atual); return; }
  } catch (e) {}
  ir("vaga");
})();
