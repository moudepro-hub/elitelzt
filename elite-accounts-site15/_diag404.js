const http=require('http');
function get(url,timeout=15000){return new Promise((res,rej)=>{
 const t=setTimeout(()=>rej(new Error('timeout '+url)),timeout);
 http.get(url,r=>{let b='';r.on('data',c=>b+=c);r.on('end',()=>{clearTimeout(t);res({status:r.statusCode,body:b.slice(0,2000)})}).on('error',e=>{clearTimeout(t);rej(e)})})})}
(async()=>{
 const tests=[
  '/api/health',
  '/api/accounts/fortnite?page=1',
  '/api/accounts/fortnite?page=1&pmin=20&pmax=999',
  '/api/accounts/valorant?page=1&pmin=20&pmax=999'
 ];
 for(const u of tests){
  const r=await get('http://localhost:3000'+u).catch(e=>({status:'ERR',body:e.message}));
  console.log(`\n[${r.status}] ${u}`);
  console.log('  body:',r.body.replace(/\s+/g,' ').slice(0,600));
 }
})();
