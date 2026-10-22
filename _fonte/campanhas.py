# Gera as páginas de campanha (bagagem, overbooking, passageiro-especial, salario-maternidade)
import os, re, json, html, urllib.parse
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'site')
LIVE = os.path.join(ROOT, '..', 'live', 'index.html')

def rd(p): return open(p, encoding='utf-8').read()
def esc(t): return html.escape(t, quote=True)
wa = lambda t: 'https://wa.me/5568999993427?text=' + urllib.parse.quote(t)

live = rd(LIVE)
STYLE = live[live.index('<style>') + 7: live.index('</style>')]
FONTS = re.search(r'(<link href="https://fonts\.googleapis\.com/css2[^"]*" rel="stylesheet">)', live).group(1)
WA_SVG = '<svg aria-hidden="true" width="{s}" height="{s}" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>'
TRACK = rd(os.path.join(ROOT, 'tracking.js'))

ICONES = {
 'mala': '<rect x="5" y="7" width="14" height="13" rx="2"/><path d="M9 7V4h6v3"/><path d="M9 11v5M15 11v5"/>',
 'aviao': '<path d="M2.5 19.5h19"/><path d="M3 13l3.5 1.5L10 12 6 5l2-.8 7 6 4.4-1.9a1.9 1.9 0 0 1 1.5 3.5L7 17.6 3 13z"/>',
 'acess': '<circle cx="12" cy="4.5" r="1.8"/><path d="M12 7.5v6h5l2 5"/><path d="M8.5 10.5a6 6 0 1 0 7.8 7.6"/>',
 'bebe': '<circle cx="12" cy="11" r="7"/><path d="M9.5 10h.01M14.5 10h.01"/><path d="M10 13.5c1.2 1 2.8 1 4 0"/><path d="M12 4c-1 1-1 2.3 0 3"/>',
}

REVIEWS = [
 ('“Tirou minhas dúvidas de forma humanizada, é coerente, sem burocracia. Obrigado, indico.”', 'Tiago Silva', None),
 ('“Fui atendida bem mais rápido que eu esperava. Obrigada Matheus pela atenção e sua competência.”', 'Vanessa Hyago', 'assets/rev-vanessa.jpg'),
 ('“Ter alguém responsável cuidando e auxiliando faz toda diferença. Matheus se mostrou um ótimo representante além de um ser humano incrível, nunca deixou de responder.”', 'Paula Batista', 'assets/rev-paula.jpg'),
]

