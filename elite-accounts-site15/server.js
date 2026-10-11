'use strict';
/* Servidor Node (sem dependências, Node 18+): site estático + API /api/* + páginas /fortnite/{id} e /valorant/{id}. */
const http=require('http'),fs=require('fs'),path=require('path');
try{fs.readFileSync(path.join(__dirname,'.env'),'utf8').split(/\r?\n/).forEach(l=>{const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);if(m&&process.env[m[1]]===undefined)process.env[m[1]]=m[2].replace(/^["']|["']$/g,'')})}catch(e){}
const settings=require('./lib/settings');
const lzt=require('./lib/lzt');
const api=require('./lib/api');
const ROOT=path.join(__dirname,'public'),PORT=+process.env.PORT||3000,GAMES=['fortnite','valorant'];
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2'};
const send=(res,code,body,headers={})=>{res.writeHead(code,Object.assign({'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'},headers));res.end(body)};
const json=(res,code,obj,cc)=>send(res,code,JSON.stringify(obj),{'Content-Type':'application/json; charset=utf-8','Cache-Control':cc||'no-store'});
const fail=(res,e)=>{const s=e.status||500;json(res,s,{error:e.message||'Erro interno',retryAfter:e.retryAfter},'no-store')};

/* subdomínios por jogo (opcional): fortnite.seudominio.com -> /fortnite/... */
function hostGame(req){if(process.env.GAME_SUBDOMAINS!=='1')return null;const h=(req.headers.host||'').split(':')[0].split('.');return h.length>2&&GAMES.includes(h[0])?h[0]:null}

function serveFile(res,file,req){
 fs.stat(file,(e,st)=>{
  if(e)return send(res,404,'Não encontrado',{'Content-Type':'text/plain; charset=utf-8'});
  if(st.isDirectory())return serveFile(res,path.join(file,'index.html'),req);
  const ext=path.extname(file).toLowerCase();if(!MIME[ext])return send(res,404,'Não encontrado');
  res.writeHead(200,{'Content-Type':MIME[ext],'Cache-Control':ext==='.html'?'no-cache':'public, max-age=3600','X-Content-Type-Options':'nosniff'});
  fs.createReadStream(file).pipe(res)});
}
function serveAccount(res,game,id){
 fs.readFile(path.join(ROOT,'account.html'),'utf8',(e,t)=>{if(e)return send(res,500,'account.html ausente');
  send(res,200,t.replace(/__GAME__/g,game).replace(/__ID__/g,id),{'Content-Type':MIME['.html'],'Cache-Control':'no-cache'})});
}

const server=http.createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,'http://x');let p=decodeURIComponent(u.pathname);
  const hg=hostGame(req);if(hg&&!p.startsWith('/api/')&&!/\.[a-z0-9]+$/i.test(p))p='/'+hg+(p==='/'?'/':p);
  if(req.method!=='GET'&&req.method!=='HEAD')return send(res,405,'Método não permitido');

  /* ---------- API ---------- */
  const r=await api.handle(p,u.searchParams);
  if(r)return send(res,r.status,r.buf||r.body,{'Content-Type':r.type,'Cache-Control':r.cc});
  let m;

  /* ---------- páginas dinâmicas por ID ---------- */
  if((m=p.match(/^\/(fortnite|valorant)\/(\d{1,12})\/?$/)))return serveAccount(res,m[1],m[2]);

  /* ---------- estáticos ---------- */
  if(/(^|\/)(lib|node_modules|\.git)(\/|$)|\/\.|server\.js|package(-lock)?\.json|\.md$|\.env/i.test(p))return send(res,404,'Não encontrado');
  const file=path.normalize(path.join(ROOT,p));if(!file.startsWith(ROOT))return send(res,403,'Proibido');
  if(GAMES.includes(p.replace(/\//g,''))&&!p.endsWith('/')){res.writeHead(301,{Location:p+'/'});return res.end()}
  serveFile(res,file,req);
 }catch(e){fail(res,e)}
});
/* carrega as configurações do Supabase (se configurado) antes de aceitar requisições */
settings.init().finally(()=>server.listen(PORT,()=>console.log('Elite Accounts em http://localhost:'+PORT+(process.env.LZT_TOKEN?'':'  (ATENÇÃO: LZT_TOKEN não definido)'))));

/* sincronização em segundo plano: mantém a 1ª página de cada jogo quente no cache */
const every=(+process.env.SYNC_INTERVAL_SEC||120)*1000;
if(every>0){const t=setInterval(()=>{if(process.env.LZT_TOKEN)GAMES.forEach(g=>lzt.listAccounts(g,new URLSearchParams()).catch(()=>{}))},every);if(t.unref)t.unref()}
