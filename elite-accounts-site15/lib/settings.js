'use strict';
/*
 * Lê as configurações da tabela public.site_settings do Supabase (chaves de API, links, preço...)
 * e as aplica em process.env. Valor preenchido no Supabase vence o .env; campo vazio volta ao .env.
 * Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente do servidor (a service_role NUNCA vai para o navegador).
 */
const KEYS=['LZT_TOKEN','LZT_API_BASE','CHECKOUT_URL','DISCORD_URL','PRICE_MULTIPLIER','PRICE_CURRENCY','LZT_SEARCH_CURRENCY','CACHE_LIST_TTL','CACHE_ITEM_TTL','CLIENT_REFRESH_SEC'];
const orig={};let timer=null,lastOk=0,lastErr=null;
async function load(){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return false;
 const r=await fetch(url.replace(/\/$/,'')+'/rest/v1/site_settings?select=key,value',{headers:{apikey:key,Authorization:'Bearer '+key},signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw new Error('Supabase respondeu '+r.status);
 const rows=await r.json();if(!Array.isArray(rows))throw new Error('Resposta inesperada do Supabase');
 const seen=new Set();
 for(const row of rows){const k=row.key;if(!KEYS.includes(k))continue;seen.add(k);
  if(!(k in orig))orig[k]=process.env[k];
  const v=typeof row.value==='string'?row.value.trim():'';
  if(v!=='')process.env[k]=v;else if(orig[k]===undefined)delete process.env[k];else process.env[k]=orig[k]}
 lastOk=Date.now();lastErr=null;return true;
}
async function init(){
 if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY){console.log('Supabase: SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não definidos — usando só o .env');return}
 try{await load();console.log('Supabase: configurações carregadas'+(process.env.LZT_TOKEN?'':' (LZT_TOKEN ainda vazio na tabela site_settings)'))}
 catch(e){lastErr=e.message;console.error('Supabase: falha ao carregar configurações —',e.message)}
 const every=(+process.env.SETTINGS_REFRESH_SEC||60)*1000;
 timer=setInterval(()=>load().catch(e=>{lastErr=e.message;console.error('Supabase: falha ao atualizar —',e.message)}),every);if(timer.unref)timer.unref();
}
const status=()=>({configured:!!(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY),loadedAt:lastOk?new Date(lastOk).toISOString():null,error:lastErr});
/* Leitura genérica no Supabase (REST) reaproveitando a mesma conexão/variáveis de ambiente. Uso: sbGet('tabela?select=...') */
async function sbGet(pathAndQuery){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw Object.assign(new Error('Supabase não configurado no servidor'),{status:503});
 const r=await fetch(url.replace(/\/$/,'')+'/rest/v1/'+pathAndQuery,{headers:{apikey:key,Authorization:'Bearer '+key},signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw Object.assign(new Error('Supabase respondeu '+r.status),{status:502});
 return r.json();
}
/* Serverless (Netlify): sem timers confiáveis. Chame antes de cada requisição; recarrega no máx. 1x por minuto (e não insiste a cada 15 s se falhar). */
let lastTry=0;
async function refreshIfStale(maxAgeMs){
 if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)return;
 const now=Date.now();if(now-lastOk<maxAgeMs||now-lastTry<15000)return;
 lastTry=now;try{await load()}catch(e){lastErr=e.message;console.error('Supabase: falha ao carregar configurações —',e.message)}
}
module.exports={init,load,status,sbGet,refreshIfStale};