PAGINAS = [
{
 'slug': 'bagagem', 'icone': 'mala',
 'title': 'Bagagem extraviada, danificada ou violada — Matheus Silva Advogado · OAB/AC 5292',
 'desc': 'Sua mala não chegou, voltou quebrada ou violada? Veja o que a ANAC garante, o que fazer agora e fale com o advogado pelo WhatsApp. Rio Branco/AC e todo o Brasil.',
 'kicker': 'Bagagem extraviada, danificada ou violada',
 'h1': 'Sua mala não chegou?', 'h1b': 'Guarde a etiqueta e o RIB.',
 'sub': 'A companhia aérea responde pela bagagem do check-in até a esteira. Mande pelo WhatsApp o que aconteceu e os papéis que você tem: o Dr. Matheus analisa o seu caso e diz o que dá para fazer.',
 'msg': 'Olá Dr. Matheus, vim pela página de bagagem. Tive problema com minha mala no voo. Posso mandar o RIB e a etiqueta?',
 'cta': 'Mandar meu caso no WhatsApp',
 'docs': ['Cartão de embarque ou bilhete', 'Etiqueta da bagagem (o adesivo do despacho)', 'RIB: Registro de Irregularidade de Bagagem', 'Notas do que precisou comprar (roupa, higiene, remédio)', 'Fotos da mala, se voltou quebrada ou violada', 'Conversas e e-mails com a companhia'],
 'lei': [
   ('Prazo para devolver a mala', 'Voo doméstico: até 7 dias. Voo internacional: até 21 dias. Se a mala não for devolvida no prazo, a companhia tem mais 7 dias para indenizar.', 'Resolução ANAC 400/2016, art. 32'),
   ('Despesas enquanto espera', 'Se você está fora de casa, a companhia deve reembolsar o que precisou comprar de primeira necessidade enquanto a mala não volta, mediante comprovante.', 'Resolução ANAC 400/2016, art. 34'),
   ('Mala quebrada ou violada', 'A companhia também responde pelo que foi danificado ou sumiu de dentro da mala. Registre a reclamação ainda no aeroporto e fotografe tudo.', 'Resolução ANAC 400/2016 e Código de Defesa do Consumidor'),
   ('Além do valor da mala', 'Dependendo do caso, os transtornos também podem gerar indenização. A Justiça exige que o prejuízo seja demonstrado, por isso as provas fazem diferença.', 'Código Brasileiro de Aeronáutica, art. 251-A'),
 ],
 'passos': [
   ('Ainda no aeroporto', 'Procure o balcão da companhia e peça o RIB. Se a mala chegou estragada, mostre na hora.'),
   ('Guarde os papéis', 'Etiqueta, cartão de embarque e todas as notas do que você comprou.'),
   ('Anote os protocolos', 'Cada contato com a companhia: data, número do protocolo e o que disseram.'),
   ('Mande no WhatsApp', 'Foto de tudo. A gente lê e responde dizendo o que dá para fazer no seu caso.'),
 ],
 'faq': [
   ('Já saí do aeroporto sem o RIB. E agora?', 'Registre a reclamação com a companhia o quanto antes, por escrito (site, aplicativo ou e-mail), e guarde o protocolo. Mande o que você tiver: analisamos a partir disso.'),
   ('A mala voltou depois de alguns dias. Ainda vale a pena?', 'Depende do que você passou e gastou enquanto esperava. Cada caso é analisado individualmente.'),
   ('O voo era internacional. Muda alguma coisa?', 'Muda. Em voo internacional valem também as regras da Convenção de Montreal, e o prazo para entrar na Justiça pode ser de apenas 2 anos. Não deixe para depois.'),
   ('Preciso ir até o escritório?', 'Não. O atendimento é todo pelo WhatsApp, com contrato e assinatura digitais. Se preferir, marcamos um horário presencial na OAB/AC, em Rio Branco.'),
 ],
},
{
 'slug': 'overbooking', 'icone': 'aviao',
 'title': 'Overbooking: impedido de embarcar — Matheus Silva Advogado · OAB/AC 5292',
 'desc': 'Foi impedido de embarcar mesmo com passagem? Veja a compensação e a assistência que a ANAC garante, o que fazer agora e fale com o advogado pelo WhatsApp.',
 'kicker': 'Overbooking · preterição de embarque',
 'h1': 'Ficou em terra com a passagem na mão?', 'h1b': 'Isso tem nome: overbooking.',
 'sub': 'Quando a companhia vende mais lugares do que o avião tem e deixa você para trás, ela tem obrigações imediatas. Mande pelo WhatsApp o que aconteceu: o Dr. Matheus analisa e diz o que dá para fazer.',
 'msg': 'Olá Dr. Matheus, vim pela página de overbooking. Fui impedido de embarcar no meu voo. Posso mandar os documentos?',
 'cta': 'Mandar meu caso no WhatsApp',
 'docs': ['Bilhete e cartão de embarque', 'Comprovante de check-in no horário', 'Declaração da companhia sobre o motivo (peça no balcão)', 'Recibos de alimentação, hotel e transporte', 'Comprovante do que você perdeu (compromisso, diária, evento)', 'Voucher ou termo que a companhia entregou, se houver'],
 'lei': [
   ('Compensação na hora', 'Se não houver voluntários e você for deixado em terra, a companhia deve pagar uma compensação imediata: 250 DES em voo doméstico e 500 DES em voo internacional. DES é uma moeda de referência, convertida em reais.', 'Resolução ANAC 400/2016, art. 24'),
   ('Você escolhe a solução', 'Embarque no próximo voo, reembolso integral da passagem ou outro meio de transporte. A escolha é sua, não da companhia.', 'Resolução ANAC 400/2016, art. 21'),
   ('Assistência enquanto espera', 'A partir de 1 hora: comunicação. A partir de 2 horas: alimentação. A partir de 4 horas: hospedagem, se houver pernoite, e transporte.', 'Resolução ANAC 400/2016, arts. 26 e 27'),
   ('Além da compensação', 'Dependendo do que você perdeu, os prejuízos podem ser cobrados à parte. A Justiça exige que o dano seja demonstrado, por isso guarde as provas.', 'Código de Defesa do Consumidor e Código Brasileiro de Aeronáutica, art. 251-A'),
 ],
 'passos': [
   ('Peça por escrito', 'No balcão, peça uma declaração com o motivo de você não ter embarcado.'),
   ('Escolha a alternativa', 'Próximo voo, reembolso ou outro transporte. Guarde o comprovante.'),
   ('Guarde as notas', 'Comida, hotel, táxi e tudo o que você perdeu por causa do atraso.'),
   ('Mande no WhatsApp', 'Foto de tudo. A gente lê e responde dizendo o que dá para fazer no seu caso.'),
 ],
 'faq': [
   ('Aceitei um voucher e assinei um termo. Perdi o direito?', 'Não necessariamente. Mande o termo para análise: é preciso ver exatamente o que foi assinado.'),
   ('Eu me ofereci como voluntário. Vale também?', 'Quem se oferece em troca de vantagens negociadas com a companhia está numa situação diferente. Conte como foi, que analisamos.'),
   ('O voo era internacional. Muda alguma coisa?', 'Muda. Em voo internacional valem também as regras da Convenção de Montreal, e o prazo para entrar na Justiça pode ser de apenas 2 anos. Não deixe para depois.'),
   ('Preciso ir até o escritório?', 'Não. O atendimento é todo pelo WhatsApp, com contrato e assinatura digitais. Se preferir, marcamos um horário presencial na OAB/AC, em Rio Branco.'),
 ],
},
{
 'slug': 'passageiro-especial', 'icone': 'acess',
 'title': 'Passageiro com necessidade de assistência especial — Matheus Silva Advogado · OAB/AC 5292',
 'desc': 'Pessoa com deficiência, idoso, gestante ou com criança de colo sem a assistência devida no voo? Veja o que a ANAC garante e fale com o advogado pelo WhatsApp.',
 'kicker': 'Pessoa com deficiência, idoso, gestante ou com criança de colo',
 'h1': 'A companhia aérea negou ajuda', 'h1b': 'ou tratou você com descaso?',
 'sub': 'Pessoa com deficiência, idoso a partir de 60 anos, gestante, lactante, quem viaja com criança de colo e pessoa com mobilidade reduzida têm direito a assistência especial em toda a viagem. Conte pelo WhatsApp o que aconteceu.',
 'msg': 'Olá Dr. Matheus, vim pela página de passageiro com necessidade especial. Tive um problema com a assistência da companhia aérea. Posso contar o que aconteceu?',
 'cta': 'Contar o que aconteceu',
 'docs': ['Bilhete e cartão de embarque', 'Print ou e-mail mostrando que pediu assistência', 'Documento que mostra a condição (laudo, se tiver)', 'Fotos ou vídeos do ocorrido', 'Nome dos funcionários e horário', 'Recibos de despesas e contato de testemunhas'],
 'lei': [
   ('Ajuda em todas as etapas', 'Check-in, embarque, desembarque, conexões e acomodação a bordo, com equipamento e pessoal treinado, sem cobrança.', 'Resolução ANAC 280/2013'),
   ('Acompanhante com desconto', 'Quando a companhia exige acompanhante, o assento dele deve custar no máximo 20% do valor da passagem.', 'Resolução ANAC 280/2013'),
   ('Cadeira de rodas e equipamentos', 'São transportados sem custo e precisam ser devolvidos em perfeito estado. Se voltaram danificados, registre na hora.', 'Resolução ANAC 280/2013'),
   ('Avise com antecedência', 'Informe a necessidade na compra ou com 48 a 72 horas de antecedência, conforme o tipo de ajuda. Mesmo sem aviso, a companhia deve se esforçar para atender.', 'Resolução ANAC 280/2013'),
 ],
 'passos': [
   ('Registre a reclamação', 'Por escrito, com a companhia, e anote o número do protocolo.'),
   ('Guarde as provas', 'Fotos, vídeos, prints da compra e nome de quem atendeu.'),
   ('Anote as testemunhas', 'Nome e telefone de quem viu o que aconteceu.'),
   ('Mande no WhatsApp', 'A gente lê com atenção e responde dizendo o que dá para fazer no seu caso.'),
 ],
 'faq': [
   ('Não avisei a companhia antes do voo. Perdi o direito?', 'Não necessariamente. Mesmo sem aviso, a companhia deve se esforçar para prestar a assistência. Conte como foi.'),
   ('Quem tem direito à assistência especial?', 'Pessoa com deficiência, idoso a partir de 60 anos, gestante, lactante, pessoa acompanhada de criança de colo e pessoa com mobilidade reduzida.'),
   ('Danificaram ou extraviaram a minha cadeira de rodas.', 'Registre na hora com a companhia, fotografe e mande para análise. Esse tipo de caso costuma exigir urgência.'),
   ('Preciso ir até o escritório?', 'Não. O atendimento é todo pelo WhatsApp, com contrato e assinatura digitais. Se preferir, marcamos um horário presencial na OAB/AC, em Rio Branco.'),
 ],
},
{
 'slug': 'salario-maternidade', 'icone': 'bebe',
 'title': 'Salário-maternidade para desempregada — Matheus Silva Advogado · OAB/AC 5292',
 'desc': 'Estava sem emprego quando o bebê nasceu? Você pode ter direito ao salário-maternidade pago pelo INSS, e dá para pedir até 5 anos depois do parto. Fale com o advogado pelo WhatsApp.',
 'kicker': 'Salário-maternidade · INSS',
 'h1': 'Estava sem emprego quando o bebê nasceu?', 'h1b': 'Você pode ter direito.',
 'sub': 'Quem trabalhou de carteira assinada ou contribuiu ao INSS continua protegida por um tempo depois de parar. Se o bebê nasceu nesse período, o INSS paga direto, por 120 dias. E o pedido pode ser feito até 5 anos depois do parto.',
 'msg': 'Olá Dr. Matheus, vim pela página do salário-maternidade. Estava sem emprego quando meu bebê nasceu. Posso mandar meus documentos?',
 'cta': 'Ver se eu tenho direito',
 'docs': ['RG ou CNH, e CPF', 'Certidão de nascimento do bebê', 'Carteira de trabalho (página da saída) ou termo de rescisão', 'Comprovante de seguro-desemprego, se recebeu', 'Carta do INSS, se já pediu e foi negado', 'Senha do gov.br (se não lembrar, ajudamos a recuperar)'],
 'lei': [
   ('Protegida depois de sair', 'Em regra, você continua segurada do INSS por 12 meses após a última contribuição. Esse prazo pode chegar a 24 ou 36 meses, conforme o tempo de contribuição e se o desemprego for comprovado.', 'Lei 8.213/1991, art. 15'),
   ('Sem número mínimo de contribuições', 'O STF afastou a exigência de carência para o salário-maternidade. O que importa é estar protegida pelo INSS na data do parto.', 'Supremo Tribunal Federal e IN PRES/INSS 188/2025'),
   ('Quem paga é o INSS', 'Para quem estava desempregada, o pagamento é feito direto pelo INSS, por 120 dias. Vale também para adoção.', 'Decreto 3.048/1999, art. 97, e Lei 8.213/1991, art. 71'),
   ('Prazo de 5 anos', 'O pedido pode ser feito até 5 anos depois do nascimento do bebê. Quem teve filho recentemente ainda está no prazo.', 'Lei 8.213/1991'),
   ('INSS tem 30 dias para decidir', 'Desde maio de 2026, o INSS tem até 30 dias, contados do pedido, para analisar. Se passar do prazo, o benefício é liberado provisoriamente.', 'Lei 15.415/2026 (art. 73-A da Lei 8.213/1991)'),
 ],
 'video': {'src': 'assets/salario-maternidade-video.mp4', 'poster': 'assets/salario-maternidade-video-poster.jpg',
   'titulo': 'Salário-maternidade em 1 minuto',
   'capitulos': [(6, '120 dias pagos pelo INSS'), (9, 'Até quando você continua protegida'), (18, 'Nunca contribuiu? Ainda pode dar tempo'), (43, 'Lei 15.415/2026: prazo de 30 dias'), (50, 'Como pedir e se o INSS negar')]},
 'passos': [
   ('Separe os documentos', 'Certidão de nascimento e carteira de trabalho já bastam para começar.'),
   ('Mande no WhatsApp', 'Por foto mesmo, do jeito que estiver.'),
   ('Conferimos o seu INSS', 'Vemos no seu histórico de contribuições se você estava protegida na data do parto.'),
   ('Pedido e acompanhamento', 'Se houver direito, fazemos o pedido e acompanhamos até a resposta do INSS.'),
 ],
 'faq': [
   ('Pedi demissão ou fui demitida por justa causa. Tenho direito?', 'Pode ter. O que importa é estar protegida pelo INSS na data do parto, e não o motivo da saída. Cada caso é analisado individualmente.'),
   ('O INSS já negou o meu pedido. E agora?', 'Dá para recorrer ou entrar na Justiça Federal. Mande a carta de indeferimento para análise.'),
   ('Sou MEI ou pagava o INSS por conta própria.', 'Também pode ter direito. Mande o que tiver e conferimos as suas contribuições.'),
   ('Quanto tempo o INSS demora para responder?', 'Pela Lei 15.415/2026, o INSS tem até 30 dias para analisar o pedido. Passado esse prazo, o benefício deve ser liberado provisoriamente.'),
   ('Moro fora de Rio Branco.', 'O atendimento é todo pelo WhatsApp, em todo o Acre, e as causas do INSS são atendidas em todo o Brasil.'),
 ],
},
]

