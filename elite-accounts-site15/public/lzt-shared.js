/* helpers compartilhados: lista (filtros) e página da conta */
window.LZT={
 esc:s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
 price(n,cur){try{return new Intl.NumberFormat('pt-BR',{style:'currency',currency:cur||'BRL'}).format(n)}catch(e){return 'R$ '+n.toFixed(2)}},
 card(a){const E=LZT.esc;
  return '<article class="card acc"><a class="bn pv" href="/'+a.game+'/'+a.id+'"><img class="pvimg" src="'+E(a.image)+'" alt="" loading="lazy" onerror="this.remove()"><img class="gi2" src="/img/'+a.game+'.webp" alt="">'+(a.tag?'<span>'+E(a.tag)+'</span>':'')+'</a>'
  +'<div class="bd"><h3>'+E(a.title)+'</h3><div class="st">'+a.stats.map(s=>'<div><b>'+E(s.value)+'</b><small>'+E(s.label)+'</small></div>').join('')+'</div>'
  +'<div class="row"><span class="price">'+LZT.price(a.price,a.currency)+'</span><a class="buy" href="/'+a.game+'/'+a.id+'">Ver conta</a></div></div></article>'},
 get:async url=>{const r=await fetch(url,{headers:{Accept:'application/json'}});let j=null;try{j=await r.json()}catch(e){}
  if(!r.ok){const e=new Error((j&&j.error)||'Erro '+r.status);e.status=r.status;throw e}return j}
};
