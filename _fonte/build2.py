import re, urllib.parse, os, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.join(ROOT, '..', 'site', 'project')
OUT = os.path.join(ROOT, 'site')

def rd(p): return open(p, encoding='utf-8').read()
wa = lambda t: 'https://wa.me/5568999993427?text=' + urllib.parse.quote(t)
WA_SVG_RE = re.compile(r'(<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF">.*?</svg>)', re.S)

BLOBS = {
 '6af05ed5745c66733b2e6e9619297c5c': 'assets/logo-ms.jpg',
 '8aee2667480682203abb82bee7fff446': 'assets/logo-completo.jpg',
 '732e087626914d2b8c789537439e81dc': 'assets/rev-paula.jpg',
 'fc26fac36288166f6d49ead527e88240': 'assets/rev-dinarque.jpg',
 'c2cf71da51e26380f717ef81ba6d9b87': 'assets/rev-nayellen.jpg',
 '1aebb69ce521faddf1d4590e09c2e7ca': 'assets/rev-vanessa.jpg',
 '222e537619d9f32bd553fe72ef625b7c': 'assets/rev-luciana.jpg',
 '2f3eb0ec7d7cb187c0a6e2e24c4113dd': 'assets/retrato-loop.mp4',
 '5f6f72d1ceb4254d8754f0321d5b1269': 'assets/retrato-poster.jpg',
 'eca74af2c1157a62be31950005b8af03': 'assets/retrato-poster.jpg',
 '9092ee4f32938b2b9cbe74cca8dbc66a': 'assets/trabalho-loop.mp4',
 'ac27f34f51648d1804ff622d82e955d8': 'assets/trabalho-poster.jpg',
 '4661ad6283d056c8906d3f7894d58e8c': 'assets/previdencia-loop.mp4',
 '63020a74f8b4c87c04359583042c111b': 'assets/previdencia-poster.jpg',
 '7f81d3258c03038e44f423d440530a61': 'assets/consumidor-loop.mp4',
 'be706d8f623e4914e4f686fc9319fe4b': 'assets/consumidor-poster.jpg',
}
PAGES_HREF = {'Site.dc.html': './', 'Empresas.dc.html': 'empresas.html', 'Privacidade.dc.html': 'privacidade.html', 'Trabalhe.dc.html': 'trabalhe-conosco.html', 'Trilha.dc.html': 'trilha-estagio.html'}

def common(body, holes):
    for k, v in holes.items():
        body = body.replace('{{' + k + '}}', v)
    left = re.findall(r'\{\{[^}]+\}\}', body)
    assert not left, left
    assert '<sc-' not in body, re.findall(r'<sc-[^>]*>', body)[:3]
    for k, v in BLOBS.items():
        body = body.replace('/_blob/' + k, v)
    assert '/_blob/' not in body, re.findall(r'/_blob/\w+', body)
    for k, v in PAGES_HREF.items():
        body = body.replace('href="' + k, 'href="' + v)
    assert '.dc.html' not in body
    body = body.replace('autoPlay="true" muted="true" loop="true" playsInline="true"', 'autoplay muted loop playsinline preload="metadata"')
    def ext(m):
        tag = m.group(0)
        if 'target=' in tag: return tag
        return tag[:-1] + ' target="_blank" rel="noopener">'
    body = re.sub(r'<a [^>]*href="https://[^"]*"[^>]*>', ext, body)
    # & cru em href
    body = re.sub(r'href="([^"]*)"', lambda m: 'href="' + m.group(1).replace('&amp;', '&').replace('&', '&amp;') + '"', body)
    return body

def faq_ld(out):
    # 20/10/2026: perguntas da seção "Dúvidas" viram dados estruturados (FAQPage) para o Google
    import html as _h, json as _j
    if 'id="duvidas"' not in out or '"FAQPage"' in out: return out
    i = out.index('id="duvidas"'); j = out.index('</section>', i)
    pares = re.findall(r'<summary[^>]*>(.*?)</summary>\s*<p[^>]*>(.*?)</p>', out[i:j], re.S)
    limpa = lambda t: _h.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', t))).strip().rstrip('+').strip()
    if not pares: return out
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": limpa(q), "acceptedAnswer": {"@type": "Answer", "text": limpa(a)}} for q, a in pares]}
    return out.replace('</head>', '<script type="application/ld+json">' + _j.dumps(ld, ensure_ascii=False) + '</script>\n</head>', 1)

