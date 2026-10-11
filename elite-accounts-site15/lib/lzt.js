'use strict';
const F=require('./fields');
/* Host documentado do Market API: https://api.lzt.market  (docs: GET https://api.lzt.market/epicgames, /riot, /{item_id}). prod-api.lzt.market fica como alternativa. */
const BASE=()=>(process.env.LZT_API_BASE||'https://api.lzt.market').replace(/\/$/,'');
const ALT=()=>(process.env.LZT_API_FALLBACK||(BASE().includes('prod-api')?'https://api.lzt.market':'https://prod-api.lzt.market')).replace(/\/$/,'');
const CAT={fortnite:'epicgames',valorant:'riot'};             // Fortnite = /epicgames (+ epicgames_game[]=fortnite) · Valorant = /riot (+ riot_game[]=valorant)  — conforme a doc oficial
const num=(v,d)=>{const n=parseFloat(v);return Number.isFinite(n)?n:d};
const CFG=()=>({cur:(process.env.LZT_SEARCH_CURRENCY||'brl').toLowerCase(),mult:num(process.env.PRICE_MULTIPLIER,1),shown:(process.env.PRICE_CURRENCY||'BRL').toUpperCase(),
 ttlList:num(process.env.CACHE_LIST_TTL,60)*1e3,ttlItem:num(process.env.CACHE_ITEM_TTL,90)*1e3,timeout:num(process.env.LZT_TIMEOUT_MS,120000),debug:process.env.LZT_DEBUG==='1'});

/* ---------- parâmetros aceitos (somente nomes documentados) ---------- */
const N='num',A='arr',T='tri',B='bool';
const COMMON={page:N,pmin:N,pmax:N,title:'str',order_by:'ord',daybreak:N};
const PARAMS={
 fortnite:Object.assign({},COMMON,{smin:N,smax:N,vbmin:N,vbmax:N,'skin[]':A,'pickaxe[]':A,'glider[]':A,'dance[]':A,'platform[]':A,change_email:T,bp:T,
  lmin:N,lmax:N,bp_lmin:N,bp_lmax:N,xbox_linkable:T,psn_linkable:T,pickaxe_min:N,pickaxe_max:N,dmin:N,dmax:N,glider_min:N,glider_max:N,friends_min:N,friends_max:N,
  skins_shop_min:N,skins_shop_max:N,pickaxes_shop_min:N,pickaxes_shop_max:N,dances_shop_min:N,dances_shop_max:N,gliders_shop_min:N,gliders_shop_max:N,
  skins_shop_vbmin:N,skins_shop_vbmax:N,pickaxes_shop_vbmin:N,pickaxes_shop_vbmax:N,dances_shop_vbmin:N,dances_shop_vbmax:N,gliders_shop_vbmin:N,gliders_shop_vbmax:N}),
 valorant:Object.assign({},COMMON,{rmin:N,rmax:N,previous_rmin:N,previous_rmax:N,'weaponSkin[]':A,'buddy[]':A,'agent[]':A,valorant_level_min:N,valorant_level_max:N,
  inv_min:N,inv_max:N,vp_min:N,vp_max:N,valorant_smin:N,valorant_smax:N,amin:N,amax:N,knife:B,valorant_knife_min:N,valorant_knife_max:N,rp_min:N,rp_max:N,fa_min:N,fa_max:N,email:T,tel:T})
};
const ORDERS=['price_to_up','price_to_down','pdate_to_down','pdate_to_up','pdate_to_down_upload','pdate_to_up_upload','edate_to_up','edate_to_down'];
function cleanParams(game,sp){
 const spec=PARAMS[game],out=[];
 for(const [k,t] of Object.entries(spec)){
  const vals=sp.getAll(k).map(v=>String(v).trim()).filter(Boolean);if(!vals.length)continue;
  if(t===A)vals.slice(0,30).forEach(v=>{if(v.length<=100)out.push([k,v])});
  else{const v=vals[0];
   if(t===N&&/^\d{1,9}(\.\d{1,2})?$/.test(v))out.push([k,v]);
   else if(t==='str'&&v.length<=100)out.push([k,v]);
   else if(t==='ord'&&ORDERS.includes(v))out.push([k,v]);
   else if(t===T&&['yes','no','maybe','nomatter'].includes(v))out.push([k,v]);
   else if(t===B&&['true','false'].includes(v))out.push([k,v]);}
 }
 return out;
}

