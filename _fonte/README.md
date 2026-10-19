# Fonte do site matheussilvaadv.com.br

Esta pasta guarda os arquivos que GERAM as páginas do site. A pasta começa com "_" e por isso o GitHub Pages não a publica.

## Como montar o ambiente (num chat novo do Claude)
```
git clone https://github.com/matheusadvac-svg/matheussilvaadv.git live
mkdir -p build site/project
cp live/_fonte/*.py live/_fonte/*.js live/_fonte/*.html build/   # scripts e moldes
mv build/*.dc.html site/project/ && cp live/_fonte/canvas.json site/project/
mkdir -p build/site && cp -r live/assets live/CNAME build/site/
```
- `build/build2.py` gera `index.html`, `empresas.html` e `privacidade.html` a partir de `site/project/*.dc.html` (telas do Claude Design) + `head.html`, `app.js`, `empresas.js`, `site_block.html`, `tracking.js`.
- `build/campanhas.py` gera as 13 páginas de guia/campanha. O conteúdo fica em `campanhas.py` (bagagem, overbooking, passageiro-especial, salario-maternidade) e em `paginas_novas.py` (os outros 9 temas). Ele lê o estilo de `live/index.html`.
- Rodar sempre com `python3 -I build/build2.py` e `python3 -I build/campanhas.py`; a saída vai para `build/site/`.

## Regras
- Pixel da Meta 1374737941406426 e GA4 G-0XJ03T0HMW estão em `tracking.js` (só carregam após "Aceitar" cookies).
- Toda página nova: incluir no `sitemap.xml`, ligar no bloco "Guias rápidos" (Site.dc.html) e no campo `guias` da situação.
- Compliance OAB (Provimento 205/2021): sem promessa de resultado, sem preços, sem superlativos; julgados só depois do verificador de jurisprudência.
- Nunca apagar: `CNAME`, `google23c7663a8cb7f4c7.html`.
