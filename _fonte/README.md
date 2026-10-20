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
- `build/campanhas.py` gera as 18 páginas de guia/campanha. O conteúdo fica em `campanhas.py` (bagagem, overbooking, passageiro-especial, salario-maternidade), em `paginas_novas.py` (os outros 9 temas) e em `paginas_empresas.py` (empresa-processada, advocacia-preventiva e as 3 páginas de área para o Google: advogado-trabalhista/inss/consumidor-rio-branco). Ele lê o estilo de `live/index.html`.
  - Opções do molde: `sem_avaliacoes`, `checklist`, `relacionados` (cartões "Leia também"), `docs_titulo`, `passos_titulo`, `faixa_h2`, `faixa_txt`. Os guias antigos ganham "Leia também" automaticamente (página da área + 2 guias vizinhos).
  - Toda página sai com FAQPage + BreadcrumbList (dados estruturados). O `build2.py` põe FAQPage na página inicial a partir da seção "Dúvidas".
- Rodar sempre com `python3 -I build/build2.py` e `python3 -I build/campanhas.py`; a saída vai para `build/site/`.

## Publicar
- Desde 20/10/2026 o Claude pode publicar direto pelo git (repositório anexado à sessão): `git commit` + `git push` na `main`. O GitHub Pages publica em 1 a 3 minutos.
- O conhecimento do assistente do site (`site-conhecimento.json`, no repositório guias-clientes) é gerado a partir destes guias: página nova de guia → regerar e publicar lá também.

## Regras
- Pixel da Meta 1374737941406426 e GA4 G-0XJ03T0HMW estão em `tracking.js` (só carregam após "Aceitar" cookies).
- Toda página nova: incluir no `sitemap.xml`, ligar no bloco "Guias rápidos" (Site.dc.html) e no campo `guias` da situação.
- Compliance OAB (Provimento 205/2021): sem promessa de resultado, sem preços, sem superlativos; julgados só depois do verificador de jurisprudência.
- Nunca apagar: `CNAME`, `google23c7663a8cb7f4c7.html`.
