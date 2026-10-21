// Página "Trabalhe com a gente" (21/10/2026): a ficha monta a mensagem e abre o WhatsApp do escritório.
// Nada vai para servidor: o envio depende do candidato tocar em enviar no próprio WhatsApp.
// A 1ª linha "FICHA DE CANDIDATO" e a etiqueta "[site · trabalhe-conosco]" são lidas pelo robô (simulador.js, triagem).
window.ORIGEM_PAGINA = "trabalhe-conosco";
(function () {
  var NUMERO = "5568999993427";
  var f = document.getElementById("ficha-form");
  if (!f) return;
  var aviso = document.getElementById("ficha-aviso");
  var blocoEst = document.getElementById("bloco-estagio");
  var blocoAt = document.getElementById("bloco-atend");
  var CHAVE = "ficha-candidato";

  function val(n) { var el = f.elements[n]; if (!el) return ""; if (el.length !== undefined && el.tagName !== "SELECT") { for (var i = 0; i < el.length; i++) if (el[i].checked) return el[i].value; return ""; } return String(el.value || "").trim(); }
  function marcados(n) { return Array.prototype.slice.call(f.querySelectorAll('input[name="' + n + '"]:checked')).map(function (x) { return x.value; }); }
  function limpa(t) { return String(t || "").replace(/\s+/g, " ").trim(); }

  function ajustarVaga() {
    var v = val("vaga");
    var at = v === "Atendimento";
    blocoAt.hidden = !at;
    blocoEst.hidden = at;
    blocoEst.style.display = at ? "none" : "grid";
  }

  // rascunho: se a pessoa sair da página, a ficha continua preenchida (só neste navegador)
  function salvar() {
    try {
      var d = {};
      Array.prototype.forEach.call(f.elements, function (el) {
        if (!el.name || el.name === "lgpd") return;
        if (el.type === "radio") { if (el.checked) d[el.name] = el.value; }
        else if (el.type === "checkbox") { d[el.name] = d[el.name] || []; if (el.checked) d[el.name].push(el.value); }
        else d[el.name] = el.value;
      });
      localStorage.setItem(CHAVE, JSON.stringify(d));
    } catch (e) {}
  }
  function restaurar() {
    try {
      var d = JSON.parse(localStorage.getItem(CHAVE) || "null");
      if (!d) return;
      Array.prototype.forEach.call(f.elements, function (el) {
        if (!el.name || !(el.name in d)) return;
        if (el.type === "radio") el.checked = d[el.name] === el.value;
        else if (el.type === "checkbox") el.checked = (d[el.name] || []).indexOf(el.value) > -1;
        else el.value = d[el.name];
      });
    } catch (e) {}
  }

  var cont = document.getElementById("cont-situacao");
  function contar() { if (cont) cont.textContent = (f.elements.situacao.value || "").length + "/600"; }

  f.addEventListener("change", function (e) {
    if (e.target.name === "vaga") ajustarVaga();
    var g = e.target.closest("fieldset, label");
    if (g) { g.classList.remove("grupo-erro"); }
    if (e.target.classList) e.target.classList.remove("erro");
    salvar();
  });
  f.addEventListener("input", function (e) { if (e.target.name === "situacao") contar(); if (e.target.classList) e.target.classList.remove("erro"); salvar(); });

  function erro(campo, grupoId, msg, lista) {
    if (campo) campo.classList.add("erro");
    if (grupoId) { var g = document.getElementById(grupoId); if (g) g.classList.add("grupo-erro"); }
    lista.push({ el: campo || document.getElementById(grupoId), msg: msg });
  }

  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var faltas = [];
    var vaga = val("vaga");
    var estagio = vaga && vaga !== "Atendimento";
    if (!vaga) erro(null, "g-vaga", "a vaga", faltas);
    var nome = limpa(val("nome"));
    if (nome.split(" ").length < 2) erro(f.elements.nome, null, "o nome completo", faltas);
    if (!limpa(val("cidade"))) erro(f.elements.cidade, null, "a cidade", faltas);
    if (estagio) {
      if (!limpa(val("faculdade"))) erro(f.elements.faculdade, null, "a faculdade", faltas);
      if (!val("periodo")) erro(f.elements.periodo, null, "o período do curso", faltas);
    } else if (vaga && !val("formacao")) erro(f.elements.formacao, null, "a formação", faltas);
    if (!val("turno")) erro(null, "g-turno", "o turno", faltas);
    if (!val("inicio")) erro(null, "g-inicio", "quando pode começar", faltas);
    if (!val("pc")) erro(null, "g-pc", "se tem computador e internet", faltas);
    if (!val("exp")) erro(null, "g-exp", "a experiência com atendimento", faltas);
    if (limpa(val("situacao")).length < 15) erro(f.elements.situacao, null, "a resposta da situação", faltas);
    if (!f.elements.lgpd.checked) erro(null, "g-lgpd", "a autorização de uso dos dados", faltas);

    if (faltas.length) {
      aviso.textContent = "Falta preencher: " + faltas.map(function (x) { return x.msg; }).join(", ") + ".";
      aviso.hidden = false;
      var alvo = faltas[0].el;
      if (alvo && alvo.scrollIntoView) alvo.scrollIntoView({ behavior: "smooth", block: "center" });
      if (alvo && alvo.focus && alvo.tagName !== "FIELDSET") try { alvo.focus({ preventScroll: true }); } catch (x) {}
      return;
    }
    aviso.hidden = true;

    var L = [];
    L.push("🎓 *FICHA DE CANDIDATO — site*");
    L.push("*Vaga:* " + vaga);
    L.push("*Nome:* " + nome);
    L.push("*Cidade:* " + limpa(val("cidade")));
    if (estagio) L.push("*Faculdade:* " + limpa(val("faculdade")) + " · *Período:* " + val("periodo"));
    else L.push("*Formação:* " + val("formacao"));
    L.push("*Turno:* " + val("turno") + " · *Pode começar:* " + val("inicio"));
    L.push("*Computador e internet em casa:* " + val("pc"));
    var onde = limpa(val("ondeexp"));
    L.push("*Experiência com atendimento:* " + val("exp") + (onde ? " (" + onde + ")" : ""));
    var fe = marcados("ferr");
    L.push("*Ferramentas que já usou:* " + (fe.length ? fe.join(", ") : "nenhuma das listadas"));
    if (val("area")) L.push("*Área de interesse:* " + val("area"));
    L.push("");
    L.push("*Situação (cliente às 21h, benefício do filho negado) — minha resposta:*");
    L.push(limpa(val("situacao")));
    var pq = limpa(val("porque"));
    if (pq) { L.push(""); L.push("*Por que quero trabalhar com vocês:*"); L.push(pq); }
    L.push("");
    var extra = [];
    if (val("soube")) extra.push("*Soube da vaga:* " + val("soube"));
    if (limpa(val("perfil"))) extra.push("*Perfil:* " + limpa(val("perfil")));
    if (extra.length) L.push(extra.join(" · "));
    L.push("✅ Autorizo o uso dos dados para o processo seletivo (LGPD).");
    var origem = "";
    try { origem = sessionStorage.getItem("origem") || ""; } catch (x) {}
    L.push("[site · trabalhe-conosco" + (origem ? " · " + origem : "") + "]");

    var url = "https://wa.me/" + NUMERO + "?text=" + encodeURIComponent(L.join("\n"));
    try { if (window.fbq) window.fbq("trackCustom", "Candidatura", { vaga: vaga }); } catch (x) {}
    try { if (window.gtag) window.gtag("event", "candidatura", { vaga: vaga, turno: val("turno") }); } catch (x) {}
    var w = null;
    if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) { try { w = window.open(url, "_blank"); if (w) w.opener = null; } catch (x) {} }
    if (!w) window.location.href = url;
  });

  restaurar();
  ajustarVaga();
  contar();
})();
