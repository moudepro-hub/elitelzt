'use strict';
/* Rotas /api/* — usadas tanto pelo servidor Node (server.js) quanto pela Netlify Function (netlify/functions/api.js). */
const settings=require('./settings'),lzt=require('./lzt'),featured=require('./featured');
const J=(status,obj,cc,cdn)=>({status,type:'application/json; charset=utf-8',body:JSON.stringify(obj),cc:cc||'no-store',cdn});
const CDN='public, s-maxage=30, stale-while-revalidate=60';
async function handle(p,sp){
 let m;
 if(p==='/api/health')return J(200,Object.assign({supabase:settings.status()},await lzt.health()));
 if(p==='/api/config')return J(200,{buyUrl:process.env.CHECKOUT_URL||process.env.DISCORD_URL||'#',discord:process.env.DISCORD_URL||'#',refreshSec:+process.env.CLIENT_REFRESH_SEC||60},'public, max-age=300');
 if(p==='/api/featured')return J(200,await featured.list(),'public, max-age=30',CDN);
 if((m=p.match(/^\/api\/accounts\/(fortnite|valorant)$/)))return J(200,await lzt.listAccounts(m[1],sp),'public, max-age=15',CDN);
 if((m=p.match(/^\/api\/accounts\/(fortnite|valorant)\/(\d{1,12})$/))){const a=await lzt.getAccount(m[1],m[2]);
  return a?J(200,a,'public, max-age=15',CDN):J(404,{error:'Conta indisponível',available:false})}
 if((m=p.match(/^\/api\/image\/(\d{1,12})\/(skins|pickaxes|dances|gliders|weapons|agents|buddies)$/))){const im=await lzt.accountImage(m[1],m[2]);
  return{status:200,type:im.ct,buf:im.buf,cc:'public, max-age=3600',cdn:'public, s-maxage=3600'}}
 if((m=p.match(/^\/api\/params\/(fortnite|valorant)$/)))return J(200,await lzt.searchParams(m[1]),'public, max-age=3600');
 if(process.env.LZT_DEBUG==='1'&&(m=p.match(/^\/api\/_debug\/(\d{1,12})$/)))return J(200,await lzt.rawItem(m[1]));
 if(p.startsWith('/api/'))return J(404,{error:'Rota inexistente'});
 return null;
}
const errorBody=e=>{const s=e.status||500;return{status:s,body:JSON.stringify({error:e.message||'Erro interno',retryAfter:e.retryAfter})}};
module.exports={handle,errorBody};
