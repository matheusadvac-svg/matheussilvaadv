// Trilha de estudo do estágio — v2 (22/10/2026): mapa com 9 paradas + "player" em telas curtas (stories),
// com conversas de WhatsApp, cartas que viram e tradutor de juridiquês. Quiz pelo link pessoal (?t=TOKEN),
// sorteado e corrigido no robô do escritório (selecao.js no middleware) — o gabarito não fica na página.
window.ORIGEM_PAGINA = "trilha-estagio";
(function () {
  var API = "https://claude-kommo-middleware-production.up.railway.app";
  try { var qa = new URLSearchParams(location.search).get("api"); if (qa && /^http:\/\/localhost(:\d+)?$/.test(qa)) API = qa; } catch (e) {}
  var NUMERO = "5568999993427";
  var token = ""; try { token = new URLSearchParams(location.search).get("t") || ""; } catch (e) {}
  var CHAVE = "trilha-v3"; // v3: 5 paradas
  var VIDEO_TESTE = "assets/video-teste-pratico.mp4"; // vídeo tutorial do teste prático (22/10/2026)
  var VIDEO_CAPA = "assets/video-teste-pratico-capa.jpg";
  var reduzido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------------------------------------------------------- ícones
  var IC = {
    pasta: '<path d="M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
    regra: '<path d="M12 3v18"/><path d="M5 7h14"/><path d="M5 7l-3 7a4 4 0 0 0 6 0z"/><path d="M19 7l-3 7a4 4 0 0 0 6 0z"/><path d="M8 21h8"/>',
    conversa: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9 11h6M9 14h4"/>',
    carteira: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    inss: '<path d="M12 21s-7-4.4-7-10.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 7 3.8C19 16.6 12 21 12 21z"/>',
    aviao: '<path d="M2 16l20-7-4 11-5-4-3 4v-5l9-8"/>',
    alerta: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    lupa: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/><path d="M8 11h6"/>',
    alvo: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    bandeira: '<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>'
  };
  var MAO = '<span class="mao" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10h.5V8.5a1.5 1.5 0 0 1 3 0V10h.5V9.5a1.5 1.5 0 0 1 3 0v4.8c0 3.7-2.6 6.7-6.2 6.7h-.6a6 6 0 0 1-4.8-2.4l-3-4a1.5 1.5 0 0 1 2.3-1.9L9 14.5z"/></svg></span>';
  function selo(t) { var s = document.createElement("span"); s.className = "selo-toque"; s.innerHTML = MAO + t; return s; }
  function icone(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[n] + "</svg>"; }

  // ---------------------------------------------------------------- conteúdo (==texto== = marca-texto)
  var MOD = [
    { t: "O escritório e você", d: "4 min", ic: "pasta", s: [
      { tipo: "texto", t: "Aqui o estágio é ==advocacia de verdade==", p: ["O escritório é 100% digital: os clientes chegam pelo WhatsApp, de todo o Acre, com problemas reais de trabalho, de INSS e de consumo. Você vai estar na linha de frente, com a supervisão do Dr. Matheus."] },
      { tipo: "lista", t: "No dia a dia, você vai", itens: [["Atender as situações reais", " que chegam no WhatsApp e saber desenrolar."], ["Organizar a documentação", " de cada cliente: pedir, conferir e ler."], ["Consultar processos", " nos sistemas dos tribunais e do INSS."], ["Passar informações aos clientes", " em linguagem simples."], ["Montar o caso", ": o resumo e a minuta da petição inicial."]] },
      { tipo: "texto", t: "Inteligência artificial: ==ferramenta de trabalho==", p: ["Aqui a IA ajuda a ler documentos, organizar o caso e escrever a primeira versão das peças. Quem sabe usar bem rende muito mais, e é esse estagiário que a gente procura."], nota: "Usar com responsabilidade é: <b>dar à IA as informações certas</b>, <b>conferir tudo o que ela devolve</b> e <b>nunca usar um julgado sem conferir na fonte oficial</b>. Dados de clientes reais só nas ferramentas do escritório." },
      { tipo: "lista", t: "As regras que ==valem sempre==", numerada: true, itens: [["100% digital.", " Sem recepção nem endereço para visita; até a assinatura é pelo celular."], ["Honorários só no êxito.", " Nada adiantado. Se ganhar, 35% do que receber (no INSS mensal: 35% dos atrasados + uma parcela). Não se negocia."], ["Nunca prometa", " resultado, valor ou prazo."], ["Uma pergunta e um documento por vez.", " Mensagem curta, linguagem simples."], ["Na dúvida, não invente.", " \"Vou confirmar com o Dr. Matheus e te retorno.\""]], nota: "<b>Reprova na hora:</b> prometer resultado, pedir pagamento adiantado, negociar honorários, passar endereço, dizer que não ouve áudio, inventar lei ou prazo, grosseria e sumir no meio do atendimento." }
    ] },
    { t: "Como atender no WhatsApp", d: "6 min", ic: "conversa", s: [
      { tipo: "zap", t: "Abrir: ==acalmar antes de perguntar==", p: "Cumprimente, diga seu nome e mostre que leu o que a pessoa escreveu.", conversa: [["cli", "Oi, fui demitido e a empresa não me pagou nada até hoje"], ["esc", "Bom dia! Aqui é a Ana, do escritório Matheus Silva Advocacia. Sinto muito pelo que aconteceu. Vou te ajudar a organizar isso. Posso te fazer algumas perguntas?"]] },
      { tipo: "lista", t: "Entender: ==três perguntas== que valem sempre", itens: [["Quando foi?", " A data define o prazo."], ["Já tem advogado nesse caso?", " Se tiver, o escritório não atua por cima do colega."], ["Tem algum papel disso?", " Documento vale mais que memória."]], nota: "Ao longo da conversa, sem despejar tudo de uma vez: <b>nome completo, CPF, RG, nascimento, estado civil, profissão, nome da mãe, endereço com CEP e e-mail</b>." },
      { tipo: "texto", t: "Documentos: ==abra e leia tudo==", p: ["O cliente manda foto do papel, muitas vezes torta. Leia cada uma: muita coisa que você ia perguntar já está ali. Se não der para ler, peça outra foto com jeito.", "Comprovante de residência tem que estar no nome do cliente; se não estiver, peça outro ou uma declaração de residência."] },
      { tipo: "cartas", t: "Ruim ou bom? ==Toque para virar==", p: "Na frente, o jeito errado. Toque e veja o jeito do escritório.", cartas: [["\"Qual seu nome completo, CPF, data de admissão, salário e endereço?\"", "\"Pra começar, qual é o seu nome completo?\""], ["\"Isso aí é verba rescisória do art. 477 com multa do 467.\"", "\"Pelo que você contou, a empresa ficou te devendo os valores da saída. Vou te ajudar a organizar isso.\""], ["\"Não consigo ouvir áudio, escreve aí.\"", "(ouve o áudio) \"Entendi, você trabalhava das 7h às 19h. E tinha intervalo para almoço?\""]] },
      { tipo: "perguntas", t: "As perguntas ==difíceis==", p: "Toque em cada pergunta do cliente para ver como o escritório responde.", pares: [["Quanto eu vou receber?", "Ainda não dá para dizer valor: depende dos documentos e do cálculo. Depois da análise, a gente te dá uma posição com pé no chão."], ["Quanto vocês cobram? Tô sem dinheiro.", "Você não paga nada agora. O escritório só recebe se ganhar: 35% no final. Se perder, não deve nada."], ["Posso passar aí no escritório?", "Nosso atendimento é todo digital, por aqui mesmo, inclusive a assinatura. Assim você não perde o dia de trabalho."], ["Como sei que vocês não são golpe?", "Pode conferir a inscrição do Dr. Matheus Oliveira Silva, OAB/AC 5292, no site da OAB e as avaliações no Google. E ninguém daqui pede pagamento adiantado."], ["Quanto tempo demora?", "Prazo depende da Justiça e ninguém honesto crava data. O que eu garanto é te avisar de cada movimentação."]] },
      { tipo: "zap", t: "Fechar: ==próximo passo claro==", conversa: [["esc", "Com isso eu já consigo montar o seu caso. Vou organizar tudo e o escritório te retorna por aqui. Se lembrar de mais alguma coisa, é só me mandar."], ["cli", "Obrigado, fico no aguardo!"]], nota: "Se o cliente desabafar, acolha em uma frase sincera e volte ao caso. Se outra pessoa digitar por ele, tudo bem: o cliente continua sendo quem tem o direito." }
    ] },
    { t: "As três áreas", d: "5 min", ic: "carteira", s: [
      { tipo: "chips", t: "==Trabalhista==", p: "O que descobrir e o que pedir:", chips: ["Saiu ou continua? Último dia", "Carteira assinada desde quando", "Função e último salário", "Recebeu as verbas?", "Nome, CNPJ e endereço da empresa", "Horário real e intervalo", "FGTS depositado?", "Férias", "Testemunhas", "Carteira de trabalho em PDF do app", "Contracheques", "Extrato do FGTS"], forte: ["Carteira de trabalho em PDF do app"], nota: "<b>Atenção:</b> só serve o PDF do app Carteira de Trabalho Digital (foto da carteira de papel não substitui). O CNPJ da empresa costuma estar no contracheque. A ação pode ser proposta até 2 anos depois da saída." },
      { tipo: "chips", t: "==Previdenciário (INSS)==", p: "O que descobrir e o que pedir:", chips: ["Qual benefício", "Quem é o titular", "Foi negado? Quando e por quê", "Quem mora na casa e a renda", "CadÚnico atualizado?", "Laudo médico (primeiro!)", "Carta de indeferimento", "Relatórios de escola e terapias", "Acesso ao gov.br, explicando para quê"], forte: ["Quem é o titular", "Laudo médico (primeiro!)"], nota: "<b>Benefício negado é ação judicial</b>, direto na Justiça Federal. No BPC de uma criança, o titular é a criança e a mãe é a representante. Gestante desempregada: nunca diga \"não tem direito\" nem mande pagar guia sozinha; o escritório orienta." },
      { tipo: "chips", t: "==Consumidor==", p: "O que descobrir e o que pedir:", chips: ["Qual empresa e o que foi contratado", "O que aconteceu e quando", "Quanto gastou e as notas", "Perdeu algum compromisso?", "Reclamou na empresa? Protocolos", "No voo: e-ticket ou reserva", "Bagagem: o RIB", "Provas do prejuízo"], forte: ["No voo: e-ticket ou reserva"], nota: "<b>Voo nacional:</b> Código de Defesa do Consumidor e Resolução 400 da ANAC (Montreal é para voo internacional). <b>Dano moral não é automático:</b> o que pesa são as circunstâncias, então pergunte e registre os detalhes." }
    ] },
    { t: "Acompanhar processos", d: "2 min", ic: "lupa", s: [
      { tipo: "traduz", t: "Traduzir o processo ==para o cliente==", p: "Você vai consultar o andamento e contar ao cliente o que aconteceu, sem juridiquês e sem prometer prazo. Toque em cada termo:", itens: [["Conclusos para sentença", "\"O processo está com o juiz para ele decidir.\""], ["Réu citado", "\"A empresa (ou o INSS) foi chamada oficialmente para responder.\""], ["Audiência designada", "\"Foi marcada uma audiência para o dia tal.\" E explique se ele participa e como."], ["Perícia agendada", "\"O juiz marcou uma perícia médica.\" Data, local e o que levar."], ["Trânsito em julgado", "\"A decisão é definitiva, não cabe mais recurso.\""], ["RPV expedida", "\"O pagamento foi autorizado. Agora o dinheiro é liberado, o que ainda leva um tempo.\""]], nota: "Regra de ouro: <b>toda novidade importante vira mensagem</b> para o cliente." }
    ] },
    { t: "O teste e a entrega", d: "3 min", ic: "alvo", s: [
      { tipo: "teste", t: "O teste prático: ==você escolhe a hora==", p: ["Passou no quiz? Toque no botão abaixo (ou mande QUERO FAZER O TESTE no WhatsApp do escritório) e, em poucos minutos, um cliente simulado te chama ali, com áudio, foto de documento e perguntas difíceis.", "Pode ser pelo celular ou pelo computador (WhatsApp Web). Dura de 20 a 40 minutos: escolha um lugar tranquilo."] },
      { tipo: "barras", t: "Como ==a nota é feita==", p: "No fim do teste chega um boletim com um comentário em cada critério:", barras: [["Acolhimento e comunicação", 15], ["Entender o caso", 25], ["Documentos", 25], ["Regras do escritório", 25], ["Condução e tempo de resposta", 10]] },
      { tipo: "texto", t: "A entrega escrita: ==48 horas==", p: ["Depois do teste você monta o caso que atendeu: o resumo (NOME x RÉU, o que aconteceu com datas e valores, documentos recebidos e faltantes, perguntas pendentes e viabilidade) e a minuta da petição inicial, em Word ou PDF, pelo WhatsApp.", "Pode e deve usar IA, com responsabilidade. No fim do arquivo, conte em poucas linhas se usou e como: isso conta a seu favor."], nota: "Não existe resposta decorada. A gente procura quem <b>ouve, pergunta o que precisa e não inventa</b> o que não sabe. O resto se ensina." }
    ] }
  ];

  // ---------------------------------------------------------------- estado
  var feitos = {}; try { feitos = JSON.parse(localStorage.getItem(CHAVE) || "{}") || {}; } catch (e) {}
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(feitos)); } catch (e) {} }
  function nFeitos() { return MOD.filter(function (m, i) { return feitos[i]; }).length; }
  function atual() { for (var i = 0; i < MOD.length; i++) if (!feitos[i]) return i; return MOD.length; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function marca(t) { return esc(t).replace(/==(.+?)==/g, '<span class="grifo">$1</span>'); }
  function el(tag, attrs, filhos) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) { if (k === "text") e.textContent = attrs[k]; else if (k === "html") e.innerHTML = attrs[k]; else e.setAttribute(k, attrs[k]); }
    (filhos || []).forEach(function (f) { if (f) e.appendChild(typeof f === "string" ? document.createTextNode(f) : f); });
    return e;
  }

  // ---------------------------------------------------------------- mapa
  var lista = document.getElementById("paradas");
  var wrap = document.getElementById("trilho");
  var svg = document.getElementById("trilho-svg");
  var pBase = document.getElementById("trilho-base");
  var pFeito = document.getElementById("trilho-feito");
  var nos = [];
  MOD.forEach(function (m, i) {
    var li = el("li", { "class": "parada" });
    var b = el("button", { type: "button", "class": "no", "aria-label": "Parada " + (i + 1) + ": " + m.t, html: icone(m.ic) });
    var r = el("button", { type: "button", "class": "rot", tabindex: "-1" }, [el("small", { text: "Parada " + (i + 1) + " · " + m.d }), el("strong", { text: m.t })]);
    b.addEventListener("click", function () { abrir(i); }); r.addEventListener("click", function () { abrir(i); });
    li.appendChild(b); li.appendChild(r); lista.appendChild(li); nos.push(li);
  });
  var fim = el("li", { "class": "parada final" });
  var bf = el("button", { type: "button", "class": "no", "aria-label": "Quiz final", html: icone("bandeira") });
  var rf = el("button", { type: "button", "class": "rot", tabindex: "-1" }, [el("small", { id: "fim-small", text: "Chegada" }), el("strong", { text: "Quiz final" })]);
  bf.addEventListener("click", irQuiz); rf.addEventListener("click", irQuiz);
  fim.appendChild(bf); fim.appendChild(rf); lista.appendChild(fim); nos.push(fim);
  function irQuiz() { document.getElementById("quiz").scrollIntoView({ behavior: reduzido ? "auto" : "smooth" }); }

  function centros() {
    var w = wrap.getBoundingClientRect();
    return nos.map(function (li) { var r = li.querySelector(".no").getBoundingClientRect(); return [r.left - w.left + r.width / 2, r.top - w.top + r.height / 2]; });
  }
  function caminho(pts) {
    if (!pts.length) return "";
    var d = "M" + pts[0][0] + " " + pts[0][1];
    for (var i = 1; i < pts.length; i++) { var a = pts[i - 1], b = pts[i], my = (a[1] + b[1]) / 2; d += " C" + a[0] + " " + my + " " + b[0] + " " + my + " " + b[0] + " " + b[1]; }
    return d;
  }
  var primeiraVez = true;
  function desenharTrilho() {
    var w = wrap.getBoundingClientRect();
    svg.setAttribute("viewBox", "0 0 " + w.width + " " + w.height);
    var pts = centros();
    pBase.setAttribute("d", caminho(pts));
    pFeito.setAttribute("d", caminho(pts));
    var total = pFeito.getTotalLength();
    var ate = Math.min(atual(), MOD.length); // caminho pintado até a parada atual
    var tmp = document.createElementNS("http://www.w3.org/2000/svg", "path"); tmp.setAttribute("d", caminho(pts.slice(0, ate + 1))); svg.appendChild(tmp);
    var parcial = ate ? tmp.getTotalLength() : 0; svg.removeChild(tmp);
    pFeito.style.strokeDasharray = total;
    if (primeiraVez && !reduzido) { pFeito.style.transition = "none"; pFeito.style.strokeDashoffset = total; pFeito.getBoundingClientRect(); pFeito.style.transition = ""; primeiraVez = false; }
    pFeito.style.strokeDashoffset = total - parcial;
  }
  function atualizarMapa() {
    var a = atual(), n = nFeitos();
    nos.forEach(function (li, i) { if (i < MOD.length) { li.classList.toggle("feita", !!feitos[i]); li.classList.toggle("atual", i === a); var sm = li.querySelector(".rot small"); if (sm) sm.innerHTML = (i === a ? MAO + " <b style=\"color:#F5B82E\">" + (n ? "Continue aqui" : "Comece aqui") + "</b> · " : "") + "Parada " + (i + 1) + " · " + MOD[i].d; } });
    fim.classList.toggle("liberada", n === MOD.length); fim.classList.toggle("atual", n === MOD.length);
    document.getElementById("fim-small").textContent = n === MOD.length ? "Liberado" : "Faltam " + (MOD.length - n) + " paradas";
    document.getElementById("anel-n").textContent = n + " de " + MOD.length;
    document.getElementById("anel-arco").style.strokeDashoffset = 150.8 * (1 - n / MOD.length);
    desenharTrilho();
    if (info && !prova) desenharInicio();
  }
  window.addEventListener("resize", function () { clearTimeout(window.__rt); window.__rt = setTimeout(desenharTrilho, 120); });

  // ---------------------------------------------------------------- player
  var player = document.getElementById("player"), palco = document.getElementById("pl-palco");
  var bVol = document.getElementById("pl-vol"), bSeg = document.getElementById("pl-seg");
  var mi = 0, si = 0, ultimoFoco = null;
  function abrir(i) {
    ultimoFoco = document.activeElement; mi = i; si = 0;
    player.hidden = false; document.body.style.overflow = "hidden";
    var barras = document.getElementById("pl-barras"); barras.innerHTML = "";
    MOD[i].s.forEach(function () { barras.appendChild(el("span", {}, [el("i")])); });
    document.getElementById("pl-tit").innerHTML = "Parada " + (i + 1) + " de " + MOD.length + " · <b>" + esc(MOD[i].t) + "</b>";
    mostrar(1);
  }
  function fechar() {
    player.hidden = true; document.body.style.overflow = "";
    atualizarMapa();
    try { (ultimoFoco || nos[0].querySelector(".no")).focus({ preventScroll: true }); } catch (e) {}
  }
  function mostrar(dir) {
    var m = MOD[mi], s = m.s[si], ultimo = si === m.s.length - 1;
    Array.prototype.forEach.call(document.getElementById("pl-barras").children, function (b, k) { b.firstChild.style.width = k < si ? "100%" : k === si ? "100%" : "0"; b.firstChild.style.opacity = k === si ? "1" : k < si ? ".55" : "1"; });
    bVol.disabled = si === 0;
    bSeg.textContent = ultimo ? (innerWidth < 480 ? "Concluir ✓" : "Concluir parada ✓") : "Continuar";
    document.getElementById("pl-pos").textContent = (si + 1) + " de " + m.s.length;
    palco.innerHTML = "";
    var c = el("div", { "class": "pl-slide " + (dir > 0 ? "vai" : "vem") });
    if (si === 0) c.appendChild(el("div", { "class": "pl-ic", html: icone(m.ic) }));
    c.appendChild(el("h2", { id: "pl-h", tabindex: "-1", html: marca(s.t) }));
    render(s, c);
    palco.appendChild(c); palco.scrollTop = 0;
    requestAnimationFrame(function () { Array.prototype.forEach.call(c.querySelectorAll(".grifo"), function (g) { g.classList.add("on"); }); });
    try { c.querySelector("h2").focus({ preventScroll: true }); } catch (e) {}
  }
  function render(s, c) {
    var ps = [].concat(s.p || []);
    if (s.tipo === "texto") ps.forEach(function (p) { c.appendChild(el("p", { html: marca(p) })); });
    else if (ps.length) c.appendChild(el("p", { html: marca(ps[0]) }));
    if (s.tipo === "lista") {
      var ul = el("ul", { "class": "pl-lista" + (s.nao ? " nao" : "") });
      s.itens.forEach(function (it, k) {
        var mk = s.nao ? "✕" : s.numerada ? String((s.inicio || 1) + k) : "✓";
        var li = el("li", {}, [el("span", { "class": "mk", text: mk }), el("span", { html: "<b>" + esc(it[0]) + "</b>" + esc(it[1]) })]);
        li.style.animationDelay = reduzido ? "0s" : (0.12 + k * 0.09) + "s"; ul.appendChild(li);
      });
      c.appendChild(ul);
    }
    if (s.tipo === "chips") {
      var ch = el("div", { "class": "chips" });
      s.chips.forEach(function (t) { ch.appendChild(el("span", { "class": (s.forte || []).indexOf(t) > -1 ? "forte" : "", text: t })); });
      c.appendChild(ch);
    }
    if (s.tipo === "zap") {
      var z = el("div", { "class": "zap" });
      s.conversa.forEach(function (b, k) { var bo = el("div", { "class": "bolha " + b[0] }, [el("small", { text: b[0] === "cli" ? "Cliente" : "Você, pelo escritório" }), b[1]]); bo.style.animationDelay = reduzido ? "0s" : (0.2 + k * 0.6) + "s"; z.appendChild(bo); });
      c.appendChild(z);
    }
    if (s.tipo === "perguntas") {
      var zs = el("div", { "class": "zap" });
      s.pares.forEach(function (par, k) {
        var cb = el("button", { type: "button", "class": "bolha cli toque", style: "border:none;cursor:pointer;text-align:left;font:inherit;display:flex;align-items:flex-start;gap:8px" }, [el("span", {}, [el("small", { text: "Cliente" }), par[0]])]);
        cb.insertAdjacentHTML("beforeend", MAO);
        cb.style.animationDelay = reduzido ? "0s" : (0.1 + k * 0.12) + "s";
        cb.addEventListener("click", function () { if (cb.dataset.aberto) return; cb.dataset.aberto = "1"; cb.classList.remove("toque"); var m = cb.querySelector(".mao"); if (m) m.remove(); cb.insertAdjacentElement("afterend", el("div", { "class": "bolha esc" }, [el("small", { text: "Você, pelo escritório" }), par[1]])); });
        zs.appendChild(cb);
      });
      c.appendChild(zs);
    }
    if (s.tipo === "pergunta") {
      var z2 = el("div", { "class": "zap" });
      z2.appendChild(el("div", { "class": "bolha cli" }, [el("small", { text: "Cliente" }), s.cli]));
      var ver = el("button", { type: "button", "class": "ver toque", html: MAO + "Toque para ver como o escritório responde" });
      ver.addEventListener("click", function () { ver.remove(); z2.appendChild(el("div", { "class": "bolha esc" }, [el("small", { text: "Você, pelo escritório" }), s.esc])); });
      z2.appendChild(ver); c.appendChild(z2);
    }
    if (s.tipo === "cartas") {
      var g = el("div", { "class": "cartas" });
      s.cartas.forEach(function (ca) {
        var b = el("button", { type: "button", "class": "carta", "aria-pressed": "false" }, [el("div", { "class": "carta-in" }, [
          el("div", { "class": "carta-f" }, [el("b", { text: "✕ Assim não" }), ca[0], el("i", { text: "toque para virar" })]),
          el("div", { "class": "carta-v" }, [el("b", { text: "✓ Assim sim" }), ca[1], el("i", { text: "toque para voltar" })])])]);
        b.classList.add("toque"); b.appendChild(selo("toque"));
        b.addEventListener("click", function () { var v = b.classList.toggle("virada"); b.setAttribute("aria-pressed", v ? "true" : "false"); b.classList.remove("toque"); var sl = b.querySelector(".selo-toque"); if (sl) sl.remove(); });
        g.appendChild(b);
      });
      c.appendChild(g);
    }
    if (s.tipo === "traduz") {
      var tg = el("div", { "class": "traduz" });
      s.itens.forEach(function (it) {
        var b = el("button", { type: "button", "class": "tr-bt", "aria-expanded": "false" }, [el("small", { text: "No sistema aparece" }), el("span", { text: it[0] })]);
        b.classList.add("toque"); var sl = selo("toque"); b.appendChild(sl);
        b.addEventListener("click", function () { b.classList.remove("toque"); if (sl.parentNode) sl.remove(); var ab = !b.classList.contains("aberto"); b.classList.toggle("aberto", ab); b.setAttribute("aria-expanded", ab ? "true" : "false"); b.children[0].textContent = ab ? "Para o cliente" : "No sistema aparece"; b.children[1].textContent = ab ? it[1] : it[0]; });
        tg.appendChild(b);
      });
      c.appendChild(tg);
    }
    if (s.tipo === "teste") {
      ps.slice(1).forEach(function (p) { c.appendChild(el("p", { html: marca(p) })); });
      if (VIDEO_TESTE) { var v = el("video", { src: VIDEO_TESTE, poster: VIDEO_CAPA, controls: "", playsinline: "", preload: "none", style: "width:min(100%, 360px, calc(58vh * 9 / 16));aspect-ratio:9/16;border-radius:18px;background:#000;box-shadow:0 12px 30px rgba(26,26,26,.18)" }); v.addEventListener("play", function () { try { if (window.gtag) window.gtag("event", "video_teste_play"); } catch (e) {} }); c.insertBefore(v, c.querySelector("p")); }
      var pronto = info && info.passou;
      var caixa = el("div", { style: "display:flex;flex-direction:column;gap:8px;align-items:flex-start" });
      if (pronto) { var bw = botaoWa("QUERO FAZER O TESTE", "Quero fazer o teste agora"); bw.classList.add("toque"); bw.insertAdjacentHTML("afterbegin", MAO); caixa.appendChild(bw); }
      else { caixa.appendChild(el("button", { type: "button", "class": "wa-bt", disabled: "", style: "opacity:.45;cursor:not-allowed", text: "🔒 Quero fazer o teste" })); caixa.appendChild(el("small", { style: "font-size:14px;color:#6B6258", text: token ? "Libera quando você passar no quiz, no fim da trilha." : "Libera para o candidato que passa no quiz." })); }
      c.appendChild(caixa);
    }
    if (s.tipo === "barras") {
      var bx = el("div", { "class": "barras" });
      s.barras.forEach(function (br, k) {
        var i = el("i"); var row = el("div", { "class": "barra" }, [el("span", { text: br[0] }), el("div", { "class": "t" }, [i]), el("b", { text: String(br[1]) })]);
        bx.appendChild(row); setTimeout(function () { i.style.width = (br[1] / 25 * 100) + "%"; }, reduzido ? 0 : 250 + k * 120);
      });
      c.appendChild(bx);
    }
    if (s.nota) c.appendChild(el("div", { "class": "pl-nota", html: s.nota }));
  }
  function seguir() {
    var m = MOD[mi];
    if (si < m.s.length - 1) { si++; mostrar(1); return; }
    var antes = nFeitos(); feitos[mi] = true; salvar();
    fechar();
    try { if (window.gtag) window.gtag("event", "trilha_parada", { parada: mi + 1 }); } catch (e) {}
    if (nFeitos() === MOD.length && antes < MOD.length) { festa(); setTimeout(irQuiz, 900); }
    else { var a = atual(); if (a < MOD.length) setTimeout(function () { try { nos[a].querySelector(".no").focus({ preventScroll: true }); nos[a].scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "center" }); } catch (e) {} }, 300); }
  }
  function voltar() { if (si > 0) { si--; mostrar(-1); } }
  bSeg.addEventListener("click", seguir); bVol.addEventListener("click", voltar);
  document.getElementById("pl-fechar").addEventListener("click", fechar);
  document.addEventListener("keydown", function (e) {
    if (player.hidden) return;
    if (e.key === "Escape") fechar();
    else if (e.key === "ArrowRight" && !/BUTTON/.test((document.activeElement || {}).tagName || "")) seguir();
    else if (e.key === "ArrowLeft") voltar();
  });
  var tx = null;
  palco.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  palco.addEventListener("touchend", function (e) { if (tx == null) return; var dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 70) { if (dx < 0) seguir(); else voltar(); } });

  // confete só no momento de concluir a trilha inteira
  function festa() {
    if (reduzido) return;
    var cv = document.getElementById("festa"); cv.hidden = false; var cx = cv.getContext("2d");
    cv.width = innerWidth; cv.height = innerHeight;
    var cores = ["#C8102E", "#F5B82E", "#1A1A1A", "#FFFDF9"], ps = [];
    for (var i = 0; i < 140; i++) ps.push({ x: innerWidth / 2, y: innerHeight * 0.45, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, s: 5 + Math.random() * 6, c: cores[i % 4], r: Math.random() * 6 });
    var t0 = performance.now();
    (function passo(t) {
      cx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.vy += .45; p.r += .2; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore(); });
      if (t - t0 < 2200) requestAnimationFrame(passo); else { cx.clearRect(0, 0, cv.width, cv.height); cv.hidden = true; }
    })(t0);
  }

  // ---------------------------------------------------------------- quiz
  var qz = document.getElementById("qz");
  var info = null;
  var prova = null, resp = {}, idx = 0;
  function limpa() { qz.innerHTML = ""; }
  function msg(t) { limpa(); qz.appendChild(el("p", { style: "margin:0;font-size:16px;line-height:1.6", html: t })); }
  function botaoWa(texto, rotulo) { return el("a", { "class": "wa-bt", href: "https://wa.me/" + NUMERO + "?text=" + encodeURIComponent(texto), target: "_blank", rel: "noopener", "data-candidato": "1" }, [rotulo]); }
  function carregar() {
    if (!token) { msg("Você está vendo uma <strong>prévia</strong> da trilha. O quiz abre pelo <strong>link pessoal</strong> que chega no WhatsApp logo depois que a ficha é enviada. Já se inscreveu e perdeu o link? Mande qualquer mensagem no WhatsApp do escritório que ele chega de novo."); return; }
    fetch(API + "/selecao/quiz?t=" + encodeURIComponent(token), { cache: "no-store" }).then(function (r) { return r.json().then(function (j) { return { st: r.status, j: j }; }); })
      .then(function (x) {
        if (x.st !== 200) { msg("Este link não é válido ou é de uma inscrição antiga. Use o link mais recente que chegou no seu WhatsApp."); return; }
        info = x.j;
        if (info.nome) { document.getElementById("tr-ola").innerHTML = esc(info.nome) + ", sua trilha até o <em>teste prático</em>"; }
        desenharInicio();
      }).catch(function () { msg("Não consegui carregar o quiz agora. Verifique a internet e recarregue a página."); });
  }
  function desenharInicio() {
    limpa();
    if (info.passou) {
      qz.appendChild(el("h3", { "class": "qz-q", text: "Você já passou no quiz: " + info.melhor + " de " + info.total + " 🎉" }));
      qz.appendChild(el("p", { style: "margin:0;font-size:16px;line-height:1.6", text: "Próxima etapa: o teste prático, pelo celular ou pelo computador. Quando estiver pronto(a), com uns 40 minutos livres, toque no botão abaixo ou mande QUERO FAZER O TESTE no WhatsApp do escritório." }));
      qz.appendChild(el("div", {}, [botaoWa("QUERO FAZER O TESTE", "Quero fazer o teste agora")]));
      return;
    }
    if (!info.podeFazer) {
      qz.appendChild(el("h3", { "class": "qz-q", text: "Suas tentativas do quiz terminaram" }));
      qz.appendChild(el("p", { style: "margin:0;font-size:16px;line-height:1.6", text: "Obrigado pela dedicação! O resultado já foi enviado no seu WhatsApp. O material continua aqui para você estudar." }));
      return;
    }
    var faltam = MOD.length - nFeitos();
    qz.appendChild(el("h3", { "class": "qz-q", text: faltam ? "Termine a trilha para liberar o quiz" : "Trilha completa. Bora para o quiz?" }));
    qz.appendChild(el("p", { style: "margin:0;font-size:16px;line-height:1.6", text: (faltam ? "Faltam " + faltam + " parada" + (faltam > 1 ? "s" : "") + ". " : "") + info.total + " perguntas; passa com " + info.minimo + " acertos. Tentativa " + (info.tentativas + 1) + " de " + info.max + "." }));
    var b = el("button", { type: "button", "class": "qz-bt", text: faltam ? "Continuar a trilha" : "Começar o quiz" });
    b.addEventListener("click", function () { if (faltam) { var a = atual(); abrir(a); } else comecar(); });
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
    var topo = el("div", { style: "display:flex;justify-content:space-between;align-items:center;font-size:14px;color:#6B6258" }, [el("span", { text: "Pergunta " + (idx + 1) + " de " + prova.length })]);
    if (idx) { var v = el("button", { type: "button", "class": "qz-sec", text: "← Voltar" }); v.addEventListener("click", function () { idx--; pergunta(); }); topo.appendChild(v); }
    qz.appendChild(topo);
    qz.appendChild(el("div", { "class": "qz-trilho" }, [el("div", { "class": "qz-barra", style: "width:" + Math.round(idx / prova.length * 100) + "%" })]));
    var h = el("h3", { "class": "qz-q", tabindex: "-1", text: q.p }); qz.appendChild(h);
    var l = el("div", { style: "display:flex;flex-direction:column;gap:10px", role: "radiogroup", "aria-label": q.p });
    q.alt.forEach(function (a) {
      var b = el("button", { type: "button", "class": "qz-op", "aria-pressed": resp[q.id] === a.id ? "true" : "false" }, [el("span", { "class": "l", text: a.id }), el("span", { text: a.texto })]);
      b.addEventListener("click", function () {
        resp[q.id] = a.id;
        Array.prototype.forEach.call(l.children, function (x) { x.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true");
        setTimeout(function () { if (idx < prova.length - 1) { idx++; pergunta(); } else revisar(); }, 260);
      });
      l.appendChild(b);
    });
    qz.appendChild(l);
    try { h.focus({ preventScroll: true }); } catch (e) {}
  }
  function revisar() {
    limpa();
    var faltam = prova.filter(function (q) { return !resp[q.id]; }).length;
    qz.appendChild(el("h3", { "class": "qz-q", text: faltam ? "Faltam " + faltam + " resposta(s)" : "Tudo respondido!" }));
    qz.appendChild(el("p", { style: "margin:0;font-size:16px;line-height:1.6", text: faltam ? "Volte e responda todas antes de enviar." : "Quer conferir alguma? Use o Voltar. Quando estiver seguro(a), envie." }));
    var acoes = el("div", { style: "display:flex;flex-wrap:wrap;gap:12px;align-items:center" });
    var e = el("button", { type: "button", "class": "qz-bt", text: "Enviar respostas" }); if (faltam) e.disabled = true; e.addEventListener("click", enviar);
    var v = el("button", { type: "button", "class": "qz-sec", text: "← Voltar às perguntas" }); v.addEventListener("click", function () { idx = prova.length - 1; pergunta(); });
    acoes.appendChild(e); acoes.appendChild(v); qz.appendChild(acoes);
  }
  function enviar() {
    msg("Corrigindo…");
    fetch(API + "/selecao/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t: token, respostas: resp }) })
      .then(function (r) { return r.json(); }).then(resultado).catch(function () { msg("Não consegui enviar. Verifique a internet e tente de novo."); });
  }
  function resultado(r) {
    limpa();
    if (r.erro) { msg(esc(r.erro)); return; }
    try { if (window.gtag) window.gtag("event", "quiz_estagio", { acertos: r.acertos, passou: r.passou }); } catch (e) {}
    qz.appendChild(el("h3", { "class": "qz-q", text: r.passou ? "Você passou: " + r.acertos + " de " + r.total + "! 🎉" : "Você fez " + r.acertos + " de " + r.total }));
    if (r.passou) {
      festa();
      qz.appendChild(el("p", { style: "margin:0;font-size:16px;line-height:1.6", text: "Próxima etapa: o teste prático, que você começa quando quiser, pelo celular ou pelo computador. Escolha um momento tranquilo, com uns 40 minutos livres, e toque no botão abaixo." }));
      qz.appendChild(el("div", {}, [botaoWa("QUERO FAZER O TESTE", "Quero fazer o teste agora")]));
    } else if (r.tentativasRestantes > 0) {
      qz.appendChild(el("p", { style: "margin:0;font-size:16px;line-height:1.6", text: "Para passar são " + r.minimo + " acertos. Revise as paradas com calma, principalmente os temas abaixo, e tente de novo (resta " + r.tentativasRestantes + " tentativa). As perguntas mudam." }));
    } else {
      qz.appendChild(el("p", { style: "margin:0;font-size:16px;line-height:1.6", text: "Desta vez não deu. Obrigado pela dedicação! Abaixo estão as respostas certas, para você estudar." }));
    }
    var l = el("div", { style: "display:flex;flex-direction:column;gap:8px" });
    (r.itens || []).forEach(function (i) {
      if (!r.passou && r.tentativasRestantes > 0 && i.acertou) return;
      l.appendChild(el("div", { "class": "qz-item " + (i.acertou ? "ok" : "err") }, [el("strong", { text: (i.acertou ? "✓ " : "✕ ") + i.p }), i.certa ? el("div", { style: "margin-top:4px", text: "Resposta: " + i.certa }) : null, i.explicacao ? el("div", { style: "margin-top:4px;color:#5A5248", text: i.explicacao }) : null]));
    });
    if (l.children.length) { qz.appendChild(el("h4", { style: "margin:6px 0 0;font-family:Montserrat,sans-serif", text: r.passou ? "Confira as explicações" : "Temas para revisar" })); qz.appendChild(l); }
    if (!r.passou && r.tentativasRestantes > 0) { var b = el("button", { type: "button", "class": "qz-sec", text: "Voltar ao mapa ↑" }); b.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduzido ? "auto" : "smooth" }); }); qz.appendChild(b); info = Object.assign({}, info, { tentativas: (info.tentativas || 0) + 1 }); prova = null; }
  }

  atualizarMapa();
  carregar();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(desenharTrilho);
})();
