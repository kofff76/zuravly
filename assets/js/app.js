(function(){
  const root=document.documentElement;
  const dot=document.querySelector('.cursor-dot');
  window.addEventListener('pointermove',e=>{
    root.style.setProperty('--mx',((e.clientX/window.innerWidth)-.5).toFixed(3));
    root.style.setProperty('--my',((e.clientY/window.innerHeight)-.5).toFixed(3));
    if(dot){dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px'}
  },{passive:true});

  const menu=document.getElementById('siteMenu');
  document.getElementById('menuOpen')?.addEventListener('click',()=>menu?.classList.add('is-open'));
  document.getElementById('menuClose')?.addEventListener('click',()=>menu?.classList.remove('is-open'));
  const search=document.getElementById('searchOverlay');
  document.getElementById('searchOpen')?.addEventListener('click',()=>search?.classList.add('is-open'));
  document.getElementById('searchClose')?.addEventListener('click',()=>search?.classList.remove('is-open'));
  window.addEventListener('keydown',e=>{if(e.key==='Escape'){menu?.classList.remove('is-open');search?.classList.remove('is-open')}});

  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-visible')}),{threshold:.10,rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  const basePath=location.pathname.includes('/collectives/')?'../':'';
  const regionNames=['Дагестан','Чеченская Республика','Ингушетия','Северная Осетия — Алания','Кабардино-Балкария','Карачаево-Черкесия','Адыгея','Ставропольский край'];
  const regionSlugs=['dagestan','chechnya','ingushetia','ossetia','kbr','kchr','adygea','stavropol'];
  const globalInput=document.getElementById('globalSearch'),globalResults=document.getElementById('globalResults');
  if(globalInput&&globalResults){
    let catalogCache=null;
    const drawResult=(href,text)=>{const a=document.createElement('a');a.href=href;a.textContent=text;globalResults.appendChild(a)};
    globalInput.addEventListener('input',()=>{
      const q=globalInput.value.trim().toLowerCase();globalResults.innerHTML='';if(q.length<2)return;
      regionNames.forEach((x,i)=>{if(x.toLowerCase().includes(q))drawResult(basePath+'region-'+regionSlugs[i]+'.html',x+' — атлас региона')});
      const renderCatalog=d=>(d.items||[]).filter(x=>((x.title||'')+' '+(x.city||'')+' '+(x.region||'')).toLowerCase().includes(q)).slice(0,8).forEach(x=>drawResult(basePath+'collectives/'+x.id+'.html',x.title+' — '+(x.city||'')));
      if(catalogCache){renderCatalog(catalogCache);return;}
      fetch(basePath+'assets/data/catalog.json').then(r=>r.json()).then(d=>{catalogCache=d;renderCatalog(d)}).catch(()=>{});
    });
  }

  const catalogFilter=document.getElementById('catalogFilter');
  const collectiveGrid=document.getElementById('collectiveGrid');
  if(catalogFilter&&collectiveGrid){
    const cards=[...collectiveGrid.querySelectorAll('.collective-card')];
    catalogFilter.addEventListener('input',()=>{
      const q=catalogFilter.value.trim().toLowerCase();
      cards.forEach(card=>{
        const hay=((card.dataset.title||'')+' '+(card.dataset.city||'')+' '+(card.dataset.region||'')+' '+card.textContent).toLowerCase();
        card.style.display=hay.includes(q)?'flex':'none';
      });
    });
  }

  function initAgenda(){
    const section=document.querySelector('#agenda');if(!section)return;
    const photos=[...section.querySelectorAll('.agenda-photo__img')],events=[...section.querySelectorAll('.agenda-event')];
    const set=i=>photos.forEach((p,n)=>p.classList.toggle('is-active',n===i));set(0);
    const obs=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting)set(Number(en.target.dataset.index||0))}),{threshold:.45,rootMargin:'-20% 0px -20% 0px'});
    events.forEach(e=>obs.observe(e));
  }
  initAgenda();

  if(window.gsap&&window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ignoreMobileResize:true});
    gsap.to('.topbar',{height:68,background:'rgba(247,245,239,.92)',boxShadow:'0 14px 50px rgba(8,43,85,.08)',scrollTrigger:{trigger:document.body,start:'120 top',end:'240 top',scrub:true}});

    const mm=gsap.matchMedia();
    mm.add('(min-width: 1081px)',()=>{
      function horizontal(trackSel, wrapSel, reverse){
        const track=document.querySelector(trackSel),wrap=document.querySelector(wrapSel);if(!track||!wrap)return;
        gsap.set(track,{clearProps:'transform'});
        const getDist=()=>Math.max(1,track.scrollWidth-window.innerWidth);
        if(reverse)gsap.set(track,{x:()=>-getDist()});
        const tween=gsap.to(track,{x:()=>reverse?0:-getDist(),ease:'none',scrollTrigger:{trigger:wrap,start:'top top',end:()=>'+='+getDist(),pin:true,pinSpacing:true,scrub:.75,anticipatePin:1,invalidateOnRefresh:true,onRefresh:self=>{if(reverse)gsap.set(track,{x:-getDist()})}}});
        return ()=>{tween.kill();ScrollTrigger.getAll().forEach(st=>{if(st.trigger===wrap)st.kill()});gsap.set(track,{clearProps:'transform'})};
      }
      horizontal('#atlasTrack','#atlasHorizontal',false);
      horizontal('#newsTrack','#newsHorizontal',true);
      horizontal('#catalogTrack','#catalogHorizontal',true);
      gsap.utils.toArray('.scroll-media img,.news-media img,.hero__image>img:first-child,.hero[style] .birds-layer').forEach(img=>{
        gsap.fromTo(img,{scale:1.08},{scale:1,ease:'none',scrollTrigger:{trigger:img,start:'top bottom',end:'bottom top',scrub:true}});
      });
    });

    window.addEventListener('load',()=>ScrollTrigger.refresh());
    setTimeout(()=>ScrollTrigger.refresh(),450);
  }
})();


// Final hover preview for atlas/catalog links
(function(){
  const links=[...document.querySelectorAll('[data-preview]')];
  if(!links.length) return;
  const box=document.createElement('div');
  box.className='hover-preview';
  box.innerHTML='<img alt="">';
  document.body.appendChild(box);
  const im=box.querySelector('img');
  links.forEach(a=>{
    a.addEventListener('mouseenter',()=>{im.src=a.getAttribute('data-preview');box.classList.add('is-visible');});
    a.addEventListener('mousemove',e=>{box.style.left=e.clientX+'px';box.style.top=e.clientY+'px';});
    a.addEventListener('mouseleave',()=>box.classList.remove('is-visible'));
  });
})();