/* ---------- cache + limite de taxa (doc: busca 20/min com 3s entre chamadas; GET item 120/min) ---------- */
const cache=new Map(),inflight=new Map(),sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function cached(key,ttl,load){
 const c=cache.get(key);if(c&&c.exp>Date.now())return c.v;
 if(inflight.has(key))return inflight.get(key);
 const p=load().then(v=>{cache.set(key,{v,exp:Date.now()+ttl});if(cache.size>800)cache.delete(cache.keys().next().value);return v})
  .catch(e=>{if(c&&e.status!==404&&e.status!==403){return c.v}throw e}).finally(()=>inflight.delete(key));
 inflight.set(key,p);return p;
}
const lanes={};let blockedUntil=0;
function schedule(lane,gap,fn){const l=lanes[lane]||(lanes[lane]={p:Promise.resolve(),t:0});
 const run=l.p.then(async()=>{const w=l.t+gap-Date.now();if(w>0)await sleep(w);try{return await fn()}finally{l.t=Date.now()}});
 l.p=run.catch(()=>{});return run}
class LztError extends Error{constructor(status,msg,extra){super(msg);this.status=status;Object.assign(this,extra)}}
async function callOn(base,path,query,raw){
 const tok=process.env.LZT_TOKEN;if(!tok)throw new LztError(503,'LZT_TOKEN não configurado no servidor');
 if(Date.now()<blockedUntil)throw new LztError(429,'Limite da API atingido, tente em instantes',{retryAfter:Math.ceil((blockedUntil-Date.now())/1e3)});
 const u=new URL(base+path);(query||[]).forEach(([k,v])=>u.searchParams.append(k,v));
 const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),CFG().timeout);
 try{
  const r=await fetch(u,{headers:{Authorization:'Bearer '+tok,Accept:'application/json','User-Agent':'Mozilla/5.0 (compatible; EliteAccounts/1.0)'},signal:ctl.signal});
  if(r.status===429){const reset=num(r.headers.get('x-ratelimit-reset'),0)*1e3;blockedUntil=Math.max(Date.now()+5e3,reset);throw new LztError(429,'Limite da API atingido',{retryAfter:Math.ceil((blockedUntil-Date.now())/1e3)})}
  if(raw&&r.ok)return r;
  const txt=await r.text();let j=null;try{j=JSON.parse(txt)}catch(e){}
  if(!r.ok)throw new LztError(r.status,(j&&(j.errors&&j.errors[0]||j.error||j.message))||('Erro '+r.status));
  return j;
 }catch(e){if(e instanceof LztError)throw e;throw new LztError(502,e.name==='AbortError'?'Tempo esgotado na LZT':'Falha ao falar com a LZT')}
 finally{clearTimeout(t)}
}

const notRoute=e=>e&&e.status===404&&/requested page|not be found/i.test(e.message||'');
let route=null;                                   // {base,prefix} que já funcionou (depois disso não sonda mais)
async function call(path,query,raw){
 const hosts=[BASE(),ALT()],combos=route?[route]:[];
 if(!route)for(const prefix of ['','/market'])for(const base of hosts)combos.push({base,prefix});
 const attempts=[];let last;
 for(const c of combos){
  try{const r=await callOn(c.base,c.prefix+path,query,raw);route=c;return r}
  catch(e){last=e;attempts.push(c.base+c.prefix+path+' -> '+e.status+' '+e.message);if(!(notRoute(e)&&!route))break}}
 last.attempts=attempts;
 console.error('[LZT]',last.status,'GET',path,'->',last.message,attempts.length>1?'| tentativas: '+attempts.join(' ; '):'');throw last}

/* ---------- normalização ---------- */
const RARITY_CLR={common:'#9aa4b2',uncommon:'#5cb85c',rare:'#4b8bf5',epic:'#a855f7',superrare:'#c07615',legendary:'#f59e0b',mythic:'#ef4444',immortal:'#eab308',radiant:'#22d3ee',transcendent:'#ec4899'};
function svgThumb(title,rarity){
 const t=String(title||'').trim().slice(0,24);if(!t)return undefined;
 const bg=RARITY_CLR[String(rarity||'').toLowerCase()]||'#4f46e5';
 const hex=h=>parseInt(h.slice(1),16);
 const mix=(c,p)=>{const n=hex(c),r2=Math.max(0,Math.min(255,((n>>16)&255)+p)),g2=Math.max(0,Math.min(255,((n>>8)&255)+p)),b2=Math.max(0,Math.min(255,(n&255)+p));return'#'+r2.toString(16).padStart(2,'0')+g2.toString(16).padStart(2,'0')+b2.toString(16).padStart(2,'0')};
 const g=mix(bg,-45),b=mix(bg,28);
 const m=t.match(/[A-Za-z0-9]/);const init=String(m?m[0]:(t.charAt(0)||'?')).toUpperCase();
 const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const out='<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="'+g+'"/><stop offset="100%" stop-color="'+b+'"/></linearGradient></defs>'+
 '<rect width="96" height="96" rx="4" fill="url(#g)"/><rect x="1.5" y="1.5" width="93" height="93" rx="3" fill="none" stroke="rgba(255,255,255,.14)"/>'+
 '<text x="50%" y="53%" text-anchor="middle" font-family="Inter,Segoe UI,sans-serif" font-size="30" font-weight="700" fill="#fff" opacity=".98">'+esc(init)+'</text>'+
 '<text x="50%" y="86" text-anchor="middle" font-family="Inter,Segoe UI,sans-serif" font-size="8.5" fill="#fff" opacity=".96" style="paint-order:stroke fill markers" stroke="rgba(0,0,0,.34)" stroke-width=".6">'+esc(t)+'</text></svg>';
 return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(out)}