import sys; sys.path.insert(0, ROOT)
from paginas_novas import NOVAS, ICONES_NOVOS
ICONES.update(ICONES_NOVOS)
PAGINAS += NOVAS
from paginas_empresas import EMPRESAS, AREAS, ICONES_EMPRESAS
ICONES.update(ICONES_EMPRESAS)
PAGINAS += EMPRESAS + AREAS

# cada guia antigo ganha "Leia também": a página da área (Google) + guias vizinhos
_AREA = {}
for _ar in AREAS:
    for _h, _t, _x in _ar['relacionados']: _AREA[_h] = _ar
_EXTRA = {'passageiro-especial': 'advogado-consumidor-rio-branco'}
for _p in PAGINAS:
    if _p.get('relacionados'): continue
    _ar = _AREA.get(_p['slug']) or next((a for a in AREAS if a['slug'] == _EXTRA.get(_p['slug'])), None)
    if not _ar: continue
    _viz = [r for r in _ar['relacionados'] if r[0] != _p['slug']][:2]
    _p['relacionados_titulo'] = 'Leia também'
    _p['relacionados'] = [(_ar['slug'], _ar['kicker'], 'Como funciona o atendimento nesta área.')] + _viz

VIDJS = '''
<script>
(function () {
  var v = document.getElementById("vid"), b = document.getElementById("vid-play"), contou = false;
  if (!v) return;
  function tocar(t) {
    if (typeof t === "number") { try { v.currentTime = t; } catch (e) {} }
    b.style.display = "none";
    var r = v.play(); if (r && r.catch) r.catch(function () {});
  }
  b.addEventListener("click", function () { tocar(); });
  v.addEventListener("play", function () {
    b.style.display = "none";
    if (!contou) { contou = true; try { if (window.gtag) window.gtag("event", "video_play", { item_name: document.title }); if (window.fbq) window.fbq("trackCustom", "VideoPlay"); } catch (e) {} }
  });
  document.querySelectorAll(".cap").forEach(function (c) {
    c.addEventListener("click", function () {
      var t = parseFloat(c.getAttribute("data-t"));
      if (v.readyState < 1) { v.preload = "auto"; v.load(); v.addEventListener("loadedmetadata", function f() { v.removeEventListener("loadedmetadata", f); tocar(t); }); b.style.display = "none"; }
      else tocar(t);
      v.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
})();
</script>'''

