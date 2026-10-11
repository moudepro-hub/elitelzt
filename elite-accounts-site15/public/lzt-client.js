/* Liga os filtros existentes (filters.js) à API /api/accounts/{game}. Não altera o visual dos filtros. */
(function(){
var app=document.getElementById('app');if(!app||!window.LZT)return;
var game=app.dataset.game,fp=app.querySelector('.fp'),box=document.getElementById('accs');
var TIERS={Ferro:[3,5],Bronze:[6,8],Prata:[9,11],Ouro:[12,14],Platina:[15,17],Diamante:[18,20],Ascendente:[21,23],Imortal:[24,26],Radiante:[27,27]};
var R=function(a,b){return{r:[a,b]}};
/* filtro do site  ->  parâmetro real da LZT   (chave = "título do grupo|placeholder") */
var MAP={
fortnite:{
 '|Pesquisar por título ou ID Fortnite':{k:'title'},'|Última atividade em dias':{k:'daybreak'},
 '|Selecionar skins':{a:'skin[]'},'|Selecionar picaretas':{a:'pickaxe[]'},'|Selecionar emotes':{a:'dance[]'},'|Selecionar asas-deltas':{a:'glider[]'},
 '|Plataforma':{a:'platform[]'},
 'E-mail alterável':{seg:'change_email'},'Vinculável ao XBOX':{seg:'xbox_linkable'},'Vinculável à PSN':{seg:'psn_linkable'},'Passe de Batalha':{seg:'bp'},
 'Custo total em V-Bucks|Mín. de skins':R('skins_shop_vbmin','skins_shop_vbmax'),'Custo total em V-Bucks|Picaretas, de':R('pickaxes_shop_vbmin','pickaxes_shop_vbmax'),
 'Custo total em V-Bucks|Danças, de':R('dances_shop_vbmin','dances_shop_vbmax'),'Custo total em V-Bucks|Asas-deltas, de':R('gliders_shop_vbmin','gliders_shop_vbmax'),
 '|Skins, de':R('smin','smax'),'|Picaretas, de':R('pickaxe_min','pickaxe_max'),'|Danças, de':R('dmin','dmax'),'|Asas-deltas, de':R('glider_min','glider_max'),'|Mín. de amigos':R('friends_min','friends_max'),
 '|Mín. de V-Bucks':R('vbmin','vbmax'),'|Nível, de':R('lmin','lmax'),
 'Itens pagos|Mín. de skins':R('skins_shop_min','skins_shop_max'),'Itens pagos|Picaretas, de':R('pickaxes_shop_min','pickaxes_shop_max'),
 'Itens pagos|Danças, de':R('dances_shop_min','dances_shop_max'),'Itens pagos|Asas-deltas, de':R('gliders_shop_min','gliders_shop_max'),
 'Nível do Passe de Batalha|de':R('bp_lmin','bp_lmax')},
valorant:{
 '|Pesquisar por título ou ID Valorant':{k:'title'},'|Última atividade em dias':{k:'daybreak'},
 '|Selecionar skins':{a:'weaponSkin[]'},'|Selecionar gunbuddies':{a:'buddy[]'},'|Facas (tanto faz)':{bool:'knife'},
 'E-mail vinculado':{seg:'email'},'Telefone vinculado':{seg:'tel'},
 'Valor do inventário|de, VP':R('inv_min','inv_max'),
 '|Mín. de skins':R('valorant_smin','valorant_smax'),'|Facas, de':R('valorant_knife_min','valorant_knife_max'),'|Agentes, de':R('amin','amax'),
 '|Nível, de':R('valorant_level_min','valorant_level_max'),'|VP, de':R('vp_min','vp_max'),'|RP, de':R('rp_min','rp_max'),'|Mín. de agentes grátis':R('fa_min','fa_max'),
 'Rank':{rank:['rmin','rmax']},'Rank da temporada anterior':{rank:['previous_rmin','previous_rmax']}}
}[game];
var CHIPS={fortnite:{'Até R$ 100':{pmax:100},'Até R$ 300':{pmax:300},'100+ skins':{smin:100},'1.000+ V-Bucks':{vbmin:1000},'Full acesso':{change_email:'yes'}},
 valorant:{'Até R$ 100':{pmax:100},'Até R$ 300':{pmax:300},'Radiante / Imortal':{rmin:24},'50+ skins':{valorant_smin:50},'Full acesso':{email:'no',tel:'no'}}}[game];
var SEGV={Sim:'yes','Não':'no',Talvez:'maybe'};
var PRICE_MIN=20,PRICE_MAX=999;
var st={page:1,order:'',chips:{}};

function collect(){
 var q=new URLSearchParams(),add=function(k,v){if(v!==''&&v!=null)q.append(k,v)};
 var pmin=PRICE_MIN,pmax=PRICE_MAX;
 var p1=document.getElementById('p1'),p2=document.getElementById('p2');
 if(p1)pmin=Math.max(PRICE_MIN,Math.min(PRICE_MAX,+p1.value||PRICE_MIN));
 if(p2)pmax=Math.max(PRICE_MIN,Math.min(PRICE_MAX,+p2.value||PRICE_MAX));
 if(pmin>pmax){var t=pmin;pmin=pmax;pmax=t}
 add('pmin',String(pmin));add('pmax',String(pmax));
 fp.querySelectorAll('.fg').forEach(function(g){
  var t=(g.querySelector('.ft')||{}).textContent||'';t=t.trim();
  var seg=g.querySelector('.seg');
  if(seg){var m=MAP[t];var on=seg.querySelector('.on');if(m&&m.seg&&on&&SEGV[on.textContent])add(m.seg,SEGV[on.textContent]);return}
  g.querySelectorAll('input.fi:not([type=number]),select.fi').forEach(function(e){
   if(e.closest('.rg'))return;var ph=e.tagName==='SELECT'?e.options[0].text:e.placeholder,m=MAP[t+'|'+ph];if(!m||!e.value)return;
   if(m.k)add(m.k,e.value.trim());
   else if(m.a){e.value.split(',').forEach(function(v){v=v.trim();if(v)add(m.a,v)})}
   else if(m.bool)add(m.bool,e.value==='Sim'?'true':'false')});
  g.querySelectorAll('.rg').forEach(function(rg){
   var ins=rg.querySelectorAll('input.fi'),sel=rg.querySelectorAll('select.fi');
   if(ins.length){var m=MAP[t+'|'+ins[0].placeholder];if(m&&m.r){add(m.r[0],ins[0].value);add(m.r[1],ins[1].value)}}
   else if(sel.length&&MAP[t]&&MAP[t].rank){var k=MAP[t].rank,a=TIERS[sel[0].value],b=TIERS[sel[1].value];if(a)add(k[0],a[0]);if(b)add(k[1],b[1])}})});
 Object.keys(st.chips).forEach(function(c){var o=CHIPS[c];for(var k in o){
  if(k==='pmax'){var v=Math.min(PRICE_MAX,Math.max(PRICE_MIN,+o[k]||PRICE_MAX));q.set(k,String(v))}
  else if(k==='pmin'){var v=Math.max(PRICE_MIN,Math.min(PRICE_MAX,+o[k]||PRICE_MIN));q.set(k,String(v))}
  else q.set(k,o[k])}});
 if(st.order)q.set('order_by',st.order);
 q.set('page',st.page);return q}

var busy=false,lastQ='';
function state(msg){box.innerHTML='<div class="lzt-msg">'+LZT.esc(msg)+'</div>'}
async function load(silent){
 if(busy)return;var q=collect();var title=q.get('title');
 if(!silent&&title&&/^\d{5,12}$/.test(title)){location.href='/'+game+'/'+title;return}   // ID digitado -> abre a página da conta
 busy=true;lastQ=q.toString();if(!silent)state('Carregando contas…');
 try{
  var d=await LZT.get('/api/accounts/'+game+'?'+lastQ);
  box.innerHTML=d.items.length?d.items.map(LZT.card).join(''):'<div class="lzt-msg">Nenhuma conta encontrada com esses filtros.</div>';
  pager(d);var t=document.getElementById('tot');if(!t){t=document.createElement('span');t.id='tot';document.getElementById('cnt').appendChild(t)}
  t.textContent=' · '+(d.totalItems||0).toLocaleString('pt-BR')+' conta(s) encontrada(s)';
 }catch(e){if(!silent)state(e.status===429?'Muitas buscas seguidas. Aguarde alguns segundos e tente de novo.':(e.message||'Erro ao buscar contas')+(e.status?' (código '+e.status+')':'')+' — veja /api/health para o diagnóstico.')}
 busy=false}
function pager(d){var pg=document.getElementById('pager');if(!pg){pg=document.createElement('div');pg.id='pager';pg.className='pager';box.after(pg)}
 var last=Math.max(1,Math.ceil((d.totalItems||0)/(d.perPage||1)));
 pg.innerHTML=last>1||d.hasNextPage?'<button type="button" data-p="-1"'+(d.page<=1?' disabled':'')+'>← Anterior</button><span>Página '+d.page+(last>1?' de '+last:'')+'</span><button type="button" data-p="1"'+(d.hasNextPage?'':' disabled')+'>Próxima →</button>':''}
document.addEventListener('click',function(e){var b=e.target.closest('#pager button');if(!b||b.disabled)return;st.page=Math.max(1,st.page+(+b.dataset.p));load();fp.scrollIntoView({behavior:'smooth'})});

document.getElementById('go').addEventListener('click',function(){st.page=1;load()});
document.getElementById('clr').addEventListener('click',function(){st.chips={};app.querySelectorAll('.chip').forEach(function(c){c.classList.remove('on')});st.page=1;setTimeout(load,0)});
fp.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.tagName==='INPUT'){st.page=1;load()}});
var ORD={'Padrão':'','Mais baratas':'price_to_up','Mais caras':'price_to_down','Mais recentes':'pdate_to_down','Mais antigas':'pdate_to_up'};
app.querySelectorAll('.sort button').forEach(function(b){b.addEventListener('click',function(){st.order=ORD[b.textContent]||'';st.page=1;load()})});
app.querySelectorAll('.chip').forEach(function(c){c.addEventListener('click',function(){var n=c.textContent;if(c.classList.contains('on'))st.chips[n]=1;else delete st.chips[n];st.page=1;load()})});

load();
})();
