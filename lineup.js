(() => {
 const section=document.querySelector('.lineup-scroll');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=n=>Math.max(0,Math.min(1,n));
 const words=[...section.querySelector('.lineup-nav').children].map((el,i)=>{
  const label=el.textContent.trim();el.setAttribute('aria-label',label);
  el.textContent='';const reserve=document.createElement('span');reserve.className='lineup-word-reserve';reserve.textContent=label;reserve.setAttribute('aria-hidden','true');
  const text=document.createElement('span');text.className='lineup-word-typed';text.setAttribute('aria-hidden','true');el.append(reserve,text);return {el,label,text,start:.32+i*.09};
 });
 const slogan=section.querySelector('.lineup-slogan');
 const sloganText=slogan.querySelector('span');
 function fitSlogan(){
  sloganText.style.fontSize='100px';
  const natural=sloganText.getBoundingClientRect().width;
  if(natural>0)sloganText.style.fontSize=`${100*slogan.clientWidth/natural}px`;
 }
 new ResizeObserver(fitSlogan).observe(slogan);
 document.fonts.ready.then(fitSlogan);fitSlogan();
 function render(){
  const p=clamp(-section.getBoundingClientRect().top/Math.max(1,section.offsetHeight-innerHeight))*1.5;
  section.style.setProperty('--logo-show',reduced.matches?1:clamp((p-.04)/.30));
  words.forEach(({el,label,text,start})=>{const progress=reduced.matches?1:clamp((p-start)/.07);const count=Math.floor(progress*label.length);text.textContent=label.slice(0,count);el.inert=count<label.length;});
  section.style.setProperty('--products-show',reduced.matches?1:clamp((p-.78)/.09));
  section.style.setProperty('--slogan-scan',`${-12+124*(reduced.matches?1:clamp((p-.99)/.30))}%`);
 }
 addEventListener('scroll',render,{passive:true});addEventListener('resize',render);reduced.addEventListener('change',render);render();
 const info={about:['BEAUTY, IN THE MAKING.','N[00]는 취향을 제품으로 완성하는 뷰티 펀딩 플랫폼입니다. 기획 중인 아이디어를 발견하고, 원하는 방향을 고르고, 첫 제작에 함께하세요.'],makers:['MEET THE MAKERS.','제품을 제안하는 메이커의 생각은 각 프로젝트의 메이커 노트에서 만나보세요. 어떤 뷰티를 만들고 싶은지, 당신의 의견을 더할 수 있어요.'],journal:['IDEAS TAKING SHAPE.','아이디어가 제품이 되어가는 과정. 참여한 프로젝트의 제작 소식은 MY PAGE에서 확인할 수 있어요. 현재는 전시용 가상 프로젝트로 구성되어 있습니다.']};
 const dialog=document.querySelector('#lineup-dialog');
 document.querySelectorAll('[data-lineup-info]').forEach(button=>button.addEventListener('click',()=>{const [title,copy]=info[button.dataset.lineupInfo];document.querySelector('#lineup-dialog-title').textContent=title;document.querySelector('#lineup-dialog-copy').textContent=copy;dialog.showModal();}));
 document.querySelector('#lineup-dialog-close').onclick=()=>dialog.close();
 const discover=()=>document.querySelector('#categories').scrollIntoView({behavior:reduced.matches?'instant':'smooth'});
 document.querySelector('#lineup-discover').onclick=()=>{dialog.close();discover();};
 section.querySelectorAll('a[href="#categories"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();discover();}));
})();
