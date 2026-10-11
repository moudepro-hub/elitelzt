(function(){
  var root=document.documentElement,body=document.body,cur=document.querySelector('.cur'),ring=document.querySelector('.ring');
  var mx=innerWidth/2,my=innerHeight/3,rx=mx,ry=my,sx=mx,sy=my;
  addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;body.classList.add('on');
    var o=document.getElementById('orb');if(o){var r=o.getBoundingClientRect();o.style.transform='perspective(700px) rotateY('+((mx-(r.left+r.width/2))/60)+'deg) rotateX('+(-(my-(r.top+r.height/2))/60)+'deg)'}});
  document.addEventListener('mouseleave',function(){body.classList.remove('on')});
  document.querySelectorAll('a,.card').forEach(function(el){
    el.addEventListener('pointerenter',function(){ring.classList.add('big')});
    el.addEventListener('pointerleave',function(){ring.classList.remove('big')});
  });
  document.querySelectorAll('.card').forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--cx',(e.clientX-r.left)+'px');c.style.setProperty('--cy',(e.clientY-r.top)+'px')})});
  (function loop(){
    rx+=(mx-rx)*.16;ry+=(my-ry)*.16;sx+=(mx-sx)*.07;sy+=(my-sy)*.07;
    cur.style.transform='translate('+mx+'px,'+my+'px)';
    ring.style.transform='translate('+rx+'px,'+ry+'px)';
    root.style.setProperty('--mx',sx+'px');root.style.setProperty('--my',sy+'px');
    requestAnimationFrame(loop);
  })();
  var names=['Mateus S. comprou conta OG com 120 skins','Julia R. comprou 13.500 V-Bucks','Pedro L. comprou conta Renegade Raider','Ana C. comprou conta Black Knight','Lucas M. comprou 5.000 V-Bucks'],i=0,s=document.getElementById('sale');
  if(s)setInterval(function(){s.style.opacity=0;setTimeout(function(){i=(i+1)%names.length;s.textContent=names[i];s.style.opacity=1},400)},4500);
  /* animações de scroll */
  var plan=[['.live'],['.hero h1'],['.hero .bar'],['.hero p'],['.hero .cta'],['.hero .trust'],['#orb','f'],
    ['.nav','f'],['.ph .eye'],['.ph h1'],['.ph p'],['.fp'],['.acc','',1],['.stat','z',1],['.mq','f'],['.head'],['.cats .card','',1],['.prods .card','',1],
    ['.why .eye'],['.why h2'],['.row2','alt'],['.end .crown','z'],['.end h2'],['.end p'],['.end .cta']];
  var els=[];
  plan.forEach(function(p,n){
    var list=document.querySelectorAll(p[0]);
    list.forEach(function(el,k){
      el.classList.add('rv');
      if(p[1]==='alt')el.classList.add(k%2?'r':'l');else if(p[1])el.classList.add(p[1]);
      var d=p[2]?k*.12:(p[0].indexOf('.hero')===0||p[0]==='.live'||p[0]==='#orb'?n*.12:0);
      el.style.setProperty('--d',d+'s');
      els.push(el);
    });
  });
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting)return;io.unobserve(e.target);var el=e.target;
      requestAnimationFrame(function(){el.classList.add('in')});
      var wait=1300+parseFloat(el.style.getPropertyValue('--d'))*1000;
      setTimeout(function(){el.classList.remove('rv','in','l','r','z','f');el.style.removeProperty('--d')},wait);
    })},{threshold:.1,rootMargin:'0px 0px -6% 0px'});
    els.forEach(function(el){io.observe(el)});
  }else{els.forEach(function(el){el.classList.add('in')})}
  /* barra de progresso + parallax suave do fundo */
  var prog=document.createElement('div');prog.className='prog';body.appendChild(prog);
  var bg=document.querySelector('.bg'),tick=false;
  function onScroll(){if(tick)return;tick=true;requestAnimationFrame(function(){
    var h=root.scrollHeight-innerHeight,y=scrollY;
    prog.style.transform='scaleX('+(h>0?y/h:0)+')';
    bg.style.transform='translate3d(0,'+(-Math.min(y*.06,innerHeight*.25))+'px,0)';tick=false})}
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  addEventListener('scroll',function(){if(scrollY+innerHeight>=root.scrollHeight-40)els.forEach(function(el){el.classList.add('in')})},{passive:true});
  var t=['FORTNITE','V-BUCKS','CONTAS OG','SKINS RARAS','PASSE DE BATALHA','FULL ACESSO','ENTREGA AUTOMÁTICA','GARANTIA TOTAL'];
  var h=t.map(function(x){return x+'<i>✦</i>'}).join('');var mqe=document.getElementById('mq');if(mqe)mqe.innerHTML=h+h+h+h;
})();

if(location.protocol==='file:')document.querySelectorAll('a[href$="/"]').forEach(function(a){a.setAttribute('href',a.getAttribute('href')+'index.html')});