def page(dc, path, title, desc, holes, body_fix=None, extra_js='', assistente=True, noindex=False):
    html = rd(os.path.join(PROJ, dc))
    helmet = re.search(r'<helmet>(.*?)</helmet>', html, re.S).group(1)
    style = re.search(r'<style>(.*?)</style>', helmet, re.S).group(1)
    fonts = re.search(r'(<link href="https://fonts\.googleapis\.com/css2[^"]*" rel="stylesheet">)', helmet).group(1)
    body = re.search(r'</helmet>(.*?)</x-dc>', html, re.S).group(1)
    script = re.search(r'<script type="text/x-dc"[^>]*>(.*?)</script>', html, re.S).group(1)
    if body_fix: body = body_fix(body, script)
    body = common(body, holes)
    # rodapé: preferências de cookies
    body = body.replace('>Política de privacidade</a>', '>Política de privacidade</a> · <a href="#" onclick="preferenciasCookies();return false">Preferências de cookies</a>')
    head = rd(os.path.join(ROOT, 'head.html'))
    head = head.replace('__TITLE__', title).replace('__DESC__', desc).replace('__PATH__', path).replace('__FONTS__', fonts).replace('__STYLE__', style)
    js = rd(os.path.join(ROOT, 'tracking.js')) + '\n' + extra_js
    out = head + '<body>\n' + body.strip() + '\n<script>\n' + js + '\n</script>\n' + ('<script src="assets/assistente.js" defer></script>\n' if assistente else '') + '</body>\n</html>\n'
    assert out.count('<div') == out.count('</div>'), (dc, out.count('<div'), out.count('</div>'))
    fn = path or 'index.html'
    out = faq_ld(out)
    if noindex: out = out.replace('</head>', '<meta name="robots" content="noindex">\n</head>', 1)
    open(os.path.join(OUT, fn), 'w', encoding='utf-8').write(out)
    print('ok', fn, len(out))

# ---------- index ----------
def fix_site(body, script):
    m = re.search(r'    <div role="group" aria-label="Área".*?</sc-if>\s*<sc-if value="\{\{impar\}\}".*?</sc-if>', body, re.S)
    assert m
    wa_svg = WA_SVG_RE.search(body).group(1)
    block = rd(os.path.join(ROOT, 'site_block.html')).replace('__WA_SVG__', wa_svg)
    return body[:m.start()] + block + body[m.end():]

site_script = re.search(r'<script type="text/x-dc"[^>]*>(.*?)</script>', rd(os.path.join(PROJ, 'Site.dc.html')), re.S).group(1)
S = re.search(r'const S = (\[.*?\n    \]);', site_script, re.S).group(1)
AREAS = re.search(r'const AREAS = (\[.*?\]);', site_script, re.S).group(1)
app = rd(os.path.join(ROOT, 'app.js')).replace('__S__', S).replace('__AREAS__', AREAS)
page('Site.dc.html', '', 'Matheus Silva Advogado · OAB/AC 5292 — Trabalhista, Previdenciário e Consumidor',
     'Escritório 100% digital em Rio Branco/AC. Direito do Trabalho, Previdenciário (INSS) e do Consumidor. Atendimento pelo WhatsApp em todo o Acre e causas federais em todo o Brasil.',
     {'accent': '#C8102E',
      'waGeral': wa('Olá Dr. Matheus, vim pelo site e gostaria de conversar sobre o meu caso.'),
      'waContato': wa('Olá Dr. Matheus, vim pelo site e gostaria de iniciar uma conversa.'),
      'waLink': wa('Olá, sou cliente do escritório e quero receber de novo o link de acompanhamento do meu processo.'),
      'waGolpe': wa('Olá, recebi uma mensagem em nome do escritório e quero confirmar se é verdadeira.'),
      'waDoc': wa('Olá, sou cliente do escritório e quero enviar um documento do meu processo.'),
      'waDuvida': wa('Olá, sou cliente do escritório e tenho uma dúvida sobre o meu processo.'),
      'waPresencial': wa('Olá, sou cliente do escritório e quero agendar um atendimento presencial na OAB/AC.')},
     fix_site, app)