function pick(item,spec){const [names,rx]=spec;for(const n of names)if(item[n]!==undefined&&item[n]!==null&&item[n]!=='')return item[n];
 if(rx){const k=Object.keys(item).find(k=>rx.test(k)&&item[k]!==null&&item[k]!=='');if(k)return item[k]}return undefined}
function firstImg(o){if(!o||typeof o!=='object')return null;
 for(const k of ['image','icon','img','url','imageUrl','preview','thumbnail','fullImage','largeImage','smallImage','cover','art','asset']){
  const v=o[k];if(typeof v==='string'&&/^https?:\/\//i.test(v))return v;
  if(typeof v==='string'&&v.startsWith('//'))return 'https:'+v;}
 for(const k of Object.keys(o)){
  const v=o[k];if(!v)continue;
  if(typeof v==='string'&&/^https?:\/\//i.test(v)&&/\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(v))return v;
  if(typeof v==='object'){const r=firstImg(v);if(r)return r;}}
 return null}
const FNBR_TYPES=new Set(['outfit','pickaxe','emote','glider','wrap','backpack','music','loadingscreen','spray','pet','car','toy','banner','trail','booster']);
function fnbrImg(o){if(!o||typeof o!=='object')return null;
 const t=String(o.type||'').toLowerCase().trim();if(!FNBR_TYPES.has(t))return null;
 const id=String(o.id||'').trim();if(!id)return null;
 if(!/^[A-Za-z0-9_\-]+$/.test(id))return null;
 return'https://image.fnbr.co/'+t+'/'+encodeURIComponent(id)+'/icon.png'}
function toList(v,kind){if(!v)return[];const a=Array.isArray(v)?v:typeof v==='object'?Object.values(v):[];
 return a.map(o=>{if(typeof o==='string'||typeof o==='number'){const t=String(o);return{title:t,image:svgThumb(t,'')}}
 if(!o||typeof o!=='object')return null;
  const title=String(o.title||o.name||o.displayName||o.item_name||o.id||'Item');
  const rarity=o.rarity||o.tier||o.quality||o.rarityName;
  const img=firstImg(o)||fnbrImg(o);
  const hasRealImg=img||svgThumb(title,rarity);
  return{id:o.id!==undefined?String(o.id):undefined,title,image:hasRealImg}}).filter(Boolean)}
const DEAD=/sold|removed|deleted|canceled|unavailable|inactive|dead|off|gone|vendido|removido|indisponivel|inativo/i;
const unavailable=new Map();   // id -> expira
const isGone=id=>{const e=unavailable.get(id);if(e&&e>Date.now())return true;unavailable.delete(id);return false};
function normalize(game,raw){
 const it=raw&&raw.item?raw.item:raw||{},cf=F[game],c=CFG(),o={nums:{},text:{},lists:{}};
 for(const k in cf.nums){const v=pick(it,cf.nums[k]);if(v!==undefined)o.nums[k]=num(v,undefined)}
 for(const k in cf.text){const v=pick(it,cf.text[k]);if(v!==undefined)o.text[k]=String(v)}
 for(const k in cf.lists){o.lists[k]=toList(pick(it,cf.lists[k]),k);if(o.nums[k]===undefined&&o.lists[k].length)o.nums[k]=o.lists[k].length}
 const id=String(it.item_id||it.itemId||it.id||''),state=it.item_state||it.state;
 const val=k=>o.nums[k]!==undefined?o.nums[k]:o.text[k];
 const fmt=v=>typeof v==='number'?v.toLocaleString('pt-BR'):v;
 const price=num(it.price,0)*c.mult;
 let title;
 if(game==='fortnite'){
  const n=o.nums.skins||0;
  const vb=o.nums.vbucks||0;
  const pk=o.nums.pickaxes||0;
  const parts=[];
  parts.push(n>=1?n+' skin'+(n===1?'':'s'):'Sem skins');
  if(pk>=1)parts.push(pk+' picareta'+(pk===1?'':'s'));
  if(vb>=100)parts.push(vb.toLocaleString('pt-BR')+' V-Bucks');
  title='Conta Fortnite '+parts.join(' • ');
 }else if(game==='valorant'){
  const regRaw=String(o.text.region||it.region||'').trim();
  const regM=regRaw.match(/BR|Brazil|Brasil|NA|LATAM|LAN|LAT|LAS|EU|EUROPA|AP|KR|JP/i);
  const reg=(regM?regM[0]:'').toUpperCase().replace('BRAZIL','BR').replace('BRASIL','BR').replace('LATAM','LAN');
  const rankRaw=o.text.rank||it.rank||'';
  let rankClean=String(rankRaw).replace(/\s*[-•|–—].*$/,'').trim();
  if(/ranked|ready|pronta|ranqueada|classif|smurf|conta\s*pronta|unrated|sem\s*rank|no\s*rank/i.test(rankClean))rankClean='';
  const parts=['Conta Valorant'];
  if(reg)parts.push(reg);
  if(rankClean)parts.push('• '+rankClean);
  parts.push('• Ranked Ready');
  title=parts.join(' ').replace(/\s{2,}/g,' ');
 }
 const out={id,game,title:title||String(it.title||it.title_en||('Conta '+game+' #'+id)),price:Math.round(price*100)/100,currency:c.shown,state:state||null,
  available:!(state&&DEAD.test(String(state)))&&!isGone(id),publishedAt:it.published_date||null,
  tag:val(cf.tag)!==undefined?String(val(cf.tag)):null,image:`/api/image/${id}/${cf.mainImage}`,
  stats:cf.card.map(([l,k])=>({label:l,value:val(k)!==undefined?fmt(val(k)):'—'})),
  info:cf.info.filter(([,k])=>val(k)!==undefined).map(([l,k])=>({label:l,value:fmt(val(k))})),
  groups:Object.fromEntries(Object.keys(cf.lists).map(k=>[k,{count:o.nums[k]??o.lists[k].length,items:o.lists[k].slice(0,300),image:`/api/image/${id}/${cf.imageType[k]||cf.mainImage}`}]))};
 if(c.debug)out._raw=it;return out}
const detectGame=raw=>{const it=raw&&raw.item?raw.item:raw||{},ks=Object.keys(it).join(' ');return /fortnite/i.test(ks)?'fortnite':/valorant/i.test(ks)?'valorant':null};

/* ---------- API pública do módulo ---------- */
const P_MIN_DEFAULT=20,P_MAX_DEFAULT=999;
async function listAccounts(game,sp){
 const q=cleanParams(game,sp),c=CFG();q.push(['currency',c.cur]);if(game==='valorant')q.push(['riot_game[]','valorant']);else q.push(['epicgames_game[]','fortnite']);
 let pminF=P_MIN_DEFAULT,pmaxF=P_MAX_DEFAULT;                // valores FINAIS (já com mult) que queremos no site
 for(let k=q.length-1;k>=0;k--){          // tira pmin/pmax da lista (percorre de trás p/ frente; os índices não "andam")
  if(q[k][0]==='pmin'){pminF=num(q[k][1],P_MIN_DEFAULT);q.splice(k,1)}
  else if(q[k][0]==='pmax'){pmaxF=num(q[k][1],P_MAX_DEFAULT);q.splice(k,1)}}
 pminF=Math.max(P_MIN_DEFAULT,Math.min(P_MAX_DEFAULT,pminF));
 pmaxF=Math.max(P_MIN_DEFAULT,Math.min(P_MAX_DEFAULT,pmaxF));
 if(pminF>pmaxF){const t=pminF;pminF=pmaxF;pmaxF=t}
 const mult=c.mult>0?c.mult:1;
 q.push(['pmin',String(Math.round((pminF/mult)*100)/100)]);   // valor para a LZT = final / mult
 q.push(['pmax',String(Math.round((pmaxF/mult)*100)/100)]);
 const key='L|'+game+'|'+JSON.stringify(q);
 const d=await cached(key,c.ttlList,()=>schedule('search',3100,()=>call('/'+CAT[game],q)));
 const rawItems=(()=>{const v=d&&(d.items||(d.data&&d.data.items));return Array.isArray(v)?v:v&&typeof v==='object'?Object.values(v):[]})();
 const items=rawItems.map(i=>{try{return normalize(game,i)}catch(e){console.error('[LZT] erro no item',game,i&&(i.item_id||i.itemId||i.id||'?'),':',e.message);return null}}).filter(Boolean).filter(i=>i.id&&i.available&&i.price>=pminF-0.01&&i.price<=pmaxF+0.01);
 if(rawItems.length&&!items.length)console.error('[LZT] a lista veio com',rawItems.length,'itens mas todos foram descartados. Chaves do 1º item:',Object.keys(rawItems[0]).slice(0,25).join(','));
 if(!rawItems.length)console.error('[LZT] lista vazia. Chaves da resposta:',Object.keys(d||{}).join(','));
 return{items,page:d.page||1,perPage:d.perPage||items.length,totalItems:Math.min(d.totalItems||items.length,1000000),hasNextPage:!!d.hasNextPage,cachedAt:Date.now()};
}
async function getAccount(game,id){
 if(isGone(id))return null;
 try{
  const d=await cached('I|'+id,CFG().ttlItem,()=>schedule('item',700,()=>call('/'+id)));
  const dg=detectGame(d);if(dg&&dg!==game)return null;
  let a;try{a=normalize(game,d)}catch(e){console.error('[LZT] erro normalize em conta',id,':',e.message);return null}
  if(!a.available)unavailable.set(id,Date.now()+6e5);return a;
 }catch(e){if(e.status===404||e.status===403){unavailable.set(id,Date.now()+6e5);return null}throw e}
}
async function accountImage(id,type){
 const key='IMG|'+id+'|'+type;
 return cached(key,3600e3,()=>schedule('image',250,async()=>{
  const r=await call('/'+id+'/image',[['type',type]],true);const ct=r.headers.get('content-type')||'';
  if(/^image\//.test(ct))return{ct,buf:Buffer.from(await r.arrayBuffer())};
  const j=await r.json().catch(()=>null);const u=j&&(j.url||j.image||(j.data&&j.data.url));
  if(typeof u==='string'&&/^https:\/\//.test(u)){const ir=await fetch(u);if(ir.ok&&/^image\//.test(ir.headers.get('content-type')||''))return{ct:ir.headers.get('content-type'),buf:Buffer.from(await ir.arrayBuffer())}}
  if(j&&typeof j.base64==='string'){
    let b64=j.base64.trim();
    let ct='image/png';
    if(/^data:image\//.test(b64)){const m=b64.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);if(m){ct=m[1];b64=m[2]}}
    try{const buf=Buffer.from(b64,'base64');
     const mg=buf.slice(0,12).toString('hex');
     if(mg.startsWith('89504e47'))ct='image/png';
     else if(mg.startsWith('ffd8ff'))ct='image/jpeg';
     else if(mg.startsWith('47494638'))ct='image/gif';
     else if(mg.startsWith('52494646')&&mg.includes('57454250'))ct='image/webp';
     return{ct,buf}}catch(e){}
  }
  if(j&&typeof j.image==='string'&&/^data:image\//.test(j.image)){const m=j.image.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);if(m)return{ct:m[1],buf:Buffer.from(m[2],'base64')}}
  throw new LztError(404,'Imagem indisponível');}));
}
const searchParams=game=>cached('P|'+game,3600e3,()=>schedule('search',3100,()=>call('/'+CAT[game]+'/params')));
const rawItem=id=>schedule('item',700,()=>call('/'+id));
async function health(){
 return cached('HEALTH',30e3,async()=>{
  const out={tokenConfigured:!!process.env.LZT_TOKEN,primary:BASE(),fallback:ALT(),tests:[]};
  if(!out.tokenConfigured)return out;
  for(const game of ['fortnite','valorant']){
   const extra=game==='valorant'?[['riot_game[]','valorant']]:[['epicgames_game[]','fortnite']],t={game,path:'/'+CAT[game]};
   try{const d=await schedule('search',3100,()=>call(t.path,[['page','1'],['currency',CFG().cur],...extra]));
    const v=d&&(d.items||(d.data&&d.data.items)),arr=Array.isArray(v)?v:v&&typeof v==='object'?Object.values(v):[];
    Object.assign(t,{ok:true,rotaQueFunciona:route&&(route.base+route.prefix+t.path),items:arr.length,totalItems:d&&d.totalItems,keysDaResposta:Object.keys(d||{}),camposDoPrimeiroItem:arr[0]?Object.keys(arr[0]):[]})}
   catch(e){Object.assign(t,{ok:false,status:e.status,erro:e.message,tentativas:e.attempts})}
   out.tests.push(t)}
  return out})}
module.exports={health,listAccounts,getAccount,accountImage,searchParams,rawItem,LztError,CFG,PARAMS};
