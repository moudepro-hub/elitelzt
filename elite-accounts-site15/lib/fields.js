'use strict';
/*
 * Mapeamento dos campos que a LZT devolve -> campos do site.
 * A doc oficial não publica o schema da resposta, então cada campo aceita
 * VÁRIOS nomes candidatos + um regex de fallback. Para conferir os nomes reais:
 * LZT_DEBUG=1  e abra  /api/_debug/fortnite/ID_REAL  (mostra o JSON cru).
 * Se algum campo vier vazio, é só ajustar os nomes aqui.
 */
module.exports={
 fortnite:{
  nums:{
   level:[['epicgames_fortnite_level','fortnite_level','fortniteLevel'],/^epicgames_?fortnite.*level$|^fortnite.*level$/i],
   vbucks:[['epicgames_fortnite_balance','epicgames_balance','fortnite_balance','fortnite_vbucks','fortniteVbucks'],/vbuck|epicgames_?fortnite.*balance|fortnite.*balance/i],
   skins:[['epicgames_fortnite_skin_count','fortnite_skin_count','fortnite_skins_count','fortniteSkinCount'],/^epicgames_?fortnite.*skins?_?count$|^fortnite.*skins?_?count$/i],
   pickaxes:[['epicgames_fortnite_pickaxe_count','fortnite_pickaxe_count','fortnite_pickaxes_count','fortnitePickaxeCount'],/^epicgames_?fortnite.*pickaxes?_?count$|^fortnite.*pickaxes?_?count$/i],
   dances:[['epicgames_fortnite_dance_count','fortnite_dance_count','fortnite_dances_count','fortniteDanceCount'],/^epicgames_?fortnite.*(dances?|emotes?)_?count$|^fortnite.*(dances?|emotes?)_?count$/i],
   gliders:[['epicgames_fortnite_glider_count','fortnite_glider_count','fortnite_gliders_count','fortniteGliderCount'],/^epicgames_?fortnite.*gliders?_?count$|^fortnite.*gliders?_?count$/i]},
  text:{platform:[['epicgames_fortnite_platform','fortnite_platform','fortnitePlatform'],/^epicgames_?fortnite.*platform|^fortnite.*platform/i]},
  lists:{
   skins:[['fortniteSkins','epicgames_fortnite_skins','fortnite_skins'],/^fortniteSkins$|^epicgames_?fortnite_?skins$|^fortnite_?skins$/i],
   pickaxes:[['fortnitePickaxe','epicgames_fortnite_pickaxes','fortnite_pickaxes','fortnitePickaxes'],/^fortnitePickaxe$|^epicgames_?fortnite_?pickaxe|^fortnite_?pickaxe/i],
   dances:[['fortniteDance','epicgames_fortnite_dances','fortnite_dances','fortniteDances'],/^fortniteDance$|^epicgames_?fortnite_?(dance|emote)|^fortnite_?(dance|emote)/i],
   gliders:[['fortniteGliders','epicgames_fortnite_gliders','fortnite_gliders'],/^fortniteGliders$|^epicgames_?fortnite_?gliders$|^fortnite_?gliders$/i]},
  imageType:{skins:'skins',pickaxes:'pickaxes',dances:'dances',gliders:'gliders'},
  mainImage:'skins',
  card:[['Skins','skins'],['V-Bucks','vbucks'],['Picaretas','pickaxes']],
  info:[['Plataforma','platform'],['Nível','level'],['V-Bucks','vbucks'],['Skins','skins'],['Picaretas','pickaxes'],['Danças','dances'],['Asas-deltas','gliders']],
  tag:'platform'},
 valorant:{
  nums:{
   level:[['riot_valorant_level','valorant_level','valorantLevel'],/^(riot_)?valorant.*level$/i],
   inventory:[['riot_valorant_inventory_value','valorantInventory','valorant_inventory','valorantInventoryValue'],/^(riot_)?valorant_?inventory(_?value)?$/i],
   vp:[['riot_valorant_wallet_vp','valorantWalletVp','valorant_wallet_vp'],/^(riot_)?valorant.*wallet.*vp$/i],
   rp:[['riot_valorant_wallet_rp','valorantWalletRp','valorant_wallet_rp'],/^(riot_)?valorant.*wallet.*rp$/i],
   agents:[['riot_valorant_agent_count','valorantAgentCount','valorant_agent_count'],/^(riot_)?valorant.*agents?_?count$/i],
   skins:[['riot_valorant_skin_count','valorantSkinCount','valorant_skin_count'],/^(riot_)?valorant.*skins?_?count$/i],
   knives:[['riot_valorant_knife_count','valorantKnifeCount','valorant_knife_count'],/^(riot_)?valorant.*knif(e|ves)_?count$/i]},
  text:{
   region:[['valorantRegionPhrase','riot_valorant_region','valorant_region','valorantRegion'],/^(riot_)?valorant.*region/i],
   rank:[['valorantRankTitle','riot_valorant_rank','valorant_rank_title','valorantRank'],/^(riot_)?valorant.*rank.*(title|phrase|name)$/i]},
  lists:{
   skins:[['valorantWeaponSkins','valorant_weapon_skins','valorantSkins'],/^(riot_)?valorant.*(weapon)?skins$/i],
   agents:[['valorantAgents','valorant_agents','riot_valorant_agents'],/^(riot_)?valorant.*agents$/i],
   buddies:[['valorantBuddies','valorant_buddies','riot_valorant_buddies'],/^(riot_)?valorant.*buddies$/i]},
  imageType:{skins:'weapons',agents:'agents',buddies:'buddies'},
  mainImage:'weapons',
  card:[['Skins','skins'],['Agentes','agents'],['VP','vp']],
  info:[['Região','region'],['Rank','rank'],['Inventário (VP)','inventory'],['VP','vp'],['RP','rp'],['Nível','level'],['Agentes','agents'],['Skins','skins'],['Facas','knives']],
  tag:'rank'}
};
