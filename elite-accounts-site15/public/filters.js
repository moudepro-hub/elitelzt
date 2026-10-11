(function(){
var app=document.getElementById('app');if(!app)return;
var game=app.dataset.game,A='até',SEG=['Tanto faz','Sim','Não'];
var rk=['Ferro','Bronze','Prata','Ouro','Platina','Diamante','Ascendente','Imortal','Radiante'];
var rg=function(){return{rg:[].slice.call(arguments)}};
var CFG={
fortnite:{cls:'cols',title:'Contas de Fortnite',cols:[
 [{items:[{price:1}]},{items:[{in:'Pesquisar por título ou ID Fortnite'}]},{items:[{in:'Última atividade em dias'}]},{items:[{sel:'Plataforma',o:['PC','Xbox','PlayStation','Switch','Mobile']}]}],
 [{items:[{pk:'Selecionar skins'},{pk:'Selecionar picaretas'},{pk:'Selecionar emotes'},{pk:'Selecionar asas-deltas'}]},
  {t:'E-mail alterável',items:[{seg:SEG}]},{t:'Vinculável ao XBOX',items:[{seg:['Tanto faz','Talvez','Não']}]},{t:'Vinculável à PSN',items:[{seg:['Tanto faz','Talvez','Não']}]},
  {t:'Custo total em V-Bucks',items:[rg(['Mín. de skins',A],['Picaretas, de',A],['Danças, de',A],['Asas-deltas, de',A])]}],
 [{items:[rg(['Skins, de',A],['Picaretas, de',A],['Danças, de',A],['Asas-deltas, de',A],['Mín. de V-Bucks',A],['Mín. de amigos',A],['Nível, de',A])]},
  {t:'Itens pagos',items:[rg(['Mín. de skins',A],['Picaretas, de',A],['Danças, de',A],['Asas-deltas, de',A])]},
  {t:'Passe de Batalha',items:[{seg:SEG}]},{t:'Nível do Passe de Batalha',items:[rg(['de',A])]}]],
 chips:['Até R$ 100','Até R$ 300','100+ skins','1.000+ V-Bucks','Full acesso'],
 accs:[['OG Black Knight','PC · Xbox','Skins','152','V-Bucks','1.200','Picaretas','38',349],['Renegade Raider','PC','Skins','84','V-Bucks','450','Picaretas','21',199],['Conta Galaxy + Pass','PlayStation','Skins','210','V-Bucks','3.000','Picaretas','52',590],['Starter Elite','Mobile','Skins','36','V-Bucks','800','Picaretas','9',79],['Conta Rara OG T2','PC','Skins','98','V-Bucks','150','Picaretas','27',420],['Full Acesso Premium','Todas','Skins','305','V-Bucks','5.400','Picaretas','74',1290]]},
valorant:{cls:'cols',title:'Contas de Valorant',cols:[
 [{items:[{price:1}]},{items:[{in:'Pesquisar por título ou ID Valorant'}]},{items:[{in:'Última atividade em dias'}]}],
 [{items:[{pk:'Selecionar skins'},{sel:'Facas (tanto faz)',o:['Sim','Não']},{pk:'Selecionar gunbuddies'}]},
  {t:'E-mail vinculado',items:[{seg:SEG}]},{t:'Telefone vinculado',items:[{seg:SEG}]},
  {t:'Valor do inventário',items:[rg(['de, VP','até, VP'])]}],
 [{items:[rg(['Mín. de skins',A],['Facas, de',A],['Agentes, de',A],['Nível, de',A],['VP, de',A],['RP, de',A],['Mín. de agentes grátis',A])]},
  {t:'Rank',items:[{rk:1}]},{t:'Rank da temporada anterior',items:[{rk:1}]}]],
 chips:['Até R$ 100','Até R$ 300','Radiante / Imortal','50+ skins','Full acesso'],
 accs:[['Imortal 2 · 120 skins','Imortal 2','Skins','120','Agentes','22','VP','1.400',489],['Ascendente com Facas','Ascendente 1','Skins','64','Agentes','19','VP','320',259],['Radiante Full Skins','Radiante','Skins','210','Agentes','24','VP','4.100',1190],['Conta Inicial','Ouro 2','Skins','18','Agentes','14','VP','0',59],['Platina + Vandal Prime','Platina 3','Skins','41','Agentes','20','VP','680',149],['Diamante Raro','Diamante 1','Skins','88','Agentes','23','VP','900',329]]}
}[game];
var PRICE_MIN=20,PRICE_MAX=999;
var h=function(s){return s.replace(/"/g,'&quot;')};
function field(f){
 if(f.price)return '<div class="pr"><div class="top">PREÇO<b id="pv">R$ '+PRICE_MIN.toLocaleString('pt-BR')+' — R$ '+PRICE_MAX.toLocaleString('pt-BR')+'</b></div><div class="sl"><i class="fill"></i><input type="range" min="'+PRICE_MIN+'" max="'+PRICE_MAX+'" value="'+PRICE_MIN+'" id="p1"><input type="range" min="'+PRICE_MIN+'" max="'+PRICE_MAX+'" value="'+PRICE_MAX+'" id="p2"></div><div class="lb"><span>R$ '+PRICE_MIN.toLocaleString('pt-BR')+'</span><span>R$ '+PRICE_MAX.toLocaleString('pt-BR')+'</span></div></div>';
 if(f.in)return '<input class="fi" placeholder="'+h(f.in)+'">';
 if(f.pk)return '<input class="fi pk" placeholder="'+h(f.pk)+'">';
 if(f.sel)return '<select class="fi"><option value="">'+f.sel+'</option>'+(f.o||[]).map(function(o){return'<option>'+o+'</option>'}).join('')+'</select>';
 if(f.seg)return '<div class="seg">'+f.seg.map(function(o,i){return'<button type="button"'+(i?'':' class="on"')+'>'+o+'</button>'}).join('')+'</div>';
 if(f.rk){var o='<option value="">'+'de'+'</option>'+rk.map(function(r){return'<option>'+r+'</option>'}).join('');return'<div class="rg"><select class="fi">'+o+'</select><select class="fi">'+o.replace('>de<','>até<')+'</select></div>'}
 return f.rg.map(function(r){return'<div class="rg"><input class="fi" type="number" placeholder="'+h(r[0])+'"><input class="fi" type="number" placeholder="'+h(r[1])+'"></div>'}).join('');
}
function grp(g){return'<div class="fg">'+(g.t?'<div class="ft">'+g.t+'</div>':'')+g.items.map(field).join('')+'</div>'}
var body=CFG.cols?CFG.cols.map(function(c){return'<div class="fcol">'+c.map(grp).join('')+'</div>'}).join(''):CFG.g.map(grp).join('');
var ico='<svg class="i" viewBox="0 0 24 24"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>';
var S={'Padrão':0,'Mais baratas':1,'Mais caras':2,'Mais recentes':3,'Mais antigas':4};
app.innerHTML='<section class="fp"><div class="fh"><div class="ic">'+ico+'</div><div><h2>Filtros de busca</h2><p>Combine os filtros para achar a conta perfeita</p></div><button class="tg" type="button">Ocultar filtros</button></div>'
+'<div class="fb '+CFG.cls+'">'+body+'</div>'
+'<div class="fa"><button class="btn pri" type="button" id="go">Buscar contas</button><button class="btn sec" type="button" id="clr">Limpar filtros</button></div></section>'
+'<div class="cnt" id="cnt">0 filtro(s) ativo(s)</div>'
+'<div class="qk"><span>BUSCA RÁPIDA</span>'+CFG.chips.map(function(c){return'<button class="chip" type="button">'+c+'</button>'}).join('')+'</div>'
+'<div class="sort">'+Object.keys(S).map(function(k,i){return'<button type="button"'+(i?'':' class="on"')+'>'+k+'</button>'}).join('')+'</div>'
+'<div class="accs" id="accs"></div>';
var fp=app.querySelector('.fp');
fp.classList.add('shut');fp.querySelector('.tg').textContent='Mostrar filtros';   /* contas aparecem logo ao abrir; filtros abrem pelo botão */
fp.querySelector('.tg').onclick=function(){fp.classList.toggle('shut');this.textContent=fp.classList.contains('shut')?'Mostrar filtros':'Ocultar filtros'};
/* contador */
var cnt=document.getElementById('cnt'),p1=document.getElementById('p1'),p2=document.getElementById('p2');
function count(){var n=0;fp.querySelectorAll('input.fi,select.fi').forEach(function(e){if(e.value)n++});
 fp.querySelectorAll('.seg').forEach(function(s){if(!s.firstChild.classList.contains('on'))n++});
 if(p1&&(+p1.value>PRICE_MIN||+p2.value<PRICE_MAX))n++;cnt.textContent=n+' filtro(s) ativo(s)'}
fp.addEventListener('input',count);
fp.querySelectorAll('.seg').forEach(function(s){s.onclick=function(e){if(e.target.tagName!=='BUTTON')return;s.querySelectorAll('button').forEach(function(b){b.classList.remove('on')});e.target.classList.add('on');count()}});
/* slider */
function sl(e){if(!p1)return;var a=+p1.value,b=+p2.value;if(e&&e.target===p1&&a>b)p1.value=a=b;if(e&&e.target===p2&&b<a)p2.value=b=a;
 var rng=PRICE_MAX-PRICE_MIN;var f=fp.querySelector('.fill');f.style.left=((a-PRICE_MIN)/rng*100)+'%';f.style.right=((PRICE_MAX-b)/rng*100)+'%';
 document.getElementById('pv').textContent='R$ '+a.toLocaleString('pt-BR')+' — R$ '+b.toLocaleString('pt-BR')}
if(p1){p1.oninput=p2.oninput=sl;sl()}
document.getElementById('clr').onclick=function(){fp.querySelectorAll('input.fi').forEach(function(e){e.value=''});fp.querySelectorAll('select.fi').forEach(function(e){e.selectedIndex=0});
 fp.querySelectorAll('.seg').forEach(function(s){s.querySelectorAll('button').forEach(function(b,i){b.classList.toggle('on',!i)})});if(p1){p1.value=PRICE_MIN;p2.value=PRICE_MAX;sl()}count()};
app.querySelectorAll('.chip').forEach(function(c){c.onclick=function(){c.classList.toggle('on')}});
/* a lista de contas agora vem da LZT (lzt-client.js); aqui só alterna o botão de ordenação ativo */
app.querySelectorAll('.sort button').forEach(function(b){b.onclick=function(){app.querySelectorAll('.sort button').forEach(function(x){x.classList.remove('on')});b.classList.add('on')}});
})();