def icon(nome, size=26, stroke='#C8102E'):
    return f'<svg aria-hidden="true" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">{ICONES[nome]}</svg>'

CHECK = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="flex:none;margin-top:2px"><path d="M5 12l5 5L20 7"/></svg>'

def wa_btn(link, label, evento, big=True, extra=''):
    pad = '17px 26px' if big else '12px 18px'
    fs = '17px' if big else '15px'
    return (f'<a class="wa sheen" href="{esc(link)}" data-evento="{esc(evento)}" target="_blank" rel="noopener" '
            f'style="background:#25D366;color:#052E16;text-decoration:none;font-weight:800;font-size:{fs};padding:{pad};border-radius:999px;'
            f'display:inline-flex;align-items:center;gap:10px;min-height:48px;box-sizing:border-box{extra}">'
            f'{WA_SVG.format(s=22 if big else 20)}<span>{esc(label)}</span></a>')

def pagina(p):
    link = wa(p['msg'])
    ev = 'Campanha · ' + p['slug']
    docs = ''.join(f'<li class="swap" style="animation-delay:{0.25+i*0.08:.2f}s;display:flex;gap:10px;align-items:flex-start">{CHECK}<span>{esc(d)}</span></li>' for i, d in enumerate(p['docs']))
    lei = ''.join(f'''
      <article class="lift rv" style="flex:1 1 250px;min-width:0;background:#FFFDF9;border-radius:20px;padding:26px;display:flex;flex-direction:column;gap:10px;box-sizing:border-box">
        <span style="font-family:Montserrat,sans-serif;font-weight:900;font-size:15px;color:#C8102E">{i+1:02d}</span>
        <h3 style="margin:0;font-family:Montserrat,sans-serif;font-weight:800;font-size:20px;line-height:1.25">{esc(t)}</h3>
        <p style="margin:0;font-size:16px;line-height:1.6;color:#4A443C">{esc(x)}</p>
        <span style="margin-top:auto;padding-top:8px;font-size:13px;color:#6B6358;border-top:1px dashed #D8C8AC">{esc(f)}</span>
      </article>''' for i, (t, x, f) in enumerate(p['lei']))
    passos = ''.join(f'''
      <li class="rv" style="flex:1 1 220px;min-width:0;display:flex;flex-direction:column;gap:8px">
        <span style="width:44px;height:44px;border-radius:50%;background:{'#25D366' if i==3 else '#C8102E'};color:{'#052E16' if i==3 else '#FFFFFF'};font-family:Montserrat,sans-serif;font-weight:900;font-size:18px;display:flex;align-items:center;justify-content:center">{i+1}</span>
        <strong style="font-family:Montserrat,sans-serif;font-size:18px;color:#FFFFFF">{esc(t)}</strong>
        <span style="font-size:15px;line-height:1.55;color:#C9C6BF">{esc(x)}</span>
      </li>''' for i, (t, x) in enumerate(p['passos']))
    faq = ''.join(f'''
      <details style="background:#FFFDF9;border-radius:16px;padding:18px 22px">
        <summary style="display:flex;justify-content:space-between;gap:16px;align-items:center;font-family:Montserrat,sans-serif;font-weight:700;font-size:17px;line-height:1.35">{esc(q)}<span class="plus" aria-hidden="true" style="flex:none;font-size:26px;color:#C8102E;line-height:1">+</span></summary>
        <p style="margin:12px 0 0;font-size:16px;line-height:1.6;color:#4A443C">{esc(a)}</p>
      </details>''' for q, a in p['faq'])
    revs = ''
    for txt, nome, foto in ([] if p.get('sem_avaliacoes') else REVIEWS):
        av = (f'<img src="{foto}" alt="" width="40" height="40" style="width:40px;height:40px;border-radius:50%;object-fit:cover">' if foto else
              f'<span style="width:40px;height:40px;border-radius:50%;background:#C8102E;color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center">{nome[0]}</span>')
        revs += f'''
      <figure class="rv" style="flex:1 1 260px;min-width:0;margin:0;background:#FAF3E7;border-radius:18px;padding:22px;display:flex;flex-direction:column;gap:14px;box-sizing:border-box">
        <blockquote style="margin:0;font-size:16px;line-height:1.55">{esc(txt)}</blockquote>
        <figcaption style="display:flex;align-items:center;gap:10px;font-size:14px">{av}<span><strong>{esc(nome)}</strong><br><span style="color:#E3A008">★★★★★</span> <span style="color:#6B6358">· Google</span></span></figcaption>
      </figure>'''
    vid = ''
    if p.get('video'):
        v = p['video']
        caps = ''.join(f'<li><button type="button" data-t="{t}" class="cap" style="width:100%;text-align:left;display:flex;gap:12px;align-items:center;border:none;background:#FAF3E7;border-radius:12px;padding:12px 14px;min-height:48px;cursor:pointer;font-size:15px;font-weight:600;color:#1A1A1A"><span style="flex:none;font-family:Montserrat,sans-serif;font-weight:800;font-size:13px;color:#FFFFFF;background:#C8102E;border-radius:8px;padding:4px 8px">{t//60}:{t%60:02d}</span>{esc(c)}</button></li>' for t, c in v['capitulos'])
        vid = f'''
  <section class="bloco rv" style="background:#FFFDF9;border-radius:28px;padding:48px;display:flex;flex-wrap:wrap;gap:40px;align-items:center">
    <div style="flex:0 1 340px;min-width:0;margin:0 auto;width:100%;max-width:340px">
      <div style="position:relative;border-radius:26px;overflow:hidden;background:#0A0510;aspect-ratio:9/16;box-shadow:0 22px 50px rgba(26,26,26,.25)">
        <video id="vid" src="{v['src']}" poster="{v['poster']}" controls playsinline preload="none" style="width:100%;height:100%;object-fit:cover;display:block"></video>
        <button id="vid-play" type="button" aria-label="Assistir ao vídeo" style="position:absolute;inset:0;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center">
          <span class="ring" style="position:absolute;width:84px;height:84px;border-radius:50%;background:rgba(255,255,255,.35)"></span>
          <span style="position:relative;width:84px;height:84px;border-radius:50%;background:#FFFFFF;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(0,0,0,.35)"><svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="#C8102E"><path d="M8 5v14l11-7z"/></svg></span>
        </button>
      </div>
    </div>
    <div style="flex:1 1 360px;min-width:0;display:flex;flex-direction:column;gap:16px">
      <span style="font-weight:700;font-size:14px;color:#A50D26;letter-spacing:.08em;text-transform:uppercase">Assista · 1 minuto</span>
      <h2 style="margin:0;font-family:Montserrat,sans-serif;font-weight:900;font-size:34px;line-height:1.15">{esc(v['titulo'])}</h2>
      <p style="margin:0;font-size:16px;line-height:1.6;color:#4A443C">Toque num tema para ir direto a ele:</p>
      <ol style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px">{caps}</ol>
      <div style="margin-top:6px">{wa_btn(link, p['cta'], ev + ' · vídeo').replace('class="wa sheen"', 'class="wa sheen wa-full"')}</div>
    </div>
  </section>'''

    secao_revs = '' if not revs else f'''
  <section class="bloco rv" style="background:#FFFDF9;border-radius:28px;padding:48px;display:flex;flex-direction:column;gap:22px">
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px">
      <h2 style="margin:0;font-family:Montserrat,sans-serif;font-weight:900;font-size:30px;line-height:1.15">Quem já foi atendido</h2>
      <a href="https://maps.app.goo.gl/Q7Zaa8nAwU2fWV8r9?g_st=ac" target="_blank" rel="noopener" style="font-weight:700;font-size:15px">Ver as 60 avaliações no Google</a>
    </div>
    <div class="cols">{revs}
    </div>
  </section>
'''
    checklist = ''
    if p.get('checklist'):
        grupos = ''.join(f'''
      <div class="rv" style="flex:1 1 250px;min-width:0;background:#FFFDF9;border-radius:20px;padding:24px;display:flex;flex-direction:column;gap:12px;box-sizing:border-box">
        <h3 style="margin:0;font-family:Montserrat,sans-serif;font-weight:800;font-size:18px">{esc(g)}</h3>
        <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;font-size:15px;line-height:1.45">{''.join(f'<li style="display:flex;gap:10px;align-items:flex-start">{CHECK}<span>{esc(it)}</span></li>' for it in itens)}</ul>
      </div>''' for g, itens in p['checklist'])
        checklist = f'''
  <section class="bloco rv" style="background:#F5EBD9;border:2px dashed #D8C8AC;border-radius:28px;padding:48px;display:flex;flex-direction:column;gap:22px">
    <div style="display:flex;flex-direction:column;gap:8px;max-width:720px">
      <span style="font-weight:700;font-size:14px;color:#A50D26;letter-spacing:.08em;text-transform:uppercase">Confira na sua empresa</span>
      <h2 style="margin:0;font-family:Montserrat,sans-serif;font-weight:900;font-size:34px;line-height:1.15">{esc(p.get('checklist_titulo', 'Checklist'))}</h2>
    </div>
    <div class="cols">{grupos}
    </div>
  </section>
'''
    relac = ''
    if p.get('relacionados'):
        cards = ''.join(f'''
      <a class="lift rv" href="{h}" style="flex:1 1 220px;min-width:0;background:#FAF3E7;border-radius:18px;padding:20px 22px;text-decoration:none;color:#1A1A1A;display:flex;flex-direction:column;gap:6px;box-sizing:border-box">
        <strong style="font-family:Montserrat,sans-serif;font-size:18px">{esc(t)} <span style="color:#C8102E">→</span></strong>
        <span style="font-size:15px;line-height:1.5;color:#4A443C">{esc(x)}</span>
      </a>''' for h, t, x in p['relacionados'])
        relac = f'''
  <section class="bloco rv" style="background:#FFFDF9;border-radius:28px;padding:48px;display:flex;flex-direction:column;gap:22px">
    <h2 style="margin:0;font-family:Montserrat,sans-serif;font-weight:900;font-size:30px;line-height:1.15">{esc(p.get('relacionados_titulo', 'Leia também'))}</h2>
    <div class="cols">{cards}
    </div>
  </section>
'''
    url = 'https://matheussilvaadv.com.br/' + p['slug']
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "FAQPage", "@id": url + "#faq", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in p['faq']]},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Matheus Silva Advogado", "item": "https://matheussilvaadv.com.br/"},
            {"@type": "ListItem", "position": 2, "name": p['kicker'], "item": url}]},
    ]}
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(p['title'])}</title>
<meta name="description" content="{esc(p['desc'])}">
<link rel="canonical" href="https://matheussilvaadv.com.br/{p['slug']}">
<meta property="og:url" content="https://matheussilvaadv.com.br/{p['slug']}">
<meta name="theme-color" content="#1A1A1A">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="{esc(p['h1'] + ' ' + p['h1b'])}">
<meta property="og:description" content="{esc(p['desc'])}">
<meta property="og:image" content="https://matheussilvaadv.com.br/assets/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="assets/favicon.png">
<link rel="apple-touch-icon" href="assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{FONTS}
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<style>{STYLE}
.cols{{display:flex;flex-wrap:wrap;gap:16px}}
@media (max-width:640px){{
  .hero-l{{padding:30px 22px !important}}
  .hero-r{{padding:26px 22px !important}}
  .bloco{{padding:32px 22px !important}}
  .h1{{font-size:34px !important}}
  .sub{{font-size:17px !important}}
  .hero-l{{gap:18px !important}}
  .nav-site{{display:none !important}}
  .wa-full{{width:100%;justify-content:center}}
}}
@media (max-width:420px){{
  .wa-mini span{{display:none}}
  .wa-mini{{padding:12px !important}}
}}
</style>
</head>
<body>
<div style="background:#F5EBD9;color:#1A1A1A;font-family:'DM Sans',system-ui,sans-serif;padding:20px 0 40px;overflow-x:hidden">
<div style="max-width:1240px;margin:0 auto;padding:0 16px;display:flex;flex-direction:column;gap:16px">

  <header class="in" style="background:#FFFDF9;border-radius:20px;padding:12px 14px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px">
    <a href="./" style="display:flex;align-items:center;gap:12px;text-decoration:none;color:#1A1A1A">
      <img src="assets/logo-ms.jpg" alt="" width="46" height="46" style="width:46px;height:46px;border-radius:12px;object-fit:contain;background:#0A0510;padding:5px;box-sizing:border-box">
      <span style="display:flex;flex-direction:column;line-height:1.2">
        <span style="font-family:Montserrat,sans-serif;font-weight:800;font-size:17px">Matheus Silva</span>
        <span style="font-size:13px;color:#5A5248">Advogado · OAB/AC 5292</span>
      </span>
    </a>
    <span style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
      <a class="nav-site" href="./" style="color:#1A1A1A;text-decoration:none;font-weight:600;font-size:15px;padding:12px 14px">Conheça o escritório</a>
      {wa_btn(link, 'WhatsApp', ev, big=False).replace('class="wa sheen"', 'class="wa sheen wa-mini" aria-label="WhatsApp"')}
    </span>
  </header>

  <section class="cols" style="align-items:stretch">
    <div class="in hero-l" style="flex:3 1 520px;min-width:0;background:#FFFDF9;border-radius:28px;padding:48px;display:flex;flex-direction:column;gap:22px;box-sizing:border-box">
      <span style="align-self:flex-start;display:inline-flex;align-items:center;gap:10px;background:#FBE3E6;color:#A50D26;font-weight:700;font-size:14px;padding:8px 14px 8px 8px;border-radius:999px">
        <span class="bob" style="width:30px;height:30px;border-radius:50%;background:#FFFFFF;display:flex;align-items:center;justify-content:center">{icon(p['icone'], 18)}</span>{esc(p['kicker'])}
      </span>
      <h1 class="h1" style="margin:0;font-family:Montserrat,sans-serif;font-weight:900;font-size:56px;line-height:1.04;letter-spacing:-.02em">{esc(p['h1'])}<br><span style="color:#C8102E;position:relative;display:inline-block">{esc(p['h1b'])}<span class="ul" style="position:absolute;left:0;right:0;bottom:-4px;height:5px;background:#C8102E;border-radius:3px;opacity:.25"></span></span></h1>
      <p class="sub" style="margin:0;font-size:19px;line-height:1.6;color:#4A443C;max-width:640px">{esc(p['sub'])}</p>
      <div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">
        {wa_btn(link, p['cta'], ev, extra=';box-shadow:0 12px 30px rgba(37,211,102,.35)').replace('class="wa sheen"', 'class="wa sheen wa-full"')}
        <span style="font-size:14px;color:#6B6358">Atendimento direto com o advogado · Rio Branco/AC e todo o Brasil</span>
      </div>
      <a href="https://maps.app.goo.gl/Q7Zaa8nAwU2fWV8r9?g_st=ac" target="_blank" rel="noopener" style="margin-top:6px;align-self:flex-start;display:inline-flex;align-items:center;gap:12px;text-decoration:none;color:#1A1A1A;background:#F5EBD9;border-radius:14px;padding:10px 16px">
        <strong style="font-family:Montserrat,sans-serif;font-size:26px;font-weight:900">5,0</strong>
        <span style="display:flex;flex-direction:column;font-size:13px;line-height:1.3"><span style="color:#E3A008;font-size:15px">★★★★★</span><span>60 avaliações no Google</span></span>
      </a>
    </div>

    <aside class="in hero-r" style="flex:2 1 340px;min-width:0;background:#1A1A1A;color:#FFFFFF;border-radius:28px;padding:36px;display:flex;flex-direction:column;gap:18px;box-sizing:border-box;animation-delay:.12s">
      <div style="display:flex;align-items:center;gap:14px">
        <img src="assets/retrato-poster.jpg" alt="Dr. Matheus Silva" width="58" height="58" style="width:58px;height:58px;border-radius:50%;object-fit:cover;object-position:50% 20%;border:3px solid #C8102E">
        <span style="display:flex;flex-direction:column;line-height:1.3"><strong style="font-family:Montserrat,sans-serif;font-size:17px">Dr. Matheus Silva</strong><span style="font-size:14px;color:#B8B5AE">lê e responde o seu caso</span></span>
      </div>
      <h2 style="margin:0;font-family:Montserrat,sans-serif;font-weight:800;font-size:22px;line-height:1.3">{esc(p.get('docs_titulo', 'Já separe, se tiver:'))}</h2>
      <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px;font-size:16px;line-height:1.45">{docs}</ul>
      <span style="margin-top:auto;font-size:14px;color:#B8B5AE;border-top:1px solid #333;padding-top:14px">Pode mandar por foto, do jeito que estiver. Depois de ler, dizemos o que ainda falta.</span>
    </aside>
  </section>
{vid}
  <section class="bloco rv" style="background:#FAF3E7;border-radius:28px;padding:48px;display:flex;flex-direction:column;gap:24px">
    <div style="display:flex;flex-direction:column;gap:8px;max-width:720px">
      <span style="font-weight:700;font-size:14px;color:#A50D26;letter-spacing:.08em;text-transform:uppercase">O que a regra garante</span>
      <h2 style="margin:0;font-family:Montserrat,sans-serif;font-weight:900;font-size:34px;line-height:1.15">Entenda em 1 minuto</h2>
    </div>
    <div class="cols">{lei}
    </div>
  </section>
{checklist}
  <section class="bloco rv" style="background:#1A1A1A;border-radius:28px;padding:48px;display:flex;flex-direction:column;gap:28px">
    <h2 style="margin:0;font-family:Montserrat,sans-serif;font-weight:900;font-size:34px;line-height:1.15;color:#FFFFFF">{esc(p.get('passos_titulo', 'O que fazer agora'))}</h2>
    <ol class="cols" style="margin:0;padding:0;list-style:none;gap:28px">{passos}
    </ol>
    <div>{wa_btn(link, p['cta'], ev).replace('class="wa sheen"', 'class="wa sheen wa-full"')}</div>
  </section>