# ---------- empresas ----------
def fix_emp(body, script):
    body = body.replace(' onChange="{{onData}}"', '')
    m = re.search(r'      <sc-if value="\{\{temData\}\}".*?</sc-if>\s*<sc-if value="\{\{semData\}\}".*?</sc-if>', body, re.S)
    assert m
    block = '''      <div id="prazo-res" hidden style="background: #1E2026; padding: 20px; display: flex; flex-direction: column; gap: 6px">
        <span id="prazo-tit" style="font-family: Montserrat, sans-serif; font-weight: 900; font-size: 44px; line-height: 1; color: #FFFFFF"></span>
        <span id="prazo-txt" style="font-family: 'DM Sans', sans-serif; font-size: 15px; line-height: 1.5; color: #FFFFFF"></span>
      </div>
      <p id="prazo-ajuda" style="margin: 0; font-family: 'DM Sans', sans-serif; font-size: 15px; line-height: 1.55; color: #A9ABB3">Na Justiça do Trabalho, a defesa da empresa é apresentada até a audiência. Faltar a ela pode levar à revelia.</p>'''
    return body[:m.start()] + block + body[m.end():]
page('Empresas.dc.html', 'empresas.html', 'Defesa trabalhista para empresas — Matheus Silva Advogado · OAB/AC 5292',
     'Sua empresa recebeu notificação da Justiça do Trabalho? O que fazer nas primeiras 48 horas e como funciona a defesa trabalhista no Acre (TRT da 14ª Região).',
     {'accent': '#C8102E', 'waEmpresa': wa('Olá Dr. Matheus, sou de uma empresa e recebi uma notificação da Justiça do Trabalho. Posso enviar a foto?')},
     fix_emp, rd(os.path.join(ROOT, 'empresas.js')))

# ---------- privacidade ----------
page('Privacidade.dc.html', 'privacidade.html', 'Política de privacidade — Matheus Silva Advogado',
     'Como o escritório Matheus Silva Advogado trata dados pessoais, cookies e seus direitos pela LGPD.', {})

# ---------- trabalhe conosco (21/10/2026) ----------
# Ficha do candidato -> WhatsApp com a 1a linha "FICHA DE CANDIDATO"; o robo (simulador.js) reconhece e leva pro funil PROCESSO SELETIVO.
# Sem o assistente virtual (ele e para clientes).
page('Trabalhe.dc.html', 'trabalhe-conosco.html', 'Estágio em Direito — trabalhe com a gente · Matheus Silva Advogado',
     'Estágio em Direito 100% remoto no escritório Matheus Silva Advogado (Rio Branco/AC): atendimento de clientes pelo WhatsApp e montagem de casos, turno da manhã ou da tarde. Preencha a ficha e envie pelo WhatsApp.',
     {'waVaga': wa('Olá! Vi no site que vocês estão com processo seletivo de estágio em Direito e tenho interesse.')},
     None, rd(os.path.join(ROOT, 'trabalhe.js')), assistente=False)

# ---------- trilha de estudo do estágio (22/10/2026) ----------
# Módulos + quiz pelo link pessoal (?t=TOKEN) enviado pelo robô; o quiz é sorteado e corrigido no middleware (selecao.js).
page('Trilha.dc.html', 'trilha-estagio.html', 'Trilha de estudo do estágio · Matheus Silva Advogado',
     'Material de estudo do processo seletivo de estágio do escritório Matheus Silva Advogado.',
     {}, None, rd(os.path.join(ROOT, 'trilha.js')), assistente=False, noindex=True)
