'use strict';
/*
 * Contas em destaque: lê public.contas_destaque (cadastradas pela tela de admin) e resolve cada "codigo"
 * (ID da conta na LZT) numa conta normalizada, igual às das listas. O preço exibido é o definido no admin.
 */
const settings=require('./settings');
const lzt=require('./lzt');
const GAMES=['fortnite','valorant'];
const TTL=()=>(+process.env.FEATURED_TTL_SEC||60)*1e3;
const LIMIT=()=>Math.max(1,Math.min(24,+process.env.FEATURED_LIMIT||6));
let cache=null,inflight=null;

const idOf=c=>{const m=String(c==null?'':c).match(/\d{5,12}/);return m?m[0]:null};   // aceita só o ID ou um link que o contenha

/* o jogo não é guardado na tabela: testa os dois (a resposta da LZT fica em cache, então é 1 chamada só) */
async function resolve(id){
 for(const g of GAMES){const a=await lzt.getAccount(g,id);if(a)return a}
 return null;
}

async function build(){
 const rows=await settings.sbGet('contas_destaque?select=codigo,preco&ativo=eq.true&order=created_at.desc&limit='+(LIMIT()*3));
 if(!Array.isArray(rows))throw Object.assign(new Error('Resposta inesperada do Supabase'),{status:502});
 const seen=new Set(),items=[];let lastErr=null,tried=0;
 for(const row of rows){
  if(items.length>=LIMIT())break;
  const id=idOf(row.codigo);if(!id||seen.has(id))continue;seen.add(id);tried++;
  try{
   const a=await resolve(id);if(!a)continue;                       // vendida/indisponível: não aparece
   const p=Math.round(Number(row.preco)*100)/100;
   items.push(p>0?Object.assign({},a,{price:p,currency:'BRL'}):a);
  }catch(e){lastErr=e;console.error('[featured] conta',id,':',e.message)}
 }
 if(!items.length&&tried&&lastErr)throw lastErr;
 return{items};
}

async function list(){
 if(cache&&cache.exp>Date.now())return cache.v;
 if(inflight)return inflight;
 inflight=build().then(v=>{cache={v,exp:Date.now()+TTL()};return v})
  .catch(e=>{if(cache)return cache.v;throw e})                      // em caso de erro, mantém a última lista boa
  .finally(()=>{inflight=null});
 return inflight;
}
module.exports={list};
