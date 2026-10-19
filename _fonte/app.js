(function () {
  var ACCENT = "#C8102E";
  var wa = function (t) { return "https://wa.me/5568999993427?text=" + encodeURIComponent(t); };
  var AREAS = __AREAS__;
  var S = __S__;
  var state = { area: "trab", picked: "demitido", falando: false };
  var btnOuvir = document.getElementById("p-ouvir");
  var txtOuvir = document.getElementById("p-ouvir-txt");
  function calar() { try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {} state.falando = false; atualizaOuvir(); }
  function atualizaOuvir() { txtOuvir.textContent = state.falando ? "Parar o áudio" : "Ouvir a explicação"; btnOuvir.setAttribute("aria-pressed", state.falando ? "true" : "false"); }
  if (!("speechSynthesis" in window)) btnOuvir.style.display = "none";
  btnOuvir.addEventListener("click", function () {
    var sp = window.speechSynthesis; if (!sp) return;
    if (state.falando) { calar(); return; }
    var sel = S.filter(function (s) { return s.id === state.picked; })[0] || S[0];
    var u = new SpeechSynthesisUtterance(sel.audio);
    u.lang = "pt-BR"; u.rate = 0.95;
    var voz = sp.getVoices().filter(function (v) { return /pt[-_]BR/i.test(v.lang); })[0];
    if (voz) u.voice = voz;
    u.onend = u.onerror = function () { state.falando = false; atualizaOuvir(); };
    sp.cancel(); sp.speak(u); state.falando = true; atualizaOuvir();
    try { if (window.gtag) window.gtag("event", "ouvir_audio", { item_name: sel.titulo }); } catch (x) {}
  });

  var elArea = document.getElementById("tabs-area");
  var elSit = document.getElementById("tabs-sit");
  var painel = document.getElementById("painel");

  function restart(el) { el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap"); }

  function btn(label, on, styles, onClick) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.style.cssText = styles;
    b.addEventListener("click", onClick);
    return b;
  }

  function render(animate) {
    elArea.innerHTML = "";
    AREAS.forEach(function (a) {
      var on = a.id === state.area;
      elArea.appendChild(btn(a.rotulo, on,
        "border:none;background:" + (on ? "#1A1A1A" : "transparent") + ";color:" + (on ? "#FFFFFF" : "#1A1A1A") +
        ";font-weight:700;font-size:15px;padding:12px 18px;border-radius:12px;cursor:pointer;min-height:44px;transition:background-color .3s,color .3s",
        function () {
          if (a.id === state.area) return;
          var first = S.filter(function (s) { return s.area === a.id; })[0];
          calar();
          state.area = a.id; state.picked = first ? first.id : state.picked;
          render(true);
        }));
    });

    elSit.innerHTML = "";
    S.filter(function (s) { return s.area === state.area; }).forEach(function (s, i) {
      var on = s.id === state.picked;
      var b = btn(s.rotulo, on,
        "animation-delay:" + (i * 0.06) + "s;border:1.5px solid " + (on ? ACCENT : "#D8C8AC") + ";background:" + (on ? ACCENT : "#FFFDF9") +
        ";color:" + (on ? "#FFFFFF" : "#1A1A1A") + ";font-weight:700;font-size:15px;padding:13px 18px;border-radius:999px;cursor:pointer;min-height:44px;transition:background-color .3s,color .3s,border-color .3s",
        function () { if (state.picked === s.id) return; calar(); state.picked = s.id; render(true); });
      b.className = "pop";
      elSit.appendChild(b);
    });

    var sel = S.filter(function (s) { return s.id === state.picked; })[0] || S[0];
    document.getElementById("p-frase").textContent = "“" + sel.frase + "”";
    document.getElementById("p-titulo").textContent = sel.titulo;
    document.getElementById("p-texto").textContent = sel.texto;
    document.getElementById("p-link").setAttribute("data-evento", sel.titulo);
    document.getElementById("p-link").href = wa("Olá Dr. Matheus, vim pelo site. Minha situação: " + sel.titulo + ". " + sel.frase);
    var ul = document.getElementById("p-docs");
    ul.innerHTML = "";
    sel.docs.forEach(function (t, i) {
      var li = document.createElement("li");
      li.className = "swap";
      li.style.cssText = "animation-delay:" + (0.15 + i * 0.08) + "s;display:flex;gap:10px;align-items:flex-start";
      li.innerHTML = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8102E" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="flex:none;margin-top:2px"><path d="M5 12l5 5L20 7"/></svg>';
      li.appendChild(document.createTextNode(t));
      ul.appendChild(li);
    });
    var gx = document.getElementById("p-guias");
    gx.innerHTML = "";
    (sel.guias || []).forEach(function (g) {
      var a = document.createElement("a");
      a.href = g.href;
      a.textContent = g.rotulo + " →";
      a.style.cssText = "display:inline-flex;align-items:center;min-height:44px;box-sizing:border-box;padding:10px 16px;border-radius:999px;border:1.5px solid #1A1A1A;color:#1A1A1A;text-decoration:none;font-weight:700;font-size:15px";
      gx.appendChild(a);
    });
    gx.style.display = (sel.guias && sel.guias.length) ? "flex" : "none";
    if (animate) restart(painel);
  }
  render(false);

  // vídeos: garantir autoplay mudo e respeitar "reduzir movimento"
  try {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll("video").forEach(function (v) {
      v.muted = true;
      if (reduce) { v.removeAttribute("autoplay"); v.pause(); }
      else { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    });
  } catch (e) {}
})();