{secao_revs}{relac}
  <section class="bloco rv" style="background:#FAF3E7;border-radius:28px;padding:48px;display:flex;flex-direction:column;gap:14px">
    <h2 style="margin:0 0 8px;font-family:Montserrat,sans-serif;font-weight:900;font-size:30px;line-height:1.15">Dúvidas comuns</h2>{faq}
  </section>

  <section class="bloco rv" style="background:#C8102E;color:#FFFFFF;border-radius:28px;padding:48px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:22px">
    <div style="display:flex;flex-direction:column;gap:8px;max-width:640px">
      <h2 style="margin:0;font-family:Montserrat,sans-serif;font-weight:900;font-size:32px;line-height:1.15">{esc(p.get('faixa_h2', 'Conte o que aconteceu.'))}</h2>
      <p style="margin:0;font-size:17px;line-height:1.55;color:#FBE3E6">{esc(p.get('faixa_txt', 'Atendimento direto com o advogado, do primeiro contato ao fim do processo. O escritório nunca pede dinheiro para liberar valores.'))}</p>
    </div>
    {wa_btn(link, p['cta'], ev).replace('class="wa sheen"', 'class="wa sheen wa-full"')}
  </section>

  <footer style="background:#FFFDF9;border-radius:20px;padding:24px 28px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;font-size:13px;line-height:1.6;color:#5A5248">
    <span><strong style="color:#1A1A1A">Matheus Silva – Sociedade Individual de Advocacia</strong><br>CNPJ 55.499.593/0001-74 · OAB/AC 5292 · <a href="./">Site do escritório</a></span>
    <span>Atendimento presencial com hora marcada:<br>Escritório Corporativo da OAB/AC · Alameda Min. Miguel Ferrante, 450<br>Portal da Amazônia · Rio Branco/AC · CEP 69915-632</span>
    <span style="max-width:380px">Conteúdo informativo, nos termos do Provimento 205/2021 da OAB. Cada caso é analisado individualmente; não há promessa de resultado. · <a href="privacidade.html">Política de privacidade</a> · <a href="#" onclick="preferenciasCookies();return false">Preferências de cookies</a> · <a href="equipe" rel="nofollow">Área da equipe</a></span>
  </footer>
</div>

<div style="position:fixed;right:18px;bottom:18px;z-index:50">
  <a href="{esc(link)}" data-evento="{esc(ev)} · flutuante" aria-label="Conversar no WhatsApp" target="_blank" rel="noopener" style="position:relative;width:62px;height:62px;display:block">
    <span class="ring" style="position:absolute;inset:0;border-radius:50%;background:#25D366"></span>
    <span style="position:absolute;inset:0;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 26px rgba(37,211,102,.45)">{WA_SVG.format(s=32)}</span>
  </a>
</div>
</div>
<script>window.ORIGEM_PAGINA = "{p['slug']}";</script>{VIDJS if p.get('video') else ''}
<script>
{TRACK}
</script>
<script src="assets/assistente.js" defer></script>
</body>
</html>
'''

for p in PAGINAS:
    out = pagina(p)
    assert out.count('<div') == out.count('</div>'), p['slug']
    assert out.count('<section') == out.count('</section>'), p['slug']
    fn = os.path.join(OUT, p['slug'] + '.html')
    open(fn, 'w', encoding='utf-8').write(out)
    print('ok', p['slug'], len(out))
