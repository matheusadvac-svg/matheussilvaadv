(function () {
  var inp = document.getElementById("data-aud");
  var res = document.getElementById("prazo-res");
  var aj = document.getElementById("prazo-ajuda");
  var tit = document.getElementById("prazo-tit");
  var txt = document.getElementById("prazo-txt");
  inp.addEventListener("change", function () {
    var v = inp.value;
    if (!v) { res.hidden = true; aj.hidden = false; return; }
    var p = v.split("-").map(Number);
    var alvo = new Date(p[0], p[1] - 1, p[2]);
    var h = new Date(); var h0 = new Date(h.getFullYear(), h.getMonth(), h.getDate());
    var d = Math.round((alvo - h0) / 86400000);
    var r;
    if (d < 0) r = ["Já passou", "A data informada já passou. Fale com o advogado agora para ver o que ainda pode ser feito.", "#5E0716", "#FFFFFF"];
    else if (d === 0) r = ["É hoje", "A audiência é hoje. Fale com o advogado imediatamente.", "#5E0716", "#FFFFFF"];
    else if (d <= 15) r = [d + (d === 1 ? " dia" : " dias"), "Prazo curto. Envie a notificação hoje para dar tempo de preparar a defesa e o preposto.", "#5E0716", "#FFFFFF"];
    else r = [d + " dias", "Há tempo, mas quanto antes começar, melhor: documentos e testemunhas levam dias para organizar.", "#1E2026", "#7BE3A8"];
    tit.textContent = r[0]; txt.textContent = r[1]; res.style.background = r[2]; tit.style.color = r[3];
    res.hidden = false; aj.hidden = true;
    try { if (window.gtag) window.gtag("event", "calculou_prazo", { dias: d }); } catch (x) {}
  });
})();
