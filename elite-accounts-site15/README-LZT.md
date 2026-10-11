# Integração LZT.market

Rodar: `cp .env.example .env` → preencher `SUPABASE_SERVICE_ROLE_KEY` → `node server.js` (Node 18+).

## Configurações no Supabase (projeto `elite-accounts`)
Tabela `public.site_settings` (RLS ligado, sem policies: só o servidor lê, via service_role). Edite em
Supabase > Table Editor > site_settings: `LZT_TOKEN`, `CHECKOUT_URL`, `DISCORD_URL`, `PRICE_MULTIPLIER`, `PRICE_CURRENCY`,
`LZT_SEARCH_CURRENCY`, `CACHE_LIST_TTL`, `CACHE_ITEM_TTL`, `CLIENT_REFRESH_SEC`.
O servidor relê a tabela a cada 60 s (`SETTINGS_REFRESH_SEC`), então mudanças valem sem reiniciar. Valor vazio = usa o `.env`.

## Endpoints da LZT usados (base https://prod-api.lzt.market (com fallback automático para api.lzt.market), `Authorization: Bearer TOKEN`)
| Uso | Endpoint |
|---|---|
| Listar Fortnite | `GET /fortnite` |
| Listar Valorant | `GET /riot` (+ `riot_game[]=valorant`) |
| Detalhe da conta | `GET /{item_id}` |
| Imagens | `GET /{item_id}/image?type=skins|pickaxes|dances|gliders|weapons|agents|buddies` |
| Valores aceitos nos filtros | `GET /{categoria}/params` (exposto em `/api/params/{game}`) |

## Filtro do site → parâmetro da LZT
**Fortnite:** preço→`pmin/pmax` · busca→`title` · última atividade→`daybreak` · skins/picaretas/emotes/asas (seletores)→`skin[]/pickaxe[]/dance[]/glider[]` ·
plataforma→`platform[]` · e-mail alterável→`change_email` · XBOX/PSN→`xbox_linkable/psn_linkable` · Passe→`bp` · nível do passe→`bp_lmin/bp_lmax` ·
skins/picaretas/danças/asas→`smin/smax`, `pickaxe_min/max`, `dmin/dmax`, `gmin/gmax` · V-Bucks→`vbmin/vbmax` · nível→`lmin/lmax` ·
custo em V-Bucks→`*_shop_vbmin/vbmax` · itens pagos→`*_shop_min/max` · **mín. de amigos: sem parâmetro na API (ignorado)**.

**Valorant:** preço→`pmin/pmax` · busca→`title` · skins→`valorant_smin/smax` · seletor de skins→`weaponSkin[]` · chaveiros→`buddy[]` · facas→`knife`, `valorant_knife_min/max` ·
agentes→`amin/amax` · rank→`rmin/rmax` (tier→faixa 3–27) · rank anterior→`previous_rmin/previous_rmax` · nível→`valorant_level_min/max` ·
VP→`vp_min/max` · inventário→`inv_min/inv_max` · RP→`rp_min/max` · agentes grátis→`fa_min/fa_max` · e-mail/telefone→`email`, `tel` · última atividade→`daybreak`.

Ordenação→`order_by` (`price_to_up`, `price_to_down`, `pdate_to_down`, `pdate_to_up`).

## Limites respeitados
Busca: 1 chamada a cada 3,1 s (doc: 20/min). `GET /{id}`: 1 a cada 0,7 s (bucket de 120/min). Cache de lista 60 s e de conta 90 s;
em 429 o servidor pausa e serve o cache. Contas que dão 404/403 ou saem de `active` somem das listas.

## Se algum campo da conta vier vazio
A doc não publica o schema da resposta. Ajuste os nomes em `lib/fields.js`. Para ver o JSON cru: `LZT_DEBUG=1` e abra `/api/_debug/{id}`.

## Correções da busca (conforme a doc oficial)
- Fortnite = `GET /epicgames` com `epicgames_game[]=fortnite` · Valorant = `GET /riot` com `riot_game[]=valorant`.
- O servidor descobre sozinho a rota que funciona (api.lzt.market ou prod-api.lzt.market, com ou sem `/market`) e memoriza; veja `rotaQueFunciona` em `/api/health`.
- Asas-deltas = `glider_min/glider_max` (`gmin/gmax` é nº de jogos) · Amigos = `friends_min/friends_max`.
- Corrigido o filtro de preço: com mínimo e máximo juntos, o servidor removia o parâmetro errado e enviava `pmax` duplicado.

## Publicar no Netlify (obrigatório para a API funcionar)
O Netlify só serve arquivos estáticos; a API roda como **Netlify Function** (`netlify/functions/api.js`, ligada por `netlify.toml`).
1. Publique **a pasta inteira** (não só `public/`) por **Git (GitHub/GitLab)** ou pela **Netlify CLI** (`npm i -g netlify-cli` → `netlify deploy --prod`).
   O "arrastar e soltar" (Netlify Drop) não compila nem publica funções.
2. Netlify > Site settings > Environment variables: crie `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (o token da LZT e o resto continuam na tabela `site_settings`).
3. Faça um novo deploy e teste `https://SEU-SITE.netlify.app/api/health`.
Estrutura: `public/` = site (único diretório publicado) · `lib/` e `netlify/` = backend (nunca publicados).
Rodar localmente (Node): `node server.js` (usa `public/` e o `.env`).
