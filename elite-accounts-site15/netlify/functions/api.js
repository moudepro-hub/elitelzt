'use strict';
/* Netlify Function: atende /api/* (ver netlify.toml). Variáveis necessárias no painel do Netlify: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY. */
process.env.LZT_TIMEOUT_MS=process.env.LZT_TIMEOUT_MS||'8500';      // funções do Netlify têm ~10 s de limite
const api=require('../../lib/api'),settings=require('../../lib/settings');
exports.handler=async(event)=>{
 try{
  await settings.refreshIfStale(60000);
  const u=new URL(event.rawUrl);
  const r=await api.handle(u.pathname,u.searchParams);
  if(!r)return{statusCode:404,headers:{'Content-Type':'application/json'},body:'{"error":"Rota inexistente"}'};
  const h={'Content-Type':r.type,'Cache-Control':r.cc||'no-store','X-Content-Type-Options':'nosniff'};
  if(r.cdn)h['Netlify-CDN-Cache-Control']=r.cdn;
  return r.buf?{statusCode:r.status,headers:h,body:r.buf.toString('base64'),isBase64Encoded:true}:{statusCode:r.status,headers:h,body:r.body};
 }catch(e){
  const b=api.errorBody(e);
  return{statusCode:b.status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:b.body};
 }
};
