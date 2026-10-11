'use strict';
const fs = require('fs'), path = require('path');
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/).forEach(l => {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
} catch (e) {}
const settings = require('./lib/settings');

settings.init().then(async () => {
  const token = process.env.LZT_TOKEN;
  const host = process.env.LZT_API_BASE || 'https://prod-api.lzt.market';

  const testar = async (rota, extra = []) => {
    const u = new URL(host + rota);
    extra.forEach(([k, v]) => u.searchParams.append(k, v));
    try {
      const r = await fetch(u, { headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' } });
      return await r.json();
    } catch (e) { return null; }
  };

  console.log('=== 1. Primeira conta Fortnite: campos dentro de fortniteSkins / fortnitePickaxe / etc. ===\n');
  const fn = await testar('/market/epicgames', [['page','1'],['currency','brl']]);
  const contaFn = fn && fn.items && fn.items.find(c => (c.fortniteSkins && c.fortniteSkins.length) || (c.fortnitePickaxe && c.fortnitePickaxe.length));
  if (contaFn) {
    for (const listField of ['fortniteSkins','fortnitePickaxe','fortniteDance','fortniteGliders']) {
      const arr = contaFn[listField];
      if (!arr || !arr.length) continue;
      console.log(listField + ': length=' + arr.length);
      const it = arr[0];
      console.log('  primeiro item typeof:', typeof it);
      if (typeof it === 'string') console.log('  valor:', it.slice(0, 100));
      else console.log('  chaves:', Object.keys(it).sort().join(', '), '\n  sample:', JSON.stringify(it).slice(0, 400));
    }
  } else console.log('Nenhuma conta Fortnite com listas (estranho)');

  console.log('\n=== 2. Primeira conta Valorant: valorantWeaponSkins / valorantAgents / valorantBuddies ===\n');
  const vl = await testar('/market/riot', [['page','1'],['currency','brl'],['riot_game[]','valorant']]);
  const contaVl = vl && vl.items && vl.items.find(c => (c.valorantWeaponSkins && c.valorantWeaponSkins.length) || (c.valorantAgents && c.valorantAgents.length));
  if (contaVl) {
    for (const listField of ['valorantWeaponSkins','valorantAgents','valorantBuddies','valorantKnives']) {
      const arr = contaVl[listField];
      if (!arr || !arr.length) continue;
      console.log(listField + ': length=' + arr.length);
      const it = arr[0];
      console.log('  primeiro item typeof:', typeof it);
      if (typeof it === 'string') console.log('  valor:', it.slice(0, 100));
      else console.log('  chaves:', Object.keys(it).sort().join(', '), '\n  sample:', JSON.stringify(it).slice(0, 400));
    }
  }

}).catch(e => console.error(e));
