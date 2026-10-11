/* Homepage: carrega as contas em destaque (/api/featured) e as exibe com o mesmo card das listas (LZT.card). */
(function(){
var box=document.getElementById('feat');if(!box||!window.LZT)return;
var ring=document.querySelector('.ring');
function msg(t){box.innerHTML='<div class="lzt-msg">'+LZT.esc(t)+'</div>'}
msg('Carregando destaques…');
LZT.get('/api/featured').then(function(d){
 var items=(d&&d.items)||[];
 if(!items.length){msg('Nenhuma conta em destaque no momento.');return}
 box.innerHTML=items.map(LZT.card).join('');
}).catch(function(){msg('Não foi possível carregar os destaques agora. Tente novamente em instantes.')});
/* cards criados depois do carregamento não recebem os efeitos de hover do app.js: replica aqui */
box.addEventListener('pointermove',function(e){var c=e.target.closest('.card');if(!c)return;var r=c.getBoundingClientRect();c.style.setProperty('--cx',(e.clientX-r.left)+'px');c.style.setProperty('--cy',(e.clientY-r.top)+'px')});
box.addEventListener('pointerover',function(e){if(ring&&e.target.closest('a,.card'))ring.classList.add('big')});
box.addEventListener('pointerout',function(e){if(ring&&!(e.relatedTarget&&e.relatedTarget.closest&&e.relatedTarget.closest('a,.card')))ring.classList.remove('big')});
})();
