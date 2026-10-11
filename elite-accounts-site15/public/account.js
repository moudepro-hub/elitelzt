/* Página dinâmica da conta: /fortnite/{id} e /valorant/{id} — busca /api/accounts/{game}/{id} e preenche o template */
(function(){
var B=document.body,pm=location.pathname.match(/^\/(fortnite|valorant)\/(\d{1,12})/),game=pm?pm[1]:B.dataset.game,id=pm?pm[2]:B.dataset.id,root=document.getElementById('acc-root'),E=LZT.esc;
var bk=document.querySelector('.back');if(bk)bk.href='/'+game+'/';
var NAMES={fortnite:'Fortnite',valorant:'Valorant'};
var TABS={fortnite:[['skins','Skins'],['pickaxes','Picaretas'],['dances','Danças'],['gliders','Asas-deltas']],valorant:[['skins','Skins'],['agents','Agentes'],['buddies','Chaveiros']]}[game];
var cfg={buyUrl:'#',discord:'#',refreshSec:60},cur=null,tab=TABS[0][0],all=false;
var ic={shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',bolt:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',chat:'<path d="M4 5h16v11H9l-5 4z"/>'};
var I=function(n){return '<svg class="i" viewBox="0 0 24 24">'+ic[n]+'</svg>'};

function gone(){document.title='Conta indisponível · Elite Accounts';
 root.innerHTML='<div class="empty gone"><div><h1>Conta indisponível</h1><p>Esta conta não está mais à venda.</p><a class="btn pri" href="/'+game+'/">Ver outras contas</a></div></div>'}
function render(a){
 cur=a;document.title=a.title+' · Elite Accounts';
 var buy=(cfg.buyUrl||'#').replace('{id}',a.id).replace('{game}',game);
 var isRealImg=function(src){return typeof src==='string'&&/^https?:\/\//i.test(src)};
 var itemCell=function(x){var real=isRealImg(x.image),txt=E(x.title).replace(/'/g,'&#39;');
  return '<div class="it thumb" title="'+E(x.title)+'">'+(real?'<img src="'+E(x.image)+'" alt="'+E(x.title)+'" title="'+E(x.title)+'" loading="lazy" onerror="this.remove();if(this.parentNode)this.parentNode.innerHTML=\'<span>'+txt+'</span>\'">':(x.image?'<img src="'+E(x.image)+'" alt="'+E(x.title)+'" title="'+E(x.title)+'" loading="lazy" onerror="this.remove();if(this.parentNode)this.parentNode.innerHTML=\'<span>'+txt+'</span>\'">':'<span>'+E(x.title)+'</span>'))+'</div>'};
 var items=function(k){var g=a.groups[k]||{items:[],count:0},lim=all?g.items.length:24,list=g.items.slice(0,lim);
  return '<div class="itab" data-k="'+k+'">'+(g.count?'<img class="coll" src="'+E(g.image)+'" alt="" loading="lazy" onerror="this.remove()">':'')
  +(list.length?'<div class="igrid">'+list.map(itemCell).join('')+'</div>'
   +(g.items.length>24?'<button class="more2" type="button">'+(all?'Mostrar menos':'Ver todos ('+g.items.length+')')+'</button>':''):'<p class="muted">'+(g.count?'Veja a imagem acima.':'Nenhum item neste grupo.')+'</p>')+'</div>'};
 root.innerHTML=
 '<nav class="crumbs"><a href="/">Início</a><i>›</i><a href="/'+game+'/">'+NAMES[game]+'</a><i>›</i><b>'+E(a.title)+'</b></nav>'
 +'<div class="acp">'
 +'<div class="acp-main">'
  +'<section class="card pnl head2"><div class="hero2"><img src="'+E(a.image)+'" alt="" onerror="this.parentNode.classList.add(\'noimg\');this.remove()"></div>'
  +'<div class="hinfo"><span class="eye">Conta '+NAMES[game]+'</span><h1>'+E(a.title)+'</h1>'
  +'<div class="pills"><span class="pill '+(a.available?'ok':'off')+'" id="stt">'+(a.available?'● Disponível':'● Indisponível')+'</span><button class="pill idp" type="button" id="cpid" title="Copiar ID">#'+E(a.id)+'</button>'
  +(a.tag?'<span class="pill">'+E(a.tag)+'</span>':'')+'</div></div></section>'
  +(a.info.length?'<section class="card pnl"><div class="eye">Mais informações</div><dl class="info">'+a.info.map(function(r){return '<div><dt>'+E(r.label)+'</dt><dd>'+E(r.value)+'</dd></div>'}).join('')+'</dl></section>':'')
  +'<section class="card pnl"><div class="tabs">'+TABS.map(function(t){var c=(a.groups[t[0]]||{}).count;return '<button type="button" data-k="'+t[0]+'" class="'+(t[0]===tab?'on':'')+'">'+t[1]+(c?' <em>'+c+'</em>':'')+'</button>'}).join('')+'</div><div id="itabs">'+items(tab)+'</div></section>'
 +'</div>'
 +'<aside class="acp-side">'
  +'<section class="card pnl"><div class="eye ok2">'+I('shield')+' Compra segura</div><div class="lab">Valor</div><div class="big2" id="pr">'+LZT.price(a.price,a.currency)+'</div><small class="muted">1 unidade</small>'
  +'<a class="btn pri full" id="buy" href="'+E(buy)+'" '+(a.available?'':'aria-disabled="true" style="pointer-events:none;opacity:.5"')+' target="_blank" rel="noopener">Comprar agora</a>'
  +(cfg.discord&&cfg.discord!=='#'?'<a class="btn sec full" href="'+E(cfg.discord)+'" target="_blank" rel="noopener">'+I('chat')+' Tirar dúvidas no Discord</a>':'')+'</section>'
  +'<section class="card pnl"><div class="eye ok2">'+I('shield')+' Entrega garantida</div><div class="gbox">Conta com problema? Reembolso imediato.</div>'
  +'<ul class="gl"><li>'+I('bolt')+'Entrega automática em poucos minutos.</li><li>'+I('key')+'Acesso completo: troca de e-mail e senha.</li><li>'+I('chat')+'Suporte na comunidade do Discord.</li></ul></section>'
 +'</aside></div>'
 +'<section class="sim" id="sim" hidden><h2>Contas parecidas</h2><p class="muted">Outras contas que você pode gostar.</p><div class="accs" id="simg"></div></section>';
 var b=document.getElementById('cpid');b&&b.addEventListener('click',function(){navigator.clipboard&&navigator.clipboard.writeText(a.id);b.textContent='Copiado ✓';setTimeout(function(){b.textContent='#'+a.id},1200)});
 root.querySelectorAll('.tabs button').forEach(function(t){t.onclick=function(){tab=t.dataset.k;all=false;root.querySelectorAll('.tabs button').forEach(function(x){x.classList.toggle('on',x===t)});paint()}});
 bindMore();
}
function paint(){if(!cur)return;var t=cur.groups[tab];document.getElementById('itabs').innerHTML=(function(){var g=t||{items:[],count:0},lim=all?g.items.length:24;
  var isRealImg=function(src){return typeof src==='string'&&/^https?:\/\//i.test(src)};
  var itemCell=function(x){var real=isRealImg(x.image),txt=E(x.title).replace(/'/g,'&#39;');
   return '<div class="it thumb" title="'+E(x.title)+'">'+(real?'<img src="'+E(x.image)+'" alt="'+E(x.title)+'" title="'+E(x.title)+'" loading="lazy" onerror="this.remove();if(this.parentNode)this.parentNode.innerHTML=\'<span>'+txt+'</span>\'">':(x.image?'<img src="'+E(x.image)+'" alt="'+E(x.title)+'" title="'+E(x.title)+'" loading="lazy" onerror="this.remove();if(this.parentNode)this.parentNode.innerHTML=\'<span>'+txt+'</span>\'">':'<span>'+E(x.title)+'</span>'))+'</div>'};
  return '<div class="itab">'+(g.count?'<img class="coll" src="'+E(g.image)+'" alt="" loading="lazy" onerror="this.remove()">':'')+(g.items.length?'<div class="igrid">'+g.items.slice(0,lim).map(itemCell).join('')+'</div>'+(g.items.length>24?'<button class="more2" type="button">'+(all?'Mostrar menos':'Ver todos ('+g.items.length+')')+'</button>':''):'<p class="muted">'+(g.count?'Veja a imagem acima.':'Nenhum item neste grupo.')+'</p>')+'</div>'})();bindMore()}
function bindMore(){var m=root.querySelector('.more2');m&&(m.onclick=function(){all=!all;paint()})}

async function similar(a){
 try{var lo=Math.floor(a.price*0.6),hi=Math.ceil(a.price*1.6),q=new URLSearchParams({pmin:Math.max(1,lo),pmax:Math.max(hi,2)});
  var d=await LZT.get('/api/accounts/'+game+'?'+q),l=d.items.filter(function(x){return x.id!==a.id}).slice(0,3);
  if(l.length){document.getElementById('simg').innerHTML=l.map(LZT.card).join('');document.getElementById('sim').hidden=false}}catch(e){}}
async function load(first){
 try{var a=await LZT.get('/api/accounts/'+game+'/'+id);
  if(!a.available)return gone();
  if(first||!cur){render(a);similar(a)}else{ // atualização silenciosa: só preço/status
   cur=a;var p=document.getElementById('pr');if(p)p.textContent=LZT.price(a.price,a.currency)}
 }catch(e){if(e.status===404)return gone();
  if(first)root.innerHTML='<div class="lzt-msg">'+E(e.status===429?'Muitas consultas. Aguarde alguns segundos e recarregue.':(e.message||'Erro ao carregar a conta'))+'</div>'}}
fetch('/api/config').then(function(r){return r.json()}).then(function(c){cfg=c}).catch(function(){}).then(function(){
 load(true);setInterval(function(){if(!document.hidden)load(false)},Math.max(30,cfg.refreshSec||60)*1000)});
})();
