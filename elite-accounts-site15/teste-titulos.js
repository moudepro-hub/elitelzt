'use strict';
const http = require('http');
const get = path => new Promise((res, rej) => {
  http.get({host:'localhost',port:3000,path:encodeURI(path),headers:{Accept:'application/json'}}, r => {
    let d=''; r.on('data',c=>d+=c); r.on('end',()=>{try{res({status:r.statusCode,body:JSON.parse(d)})}catch(e){res({status:r.statusCode,raw:d.slice(0,300)})}});
  }).on('error',rej);
});
(async()=>{
  console.log('== 1. Títulos Fortnite ==');
  const f = await get('/api/accounts/fortnite?page=1');
  if (f.status!==200) { console.log('ERRO status', f.status, f.raw); process.exit(1); }
  (f.body.items||[]).slice(0,5).forEach(a => console.log(' •', a.title, '| preço', a.price));

  console.log('\n== 2. Títulos Valorant ==');
  const v = await get('/api/accounts/valorant?page=1');
  (v.body.items||[]).slice(0,5).forEach(a => console.log(' •', a.title, '| preço', a.price));

  console.log('\n== 3. Detalhe conta Fortnite (primeira id) => grupos com image SVG ==');
  const id1 = (f.body.items||[])[0].id;
  const d1 = await get('/api/accounts/fortnite/'+id1);
  for (const g of ['skins','pickaxes','dances','gliders']) {
    const gr = d1.body?.groups?.[g];
    const it = gr?.items?.[0];
    const img = it?.image || '';
    console.log('   ', g.padEnd(10), 'count=', String(gr?.count||0).padEnd(4), '| img ok:', img.startsWith('data:image/svg')?'✅ SVG '+img.length+' bytes' : img.startsWith('http')?'✅ URL':'❌ ('+(img.slice(0,60))+')');
  }

  console.log('\n== 4. Detalhe conta Valorant (primeira id) ==');
  const id2 = (v.body.items||[])[0].id;
  const d2 = await get('/api/accounts/valorant/'+id2);
  for (const g of ['skins','agents','buddies']) {
    const gr = d2.body?.groups?.[g];
    const it = gr?.items?.[0];
    const img = it?.image || '';
    console.log('   ', g.padEnd(10), 'count=', String(gr?.count||0).padEnd(4), '| img ok:', img.startsWith('data:image/svg')?'✅ SVG '+img.length+' bytes' : img.startsWith('http')?'✅ URL':'❌ ('+(img.slice(0,60))+')');
  }
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
