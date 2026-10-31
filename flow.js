(async()=>{
'use strict';
await N00ProjectStudio.ready;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],won=n=>Math.round(n).toLocaleString('ko-KR')+'원';
const products=[
{id:'blue',category:'tone',title:'블루 치트키\n톤 스틱',intro:'붉은 기를 가볍게 덜어내고, 본연의 피부에 새로운 균형을 더합니다.',detail:'작은 컬러 변화가 만드는 새로운 인상. 피부 위에 얇게 밀착되는 톤 보정 스틱을 실험합니다. 옵션은 제형 컬러이며, 발색과 기획 내용은 최종 에셋으로 교체될 예정입니다. 전시용 가상 프로젝트입니다.',price:12600,options:[['01 / BLUE','#adc4ec'],['02 / MINT','#bcd5c5']],caption:'A DIFFERENT\nKIND OF BLUE.',tag:'TONE / NUMBER 01',tint:'#e9eef5',crop:2},
{id:'rose',category:'gloss',title:'글로우 레이어\n립 글로스',intro:'한 겹의 빛으로 달라지는 표정. 투명한 광택에 나만의 색을 겹쳐보세요.',detail:'색보다 먼저 빛을 느끼는 글로스. 투명한 베이스에 미세한 컬러를 더해, 여러 번 겹쳐도 가볍게 표현하는 제품을 기획했습니다. 패키지와 발색은 시연용이며 최종 제품을 의미하지 않습니다.',price:15000,options:[['01 / ROSE','#df9aa9'],['02 / CLEAR','#ece4dc']],caption:'JUST ONE\nMORE LAYER.',tag:'GLOSS / NUMBER 02',tint:'#f3e8e9',crop:0},
{id:'amber',category:'scent',title:'언네임드 모먼트\n퍼퓸 스틱',intro:'이름 붙이기 어려운 순간을 향으로. 피부 가까이 남는 작은 잔상을 발견하세요.',detail:'휴대하기 쉬운 고체 향의 가능성을 탐색합니다. 차분한 우디 노트와 부드러운 머스크, 서로 다른 두 인상 중 지금 끌리는 향을 골라보세요. 향 설명과 가격은 전시 체험을 위한 예시입니다.',price:22000,options:[['01 / AMBER','#c6a079'],['02 / MUSK','#d5cabb']],caption:'LEAVE\nA TRACE.',tag:'SCENT / NUMBER 03',tint:'#eee9df',crop:1},
{id:'balm',category:'care',title:'클로즈 투 유\n멀티 밤',intro:'가까이 닿는 순간까지 생각한, 매일의 보습.',detail:'입술과 건조한 피부에 얇게 펴 바르는 보습 멀티 밤을 기획합니다. 반려동물과의 일상적인 접촉을 고려해 성분과 사용 조건을 검토할 예정이며, 섭취·핥음 안전성이 확인된 제품은 아닙니다. 최종 처방·용량·구성은 검증 후 공개합니다.',price:18000,defaultAmount:18000,art:'assets/lickable/05.jpg',pendingVideo:false,options:[['최종 확정 용기의 멀티 밤','#eee9df']],caption:'CLOSE TO YOU.',tag:'CARE / NUMBER 04',tint:'#f7f7f5',crop:0,rewards:[{min:1000,title:'기획 응원',description:'출시 우선 구매권 + 출시 할인권'},{min:18000,title:'본품',description:'멀티 밤 1개 + 출시 혜택'},{min:32000,title:'펀딩 한정 세트',description:'멀티 밤 1개 + 한정 굿즈 1개 + 출시 혜택'}]}
];
products.push(...N00ProjectStudio.publishedProducts());
products.filter(p=>p.userProject).forEach(p=>N00Funding.projects[p.id]=p);
products.forEach(p=>Object.assign(p,N00Funding.projects[p.id]));
const key='n00_exhibition_v2';let state={nickname:'',budget:1000000,records:[],picks:[]},storageOK=true;
try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&typeof saved.nickname==='string'&&Number.isFinite(saved.budget)&&saved.budget>=0&&Array.isArray(saved.records)&&Array.isArray(saved.picks)){state={nickname:saved.nickname.slice(0,20),budget:saved.budget,records:saved.records.filter(r=>r&&products.some(p=>p.id===r.product)&&Number.isFinite(r.amount)&&r.amount>0&&Number.isInteger(r.qty)&&r.qty>0&&typeof r.option==='string'),drafts:saved.drafts||{},makers:Array.isArray(saved.makers)?saved.makers:[],picks:saved.picks.filter(id=>products.some(p=>p.id===id))}}}catch{storageOK=false}
let category='all',list=products,index=0,option=0,qty=1,media=0,pending=null,submitting=false,view='journey',paused=false;
let contribution=15000,reward=1,goods='미니 케이스',outcomeRecord=null;
let feedMoving=false;
let participating=false,makerNoteSeen=false;
const socialKey='n00_social_v1';
let social={likes:[],following:false,comments:[]};
try{const saved=JSON.parse(localStorage.getItem(socialKey)||'null');if(saved)social={likes:Array.isArray(saved.likes)?saved.likes.filter(id=>products.some(p=>p.id===id)):[],following:saved.following===true,comments:Array.isArray(saved.comments)?saved.comments.filter(c=>c&&products.some(p=>p.id===c.product)&&typeof c.text==='string').map(c=>({product:c.product,text:c.text.slice(0,500)})):[]}}catch{}
const profileKey='n00_profiles_v1';let profiles=[];
try{const cached=JSON.parse(localStorage.getItem(profileKey)||'[]');if(Array.isArray(cached))profiles=cached.filter(p=>p&&typeof p.name==='string'&&p.state&&Array.isArray(p.state.records)&&Array.isArray(p.state.picks)&&p.social&&Array.isArray(p.social.likes)&&Array.isArray(p.social.comments))}catch{}
function archiveProfile(){if(!state.nickname)return;const entry={name:state.nickname,state:JSON.parse(JSON.stringify(state)),social:JSON.parse(JSON.stringify(social)),votes:{...votes}};const i=profiles.findIndex(p=>p.name===state.nickname);if(i<0)profiles.push(entry);else profiles[i]=entry;try{localStorage.setItem(profileKey,JSON.stringify(profiles))}catch{storageOK=false}}
function restoreProfile(name){const existing=profiles.find(p=>p.name===name);if(existing){state=JSON.parse(JSON.stringify(existing.state));social=JSON.parse(JSON.stringify(existing.social));votes={...existing.votes}}else{state.nickname=name}save();saveSocial();try{localStorage.setItem(voteKey,JSON.stringify(votes))}catch{}wallet();if(view==='result')renderResult();if(view==='feed'){renderSocial();updatePurchase()}}
function likeCount(id){return profiles.filter(p=>p.name!==state.nickname&&p.social.likes.includes(id)).length+(social.likes.includes(id)?1:0)}
function saveSocial(){archiveProfile();try{localStorage.setItem(socialKey,JSON.stringify(social))}catch{}}
function resetSocial(){social={likes:[],following:false,comments:[]};saveSocial()}
function setShortformMenu(open){$('#experience').classList.toggle('menu-open',open);$('#shortform-menu').setAttribute('aria-expanded',String(open));$('#shortform-menu').textContent=open?'× 닫기':'☰ 메뉴';}
$('#shortform-menu').onclick=()=>setShortformMenu(!$('#experience').classList.contains('menu-open'));
$('#experience').addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#experience').classList.contains('menu-open')){setShortformMenu(false);$('#shortform-menu').focus();}});
function setParticipation(open){setShortformMenu(false);participating=open;$('#feed-view').classList.toggle('participating',open);$('#feed-planning').hidden=!open;$('#feed-purchase').hidden=!open;$('#close-participation').setAttribute('aria-pressed',String(!open));$('#funding-mode').setAttribute('aria-pressed',String(open));$('#funding-panel').hidden=!open;$('#open-participation').setAttribute('aria-expanded',String(open));}
function renderSocial(){const p=product();$('#shortform-title').textContent=p.title.replace('\n',' ');$('#social-like').setAttribute('aria-pressed',String(social.likes.includes(p.id)));$('#social-like-label').textContent='좋아요 '+likeCount(p.id);$('#social-follow').setAttribute('aria-pressed',String(social.following));$('#follow-state-icon').setAttribute('d',social.following?'M15 18l3 3 5-7':'M19 14v8M15 18h8');$('#social-follow-label').textContent=social.following?'팔로잉':'팔로우';const count=social.comments.filter(c=>c.product===p.id).length;$('#social-comment-label').textContent=count?'의견 '+count:'의견 남기기'}
function renderComments(){const p=product();$('#comments-product').textContent=p.title.replace('\n',' ');const list=$('#comments-list');list.replaceChildren();const items=social.comments.filter(c=>c.product===p.id);if(!items.length){const empty=document.createElement('p');empty.textContent='첫 의견을 남겨보세요.';list.append(empty)}items.forEach(c=>{const row=document.createElement('p');row.className='comment-entry';row.textContent=c.text;list.append(row)})}
$('#open-participation').onclick=()=>{setParticipation(true);$('#funding-mode').focus({preventScroll:true});$('#experience').scrollTop=0};
$('#funding-mode').onclick=()=>{setParticipation(true);$('#experience').scrollTop=0};
$('#close-participation').onclick=()=>{setParticipation(false);$('#shortform-menu').focus({preventScroll:true});$('#experience').scrollTop=0};
$('#social-like').onclick=()=>identity(()=>{const id=product().id;social.likes=social.likes.includes(id)?social.likes.filter(x=>x!==id):[...social.likes,id];saveSocial();renderSocial()});
$('#social-follow').onclick=()=>identity(()=>{social.following=!social.following;saveSocial();renderSocial()});
$('#social-note').onclick=()=>openMakerNote();
$('#social-comment').onclick=()=>{renderComments();$('#comment-input').value='';$('#comments-dialog').showModal();$('#comment-input').focus()};
$('#close-comments').onclick=()=>{$('#comments-dialog').close();$('#social-comment').focus({preventScroll:true})};
$('#comment-form').onsubmit=e=>{e.preventDefault();const text=$('#comment-input').value.trim().slice(0,500);if(!text)return;const id=product().id;$('#comments-dialog').close();identity(()=>{social.comments.push({product:id,text});saveSocial();$('#comment-input').value='';renderComments();renderSocial();$('#comments-dialog').showModal()})};
const product=()=>list[index];function save(){archiveProfile();try{localStorage.setItem(key,JSON.stringify(state))}catch{storageOK=false}}
function wallet(){$('#account-nav').textContent=state.nickname||'MY PAGE';$('#wallet').textContent='체험 예산 '+won(state.budget)}
function show(next){view=next;if(next!=='feed')$('#gloss-reel').pause();$('#experience').classList.toggle('contact-open',next==='contact');$('#journey').hidden=next!=='journey';$('#experience').hidden=next==='journey';document.body.classList.toggle('app-open',next!=='journey');$('#skip-intro').hidden=next!=='journey';['feed','result','home','contact'].forEach(v=>$('#'+v+'-view').hidden=v!==next);if(next!=='journey')$('#experience').scrollTop=0;wallet();if(next==='result')renderResult();if(next==='feed'){setParticipation(false);renderFeed();if(!entering)showWelcomeNote()}}
function categories(){show('journey');requestAnimationFrame(()=>$('#categories').scrollIntoView({behavior:'instant'}))}
function openFeed(cat='all'){closeCuriosity();category=cat;list=cat==='all'?products:products.filter(p=>p.category===cat);index=0;option=0;qty=1;contribution=15000;reward=1;goods='미니 케이스';media=0;loadDraft();closeOptionFolds();show('feed');if(!$('#maker-note-dialog').open)$('#media-stage').focus({preventScroll:true})}
function navigate(direction){if(view!=='feed'||feedMoving||$('dialog[open]'))return;const next=index+direction;if(next<0||next>=list.length){$('#feed-feedback').textContent=list.length===1?'이 카테고리의 마지막 제품이에요. 다른 카테고리도 둘러보세요.':direction>0?'마지막 발견이에요. 카테고리에서 더 둘러보세요.':'첫 번째 제품이에요.';return}const stage=$('#media-stage'),motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;let outgoing;if(motion){outgoing=stage.cloneNode(true);outgoing.removeAttribute('id');outgoing.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));outgoing.setAttribute('aria-hidden','true');outgoing.inert=true;Object.assign(outgoing.style,{position:'absolute',inset:'0',width:'100%',height:stage.getBoundingClientRect().height+'px',margin:'0',pointerEvents:'none',zIndex:'3'});stage.parentElement.append(outgoing);feedMoving=true;}index=next;option=0;qty=1;contribution=15000;reward=1;goods='미니 케이스';media=0;loadDraft();closeOptionFolds();closeCuriosity();renderFeed();if(motion){const options={duration:680,easing:'cubic-bezier(.22,.68,.16,1)',fill:'both'};const a=outgoing.animate([{transform:'translateY(0)'},{transform:'translateY('+(-direction*104)+'%)'}],options);const b=stage.animate([{transform:'translateY('+(direction*104)+'%)'},{transform:'translateY(0)'}],options);Promise.allSettled([a.finished,b.finished]).then(()=>{outgoing.remove();a.cancel();b.cancel();feedMoving=false})}}
function renderReelFunding(){
 const p=product(),stats=N00Funding.totals(p.id,state,profiles),timing=N00Funding.timing(p.id),rate=stats.rate.toFixed(1).replace(/\.0$/,'');
 $('#reel-fund-rate').textContent=rate+'%';$('#reel-fund-rate').setAttribute('aria-label','체험 펀딩 '+rate+'% 달성');
 $('#reel-fund-deadline').textContent=timing.badge;$('#reel-fund-deadline').setAttribute('aria-label',timing.description);
 $('.deadline strong').textContent=timing.badge;$('.deadline span').textContent=timing.description;
 $('#fund-rate').textContent=rate;$('#fund-total').textContent=won(stats.total);$('#fund-goal').textContent=won(p.goal);$('#fund-people').textContent=stats.people+'명';$('#fund-meter-bar').style.width=Math.min(stats.rate,100)+'%';
}
setInterval(()=>{if(view==='feed')renderReelFunding()},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&view==='feed')renderReelFunding()});
function renderFeed(){renderReelFunding();const p=product();const live=$('.funding-live');if(live){live.replaceChildren(node('i',''),document.createTextNode(p.pendingVideo?'기획 공개 · 전시용 초안':'펀딩 진행 중'));}$('#filter-label').textContent=({all:'전체',tone:'톤',gloss:'글로스',scent:'향'})[category];$('#feed-counter').textContent=String(index+1).padStart(2,'0')+' — '+String(list.length).padStart(2,'0');$('#product-title').textContent=p.title.replace('\n',' ');$('#product-intro').textContent=({blue:'한 번의 터치로, 피부 톤에 새로운 균형.',rose:'한 겹의 빛으로 달라지는 표정.',amber:'피부 가까이 남는, 이름 없는 잔상.',balm:'가까이 닿는 순간까지 생각한, 매일의 보습.'})[p.id]||p.intro;$('#option-list').replaceChildren();p.options.forEach(([label,color],i)=>{const el=document.createElement('label');el.className='option';const input=document.createElement('input');input.type='radio';input.name='product-option';input.value=String(i);input.checked=i===option;input.onchange=()=>{option=i;updatePurchase();storeDraft()};const swatch=document.createElement('span');swatch.className='swatch';swatch.style.setProperty('--swatch',color);el.append(input,swatch,document.createTextNode(label));$('#option-list').append(el)});$('#media-stage').style.setProperty('--tint',p.tint);$('#media-stage').style.setProperty('--face-offset',-(p.crop/3)*100+'%');$('#media-product').src=p.art||'assets/product-'+p.id+'.svg';$('#media-face-img').alt=p.category+' 메이크업 임시 이미지';$('#media-caption').innerText=p.caption;$('#prev-product').disabled=index===0;$('#next-product').disabled=index===list.length-1;$('#feed-feedback').textContent='';if(!feedMoving&&!matchMedia('(prefers-reduced-motion: reduce)').matches)$('#media-stage').animate([{opacity:.35},{opacity:1}],{duration:400});renderMedia();updatePurchase();renderSocial();if($('#participant-tastes').open)renderParticipantTastes()} 
const baseRewards=[{min:1000,title:'출시 혜택',description:'우선 구매권 + 출시 할인권'},{min:15000,title:'본품',description:'본품 1개 + 출시 혜택'},{min:30000,title:'펀딩 한정 세트',description:'본품 1개 + 한정 굿즈 1개 + 출시 혜택'}];
const currentRewards=()=>product().rewards||baseRewards;
function validAmount(){return Number.isSafeInteger(contribution)&&contribution>=1000&&contribution%100===0&&contribution<=state.budget}
function rewardLabel(){if(product().userProject)return currentRewards()[reward].title+' / '+currentRewards()[reward].description;return currentRewards()[reward].title+(reward>0?' / '+product().options[option][0]:'')+(reward===2?' / '+goods:'')}
let shareValue=0,shareAnimation=0;
function updateShare(target){
 const token=++shareAnimation,from=shareValue;
 const paint=n=>{shareValue=n;$('#contribution-share').textContent='목표의 '+n.toFixed(2)+'%';};
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){paint(target);return}
 let started;
 function frame(time){if(token!==shareAnimation)return;if(started===undefined)started=time;const t=Math.min(1,(time-started)/320);paint(from+(target-from)*(1-Math.pow(1-t,3)));if(t<1)requestAnimationFrame(frame)}
 requestAnimationFrame(frame);
}
function closeOptionFolds(){ $('#reward-fold').open=false;$('#physical-options').open=false; }
$('#reward-fold').addEventListener('toggle',()=>{if($('#reward-fold').open)$('#physical-options').open=false});
$('#physical-options').addEventListener('toggle',()=>{if($('#physical-options').open)$('#reward-fold').open=false});
function updatePurchase(){
 const valid=validAmount();const presetAmounts=product().userProject?currentRewards().map(r=>r.min):product().id==='balm'?[1000,18000,32000]:[5000,15000,30000];$$('[data-amount]').forEach((b,i)=>{b.dataset.amount=String(presetAmounts[i]);b.textContent=won(presetAmounts[i]);});
 if(!Number.isFinite(contribution)||contribution<currentRewards()[reward].min)reward=0;
 if(document.activeElement!==$('#contribution-amount'))$('#contribution-amount').value=Number.isFinite(contribution)?String(contribution):'';
 $('#amount-error').textContent=valid?'':contribution>state.budget?'체험 예산을 초과했어요.':'1,000원 이상, 100원 단위로 입력해 주세요.';
 updateShare(Number.isFinite(contribution)&&contribution>=0?contribution/product().goal*100:0);
 $('#contribution-bar').style.width=valid?Math.min(100,contribution/product().goal*100)+'%':'0%';
 $('#fund-button').disabled=!valid;$('#fund-button').firstChild.textContent=tasteDecided?'참여 확정하기 ':'함께 만들기 ';
 $('#reward-choices').replaceChildren();currentRewards().forEach((r,i)=>{const b=document.createElement('button');b.type='button';b.disabled=!valid||contribution<r.min;b.setAttribute('aria-pressed',String(reward===i));const h=document.createElement('strong'),d=document.createElement('span'),m=document.createElement('small');h.textContent=r.title;d.textContent=r.description;m.textContent=won(r.min)+'부터'+(b.disabled?' · 아직 선택할 수 없어요':'');b.append(h,d,m);b.onclick=()=>{reward=i;updatePurchase();storeDraft();$('#reward-fold').open=false;$('#reward-fold summary').focus()};$('#reward-choices').append(b)});
 $('#reward-summary').textContent=currentRewards()[reward].title;$('#option-summary').textContent=product().options[option][0]+(reward===2&&!product().userProject?' · '+goods:'');$('#physical-options').hidden=reward===0;$('#limited-options').hidden=reward!==2||!!product().userProject;$('#limited-choice').value=goods;
}
$('#contribution-amount').oninput=()=>{contribution=Number($('#contribution-amount').value);updatePurchase();storeDraft()};
$$('[data-amount]').forEach(b=>b.onclick=()=>{contribution=Number(b.dataset.amount);updatePurchase();storeDraft()});
$('#limited-choice').onchange=()=>{goods=$('#limited-choice').value;updatePurchase();storeDraft()};
function syncReelPlayback(){const video=$('#gloss-reel');if(view==='feed'&&(['blue','rose','amber','balm'].includes(product().id)||product().videoUrl)&&!paused&&!document.hidden&&!$('dialog[open]'))video.play().catch(()=>{});else video.pause()}
function renderMedia(){
 const p=product(),reel=['blue','rose','amber','balm'].includes(p.id)||!!p.videoUrl,stage=$('#media-stage'),video=$('#gloss-reel');
 stage.classList.toggle('pending-video',!!p.pendingVideo);stage.classList.toggle('video-mode',reel);stage.closest('.media-column').dataset.contentFormat=reel||p.pendingVideo?'reel':'carousel';stage.classList.toggle('product-mode',!reel&&media===1);
 if(reel){const src=p.videoUrl||'assets/shortform/'+({blue:'tone-reel.mp4',rose:'gloss-reel.mp4',amber:'unnamed-perfume.mp4',balm:'close-to-you-reel.mp4'}[p.id]);if(video.getAttribute('src')!==src){video.pause();video.src=src;video.load()}video.setAttribute('aria-label',p.title.replace('\n',' ')+' 숏폼 영상')}
 video.hidden=!reel;stage.querySelector('.media-face').hidden=reel;$('#media-product').hidden=reel;stage.querySelector('.media-bottom').hidden=reel||!!p.pendingVideo;$('#motion-toggle').hidden=!!p.pendingVideo;stage.querySelector('.media-face').hidden=reel||!!p.pendingVideo;if(p.pendingVideo){$('#media-product').hidden=false;}
 let pending=stage.querySelector('.pending-video-label');if(!pending){pending=node('span','pending-video-label');stage.append(pending);}pending.hidden=!p.pendingVideo;pending.textContent=p.userProject?'PROJECT / 대표 이미지':'기획 공개 · 숏폼 준비 중';
 if(!reel)video.currentTime=0;
 $('#motion-toggle').textContent=paused?'▷':'Ⅱ';$('#motion-toggle').setAttribute('aria-label',paused?'콘텐츠 재생':'콘텐츠 일시정지');
 $$('[data-media]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.media)===media)));syncReelPlayback()
}
document.addEventListener('visibilitychange',syncReelPlayback);
new MutationObserver(syncReelPlayback).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
function identity(action){if(state.nickname){action();return}pending=action;$('#nickname-error').textContent='';$('#nickname-input').value='';$('#restore-existing').checked=false;$('#nickname-dialog').showModal();$('#nickname-input').focus()}
const tasteAxes={balm:[['원하는 보습감은?',['얇고 가볍게','도톰하게 감싸기']],['어떤 마무리가 좋나요?',['은은한 윤기','촉촉한 광택']],['휴대 방식은?',['손으로 덜어 쓰는 틴','바로 바르는 스틱']]],blue:[['마무리감은?',['보송 블러','촉촉 윤광']],['어떤 톤을 정돈할까요?',['붉은 기 차분하게','노란 기 맑게']],['스틱 모양은?',['콕콕 바르는 슬림형','쓱쓱 바르는 와이드형']]],rose:[['어떤 광택?',['맑은 유리알광','반짝이는 펄광']],['발색은 어느 정도?',['은은한 한 겹','존재감 있는 발색']],['입술 위 느낌은?',['가볍게 밀착','도톰하게 탱글']]],amber:[['첫 향의 느낌은?',['산뜻하고 시원하게','포근하고 따뜻하게']],['중심이 되는 향은?',['차분한 우디향','살냄새 같은 머스크']],['향이 남는 방식은?',['가까이서 은은하게','스칠 때 잔향 있게']]]};
let tasteStep=0,tasteChoices=[null,null,null],tasteConcept=null,tasteDecided=false,viewingRecord=false;
function storeDraft(){state.drafts=state.drafts||{};state.drafts[product().id]={amount:contribution,option,goods,reward,step:tasteStep,choices:[...tasteChoices],concept:tasteConcept,decided:tasteDecided};save()}
function loadDraft(){const d=state.drafts?.[product().id];contribution=d?.amount??product().defaultAmount??15000;option=Math.min(Math.max(0,d?.option??0),product().options.length-1);goods=d?.goods??'미니 케이스';reward=d?.reward??1;tasteStep=d?.step??0;tasteChoices=d?.choices?[...d.choices]:[null,null,null];tasteConcept=d?.concept??null;tasteDecided=d?.decided??false;}
function goToRewards(){tasteDecided=true;storeDraft();$('#taste-dialog').close();setParticipation(true);updatePurchase();$('#contribution-amount').focus({preventScroll:true});$('#feed-purchase').scrollIntoView({behavior:'smooth',block:'nearest'})}

const makerBriefs={
 balm:{direction:'반려동물과의 접촉을 고려한 보습 멀티 밤',keep:'입술과 건조한 피부를 위한 보습\n일상적인 접촉을 고려한 처방 개발',scope:'보습감 · 마무리감\n휴대 방식'},
 blue:{direction:'노란 기를 자연스럽게 보정하는 톤 스틱',keep:'휴대하기 좋은 스틱\n자연스럽게 정돈하는 피부 표현',scope:'마무리감 · 보정 톤\n스틱 형태'},
 rose:{direction:'끈적임은 줄이고, 도톰한 광택은 살린 글로스',keep:'가벼운 사용감\n겹쳐 바르기 좋은 광택',scope:'광택 표현 · 발색 강도\n입술 위 밀착감'},
 amber:{direction:'피부 가까이 은은하게 남는 고체 향수',keep:'휴대하기 좋은 고체 제형\n피부에 직접 바르는 향',scope:'첫 향 · 중심 향\n잔향의 존재감'}
};
products.filter(p=>p.userProject).forEach(p=>{tasteAxes[p.id]=p.axes;makerBriefs[p.id]=p.brief;});
const makerDecisions=createMakerDecisions({products,axes:tasteAxes,getState:()=>state,getProfiles:()=>profiles,directions:makerBriefs,refresh:()=>{if(view==='result')renderResult();}});
const projectStudio=createProjectStudio({getOwner:()=>state.nickname,onPublish:p=>{const at=products.findIndex(x=>x.id===p.id);if(at<0)products.push(p);else products[at]=p;N00Funding.projects[p.id]=p;tasteAxes[p.id]=p.axes;makerBriefs[p.id]=p.brief;questions[p.id]=p.axes[0];},onVisit:id=>{makerNoteSeen=true;category='all';list=products;index=products.findIndex(p=>p.id===id);option=0;qty=1;media=0;loadDraft();show('feed');},onRefresh:()=>{if(view==='result')renderResult();}});
function renderTasteBrief(){
 const brief=makerBriefs[product().id],published=makerDecisions.summary(product().id),closed=!!published||Date.now()>=new Date(product().closesAt).getTime();
 $('#taste-brief').hidden=false;$('#taste-image-caption').hidden=false;$('#brief-direction').textContent=brief.keep;$('#brief-contribution').textContent=brief.scope;
 $('#taste-phase').textContent=published?'DIRECTION CONFIRMED':closed?'UNDER REVIEW':'COLLECTING TASTES';
 $('#taste-deadline').textContent=published?'최종 방향 공개 · 제작 소식에서 확인':closed?'의견 수집 마감 · 검토 중':'의견 수집 중 · '+new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'long',day:'numeric'}).format(new Date(product().closesAt))+'까지';
 if(closed){$('#taste-skip').textContent='메이커의 제안으로 참여하기 ';}else $('#taste-skip').textContent='메이커의 제안 그대로 좋아요 ';
 return closed;
}
function startTaste(){viewingRecord=false;const opinionsClosed=renderTasteBrief();$('#maker-proposal').textContent=(( {blue:'노란 기를 자연스럽게 보정하는 톤 스틱을 만들고 있어요.',rose:'끈적임은 줄이고, 도톰한 광택은 살린 글로스를 만들고 있어요.',amber:'피부 가까이 은은하게 남는 고체 향수를 만들고 있어요.',balm:'반려동물과 가까이 지내는 일상을 생각한 보습 멀티 밤을 만들고 있어요.'})[product().id]||makerBriefs[product().id].direction)+' 이 제안에 당신의 취향을 보태주세요.';loadDraft();$('#taste-edit').hidden=false;$('#taste-confirm').hidden=false;$('#taste-workspace').hidden=false;$('#taste-result').hidden=true;renderTaste();if(opinionsClosed){$('#lab-options').replaceChildren(node('p','taste-closed',makerDecisions.summary(product().id)?'최종 방향이 공개됐어요. 마이페이지의 제작 소식에서 확인할 수 있어요.':'의견 수집이 끝났어요. 최종 방향은 제작 소식에서 안내할게요.'));$('#lab-next').disabled=true;}$('#taste-dialog').showModal()}
function tasteImageSource(id,choices){
 const custom=products.find(p=>p.id===id&&p.userProject);if(custom)return custom.art;
 if(id==='blue'){if(choices[0]===null)return 'assets/tone-xray-base.png';return 'assets/tone-'+choices.map(v=>v===null?'x':v).join('')+(choices[2]===0?'-slim-v2':'')+'.webp';}
 if(id==='amber')return 'assets/scent-'+choices.map(v=>v===null?0:v).join('')+'.png';
 if(id==='balm')return 'assets/balm-'+choices.map(v=>v===null?0:v).join('')+'.webp';
 if(id!=='rose')return 'assets/product-'+id+'.svg';
 if(choices[0]===null)return 'assets/lip-gloss-xray-base.jpg';
 return 'assets/gloss-'+choices.map(v=>v===null?'x':v).join('')+'.webp';
}
function updateTasteImage(){
 const img=$('#lab-product-image'),src=tasteImageSource(product().id,tasteChoices);
 const alt=['rose','blue','amber','balm'].includes(product().id)?product().title.replace('\n',' ')+' · '+tasteChoices.map((v,i)=>v===null?'':tasteAxes[product().id][i][1][v]).filter(Boolean).join(' · '):'임시 제품 콘셉트';
 if(img.getAttribute('src')===src){img.alt=alt;return;}
 const old=img.cloneNode();old.removeAttribute('id');old.className='lab-image-outgoing';old.alt='';old.setAttribute('aria-hidden','true');
 img.parentElement.querySelectorAll('.lab-image-outgoing').forEach(el=>el.remove());
 if(img.complete&&img.naturalWidth&&['rose','blue','amber','balm'].includes(product().id))img.parentElement.append(old);
 img.onload=()=>{if(old.isConnected){if(matchMedia('(prefers-reduced-motion: reduce)').matches)old.remove();else old.animate([{opacity:1},{opacity:0}],{duration:550,easing:'ease-in-out'}).finished.then(()=>old.remove()).catch(()=>old.remove());}};
 img.onerror=()=>{old.remove();};img.alt=alt;img.src=src;
}
function renderTaste(){const axes=tasteAxes[product().id];$('#lab-step').textContent='0'+(tasteStep+1)+' / 03';$('#lab-question').textContent=axes[tasteStep][0];$('#lab-options').replaceChildren();axes[tasteStep][1].forEach((label,i)=>{const b=node('button','lab-choice',label);b.setAttribute('aria-pressed',String(tasteChoices[tasteStep]===i));b.onclick=()=>{tasteChoices[tasteStep]=i;tasteConcept=null;tasteDecided=false;storeDraft();renderTaste()};$('#lab-options').append(b)});$('#lab-history').replaceChildren();tasteChoices.forEach((v,i)=>{if(v===null)return;const b=node('button','lab-chip',axes[i][1][v]);b.onclick=()=>{tasteStep=i;storeDraft();renderTaste()};$('#lab-history').append(b)});$('#lab-back').disabled=tasteStep===0;$('#lab-next').disabled=tasteChoices[tasteStep]===null;$('#lab-next').textContent=tasteStep===2?'제작 참여 카드 보기':'다음';const visual=$('#lab-visual');visual.dataset.product=product().id;visual.dataset.first=String(tasteChoices[0]);visual.dataset.second=String(tasteChoices[1]);visual.dataset.third=String(tasteChoices[2]);updateTasteImage();}
let couponRevealToken=0;
async function revealCoupon(img){
 const token=++couponRevealToken,card=$('#taste-artifact');
 card.classList.remove('coupon-reveal');
 try{await img.decode()}catch{}
 if(token!==couponRevealToken||$('#taste-result').hidden)return;
 card.classList.add('coupon-reveal');
 $('#taste-dialog').scrollTop=0;
}
function finishTaste(confirmed=false){$('#concept-direction').hidden=false;$('#concept-taste-label').hidden=false;$('#concept-direction p').textContent=makerBriefs[product().id].direction;$('#taste-artifact').hidden=false;$('#taste-review').hidden=true;$('#taste-print').hidden=false;tasteConcept={version:2,questionVersion:1,questions:tasteAxes[product().id].map(axis=>axis[0]),makerDirection:makerBriefs[product().id].direction,keywords:tasteChoices.map((v,i)=>tasteAxes[product().id][i][1][v]),choices:[...tasteChoices]};storeDraft();$('#taste-review-keywords').textContent=tasteConcept.keywords.join(' · ');$('#concept-status').textContent='CONCEPT / 참여 전';$('#taste-workspace').hidden=true;$('#taste-result').hidden=false;const art=$('#result-object');art.replaceChildren();art.dataset.product=product().id;const coupon=$('#taste-artifact');coupon.dataset.imageOrientation=(['blue','rose','amber'].includes(product().id)||(product().id==='balm'&&tasteChoices[2]===1))?'horizontal':'vertical';const finalImage=new Image();finalImage.src=tasteImageSource(product().id,tasteChoices);finalImage.alt=product().title.replace('\n',' ')+' · '+tasteConcept.keywords.join(' · ');if(product().userProject)finalImage.onload=()=>{coupon.dataset.imageOrientation=finalImage.naturalHeight>finalImage.naturalWidth*1.3?'horizontal':'vertical';};art.append(finalImage);revealCoupon(finalImage);$('#concept-name').textContent=product().title.replace('\n',' ');$('#concept-keywords').textContent=tasteConcept.keywords.join(' / ');$('#concept-owner').textContent='CREATED WITH '+state.nickname;$('#concept-reward').textContent='받을 리워드 · '+rewardLabel();$('#concept-amount').textContent=won(contribution)+' · 목표 기여 '+(contribution/product().goal*100).toFixed(2)+'%';}
$('#taste-close').onclick=()=>{$('#taste-dialog').close();$(viewingRecord?'#joined-tab':'#fund-button').focus()};$('#taste-skip').onclick=()=>{tasteConcept=null;tasteChoices=[null,null,null];tasteStep=0;goToRewards()};$('#lab-back').onclick=()=>{tasteStep=Math.max(0,tasteStep-1);storeDraft();renderTaste()};$('#lab-next').onclick=()=>{if(makerDecisions.summary(product().id)||Date.now()>=new Date(product().closesAt).getTime()){startTaste();return}if(tasteChoices[tasteStep]===null)return;if(tasteStep<2){tasteStep++;storeDraft();renderTaste()}else finishTaste()};$('#taste-edit').onclick=()=>{$('#taste-result').hidden=true;$('#taste-workspace').hidden=false;renderTaste()};$('#taste-confirm').onclick=goToRewards;
$('#taste-print').onclick=async()=>{const old=$('#taste-print-root');if(old)old.remove();const root=node('section','');root.id='taste-print-root';const copy=$('#taste-artifact').cloneNode(true);copy.removeAttribute('id');copy.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));root.append(copy);document.body.append(root);await Promise.allSettled([...root.querySelectorAll('img')].map(img=>img.decode?img.decode():Promise.resolve()));window.print()};addEventListener('afterprint',()=>{$('#taste-print-root')?.remove()});
function openSavedConcept(r){const before={index,list,category,contribution,option,reward,goods,tasteStep,tasteChoices,tasteConcept,tasteDecided};list=products;index=products.findIndex(p=>p.id===r.product);tasteChoices=[...r.concept.choices];tasteStep=2;contribution=r.amount;renderTaste();const oldDrafts=JSON.stringify(state.drafts||{});finishTaste(true);state.drafts=JSON.parse(oldDrafts);save();$('#concept-keywords').textContent=r.concept.keywords.join(' / ');$('#concept-direction p').textContent=r.concept.makerDirection||makerBriefs[product().id].direction;$('#concept-reward').textContent='확정 리워드 · '+r.option;$('#concept-status').textContent='CONFIRMED / 참여 완료 · '+String(r.at||'').slice(0,10);$('#taste-edit').hidden=true;$('#taste-confirm').hidden=true;viewingRecord=true;({index,list,category,contribution,option,reward,goods,tasteStep,tasteChoices,tasteConcept,tasteDecided}=before);$('#taste-dialog').showModal()}
function funding(){const p=product(),amount=contribution;if(submitting||$('#fund-dialog').open||!validAmount())return;
submitting=true;state.budget-=amount;state.records.push({product:p.id,option:rewardLabel(),qty:1,amount,rewardTier:reward,concept:tasteConcept?JSON.parse(JSON.stringify(tasteConcept)):null,at:new Date().toISOString()});save();wallet();renderFeed();
$('#completion-card').hidden=!tasteConcept;
$('#receipt-delivery').textContent='본품·한정 세트는 목표 달성 후 제작되며, 펀딩 종료 후 약 '+p.deliveryWeeks+'주 이내 순차 배송 예정이에요. 출시 혜택은 정식 출시 시 제공돼요. 일정은 바뀔 수 있어요.';$('#confirmation').hidden=false;$('#completion').hidden=true;const summary=$('#confirm-summary');summary.replaceChildren();$('#fund-dialog').classList.toggle('with-concept',!!tasteConcept);if(tasteConcept){const preview=node('div','receipt-concept');const img=new Image();img.src=tasteImageSource(product().id,tasteConcept.choices);img.alt='선택한 취향의 제품 콘셉트';preview.append(img,node('p','',tasteConcept.keywords.join(' · ')),node('small','','기획 콘셉트 · 아래 리워드가 실제 참여 구성입니다.'));summary.append(preview)}
const meta=node('div','receipt-meta');const owner=node('div','receipt-row');owner.append(node('span','','FOR'),node('span','',state.nickname));const date=node('time','receipt-date',new Date().toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}));meta.append(owner,date);summary.append(meta,node('h3','receipt-product',p.title.replace('\n',' ')),node('p','receipt-tier',currentRewards()[reward].title));
const table=node('table','receipt-items');const caption=node('caption','compact-sr','선택한 리워드 구성');table.append(caption);const head=node('thead',''),header=node('tr','');['QTY','DESCRIPTION','DETAIL'].forEach(text=>{const th=node('th','',text);th.setAttribute('scope','col');header.append(th)});head.append(header);table.append(head);const body=node('tbody','');
const items=[];if(p.userProject){items.push(['1',currentRewards()[reward].title,currentRewards()[reward].description]);}else{if(reward>0)items.push(['1','본품',p.options[option][0]]);if(reward===2)items.push(['1',goods,'펀딩 한정']);items.push(['1','우선 구매권','출시 시 제공'],['1','출시 할인권','10%']);}items.forEach(values=>{const row=node('tr','');values.forEach(value=>row.append(node('td','',value)));body.append(row)});table.append(body);summary.append(table);
const share=node('div','receipt-row receipt-contribution');share.append(node('span','','목표 기여'),node('span','',(amount/p.goal*100).toFixed(2)+'%'));summary.append(share);
const total=node('div','receipt-total');total.append(node('span','','TOTAL'),node('strong','',won(amount)));summary.append(total);let actions=$('#receipt-actions');if(!actions){actions=node('div','receipt-actions');actions.id='receipt-actions';$('#confirmation').append(actions)}actions.append($('#completion-card'),$('#see-result'));$('#fund-dialog').showModal();$('#fund-dialog').scrollTop=0;$('#close-fund').focus({preventScroll:true})}
$('#close-fund').onclick=()=>{pending=null;$('#fund-dialog').close();$('#fund-button').focus({preventScroll:true})};
let collectionView='likes',creatorEdit=null;
const stageLabels=['펀딩','제작','배송','완료'];
const stageSymbols=['◷','◇','▱','✓'];
function node(tag,cls,text){const el=document.createElement(tag);el.className=cls;if(text!==undefined)el.textContent=text;return el}
function stageBar(current=0){const bar=node('ol','project-stages');bar.setAttribute('aria-label','진행 단계: '+stageLabels[current]);stageLabels.forEach((label,i)=>{const step=node('li',i<=current?'reached':'');if(i===current)step.setAttribute('aria-current','step');step.append(node('span','stage-symbol',stageSymbols[i]),node('span','',label));bar.append(step)});return bar}
function visitProduct(id){category='all';list=products;index=products.findIndex(p=>p.id===id);option=0;contribution=15000;reward=1;goods='미니 케이스';media=0;loadDraft();closeOptionFolds();show('feed');setParticipation(true)}
$('#making-news-close').onclick=()=>$('#making-news-dialog').close();
function renderResult(){
 $('#result-name').innerText='Your taste.\nTaking shape.';$('#profile-name').textContent=state.nickname?state.nickname+' ':'GUEST · 닉네임 연결';
 const spent=state.records.reduce((n,r)=>n+r.amount,0);$('#result-summary').textContent=`${state.records.length} projects · ${social.likes.length} likes · ${won(spent)}`;
 $('#joined-count').textContent=String(new Set(state.records.map(r=>r.product)).size);$('#created-count').textContent=String(N00ProjectStudio.count(state.nickname)+(state.makers||[]).length);
 const counts={tone:0,gloss:0,scent:0,care:0};state.records.forEach(r=>{const pr=products.find(p=>p.id===r.product);if(pr)counts[pr.category]+=r.qty*2});social.likes.forEach(id=>{const pr=products.find(p=>p.id===id);if(pr)counts[pr.category]+=1});const tasteTotal=counts.tone+counts.gloss+counts.scent+counts.care;const best=Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];const tasteType=tasteTotal?best:'open';$('#taste-label').textContent=({tone:'COLOR EXPLORER',gloss:'GLOSS LOVER',scent:'SCENT COLLECTOR',care:'DAILY CARE LOVER',open:'OPEN TO POSSIBILITIES'})[tasteType];$('#taste-image').src='assets/dna/dna-'+(tasteType==='care'?'open':tasteType)+'.svg';{const tb=$('#taste-bias');tb.replaceChildren();if(tasteTotal){const bar=document.createElement('div');bar.className='taste-bias-bar';const legend=document.createElement('div');legend.className='taste-bias-legend';['tone','gloss','scent','care'].forEach(k=>{const pct=Math.round(counts[k]/tasteTotal*100);const seg=document.createElement('i');seg.className='bias-'+k;seg.style.width=pct+'%';bar.append(seg);const s=document.createElement('span');s.className=k===best?'is-top':'';s.textContent=k.toUpperCase()+' '+pct+'%';legend.append(s)});tb.append(bar,legend)}else{const s=document.createElement('span');s.className='taste-bias-empty';s.textContent='좋아요와 참여가 쌓이면 취향이 기울어져요';tb.append(s)}}
 const container=$('#record-list');container.replaceChildren();if(!state.records.length)container.append(node('p','empty','아직 참여한 프로젝트가 없어요.'));
 products.filter(p=>state.records.some(r=>r.product===p.id)).forEach(p=>{const records=state.records.filter(r=>r.product===p.id),total=records.reduce((n,r)=>n+r.amount,0),card=node('article','project-card');const top=node('div','project-card-top'),img=new Image();img.src=p.art||'assets/categories/'+p.category+'-product.png';img.className='joined-product-art';img.alt=p.title.replace('\n',' ');const info=node('div','');info.append(node('span','project-state',N00Funding.timing(p.id).status),node('h3','',p.title.replace('\n',' ')),node('p','',won(total)+' · 목표의 '+(total/p.goal*100).toFixed(2)+'%'));top.append(img,info);card.append(top,stageBar(0));
 card.append(makerDecisions.latestButton(p.id));

 const details=node('details','project-receipts');details.append(node('summary','',`선택한 리워드 · 참여 ${records.length}건`));records.forEach(r=>{const item=node('div','receipt');item.append(node('p','',r.option),node('small','',won(r.amount)+' · '+String(r.at||'').slice(0,10)));const preview=node('button','plain','달성 / 미달 결과 미리보기 ');preview.onclick=()=>{outcomeRecord=r;renderOutcome(true);$('#outcome-dialog').showModal()};if(r.concept){item.append(node('p','', '기획에 보탠 취향 · '+r.concept.keywords.join(' / ')));const cardButton=node('button','plain','참여 카드 보기 · 재인쇄 ');cardButton.onclick=()=>openSavedConcept(r);item.append(cardButton)}item.append(preview);details.append(item)});card.append(details);
 const actions=node('div','project-card-actions'),news=node('button','plain','제작 소식 '),open=node('button','plain','프로젝트 보기 ');news.onclick=()=>makerDecisions.openNews(p.id,news);open.onclick=()=>visitProduct(p.id);actions.append(news,open);card.append(actions);container.append(card)});
 renderCollection();renderCreators();renderBenefits();$('#result-feedback').textContent=storageOK?'':'이 브라우저에서 저장할 수 없어 현재 화면에서만 기록이 유지됩니다.';
}
function renderCollection(){const c=$('#personal-collection');c.replaceChildren();$$('[data-collection]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.collection===collectionView)));
 if(collectionView==='following'){if(social.following){const card=node('article','saved-card');card.append(node('strong','','studio.n00'),node('p','','팔로잉 중'));const b=node('button','plain','메이커 제품 보기 ');b.onclick=()=>openFeed('all');card.append(b);c.append(card)}}
 else products.forEach(p=>{const isOpinion=collectionView==='opinions',comments=social.comments.filter(x=>x.product===p.id),vote=votes[p.id];if(!(collectionView==='likes'?social.likes.includes(p.id):comments.length||Number.isInteger(vote)))return;const card=node('article','saved-card'),img=new Image();img.src=p.art||'assets/product-'+p.id+'.svg';img.alt='';card.append(img,node('h3','',p.title.replace('\n',' ')));if(isOpinion){if(Number.isInteger(vote)&&questions[p.id][1][vote])card.append(node('p','',questions[p.id][0]+' → '+questions[p.id][1][vote]));comments.forEach(x=>card.append(node('p','opinion-text',x.text)))}const b=node('button','plain','다시 보기 ');b.onclick=()=>visitProduct(p.id);card.append(b);c.append(card)});
 if(!c.children.length)c.append(node('p','empty','아직 남긴 기록이 없어요.'));
}
function renderBenefits(){const c=$('#benefit-list');c.replaceChildren();$('#benefit-count').textContent=state.records.length+'건';state.records.forEach(r=>{const card=node('div','benefit-row');card.append(node('strong','',products.find(p=>p.id===r.product).title.replace('\n',' ')),node('p','','출시 우선 구매권 + 10% 할인권 · 출시 시 제공 예정'),node('small','','최대 5천 원 · 출시 후 30일 · 1회 · 전시용 조건'));c.append(card)});if(!state.records.length)c.append(node('p','','아직 예정된 출시 혜택이 없어요.'));c.append(node('p','account-caption','목표 미달 시 전액 환불과 별도로 다음 펀딩 쿠폰이 제공돼요. 현재 발급된 쿠폰은 없어요.'))}
function accountTab(created){$('#joined-panel').hidden=created;$('#created-panel').hidden=!created;$('#joined-tab').setAttribute('aria-pressed',String(!created));$('#created-tab').setAttribute('aria-pressed',String(created))}
$('#joined-tab').onclick=()=>accountTab(false);$('#created-tab').onclick=()=>accountTab(true);$$('[data-collection]').forEach(b=>b.onclick=()=>{collectionView=b.dataset.collection;renderCollection()});
function switchProfile(){archiveProfile();state={nickname:'',budget:1000000,records:[],picks:[],makers:[]};social={likes:[],following:false,comments:[]};votes={};save();saveSocial();try{localStorage.setItem(voteKey,'{}')}catch{}renderResult();identity(()=>renderResult())}
$('#switch-profile').onclick=switchProfile;$('#profile-name').onclick=()=>{if(state.nickname)switchProfile();else identity(()=>renderResult())};
function renderCreators(){const c=$('#creator-list');projectStudio.mount(c);(state.makers||[]).forEach((m,i)=>{const card=node('article','project-card');card.append(node('span','project-state','기존 프로젝트'),node('h3','',m.title),node('p','',m.description));const edit=node('button','plain','기존 내용 관리');edit.onclick=()=>editCreator(i);card.append(edit);c.append(card);});makerDecisions.mountManager(c);}
function editCreator(i=null){creatorEdit=i;const m=i===null?{title:'',goal:1000000,description:'',stage:0,status:'draft'}:state.makers[i];$('#creator-name').value=m.title;$('#creator-goal').value=String(m.goal);$('#creator-description').value=m.description;$('#creator-stage').value=String(m.stage);$('#creator-status').value=m.status;$('#creator-dialog').showModal()}
$('#new-project').onclick=()=>identity(()=>projectStudio.openNew());$('#close-creator').onclick=()=>$('#creator-dialog').close();$('#creator-form').onsubmit=e=>{e.preventDefault();const title=$('#creator-name').value.trim(),description=$('#creator-description').value.trim(),goal=Number($('#creator-goal').value);if(!title||!description||!Number.isSafeInteger(goal)||goal<1000||goal%100)return;const m={title:title.slice(0,60),description:description.slice(0,1500),goal,stage:Math.max(0,Math.min(3,Number($('#creator-stage').value)||0)),status:$('#creator-status').value==='published'?'published':'draft'};state.makers=state.makers||[];if(creatorEdit===null)state.makers.push(m);else state.makers[creatorEdit]=m;save();$('#creator-dialog').close();renderResult();accountTab(true)};
let entering=false;
$$('[data-category]').forEach(b=>b.onclick=async()=>{
 if(entering)return;
 entering=true;
 const cat=b.dataset.category;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let fadeOut,fadeIn;
 try{
  if(!reduced){
   fadeOut=$('#categories').animate([{opacity:1},{opacity:0}],{duration:180,easing:'ease-out',fill:'forwards'});
   await fadeOut.finished;
  }
  openFeed(cat);
  if(!reduced){
   fadeIn=$('#experience').animate([{opacity:0},{opacity:1}],{duration:320,easing:'ease-in-out',fill:'both'});
   await fadeIn.finished;
  }
 }finally{
  fadeOut?.cancel();fadeIn?.cancel();entering=false;showWelcomeNote();
 }
});
$$('[data-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.action;if(a==='categories')categories();else if(a==='results')show('result');else if(a==='contact')show('contact');else if(a==='home')show('home');else if(a==='feed')show('feed')});
$('#skip-intro').onclick=categories;

function closeCuriosity(){$('#participant-tastes').open=false;$('#funding-panel').hidden=!participating}
function renderParticipantTastes(){const p=product(),axes=tasteAxes[p.id],target=$('#participant-taste-content');target.replaceChildren();const snapshots=profiles.filter(x=>x.name!==state.nickname).map(x=>x.state);snapshots.push(state);const selections=snapshots.map(snapshot=>[...snapshot.records].reverse().find(r=>r.product===p.id&&r.concept&&(p.id!=='blue'||r.concept.version===2)&&Array.isArray(r.concept.choices)&&r.concept.choices.length===3&&r.concept.choices.every(v=>v===0||v===1))).filter(Boolean);target.append(node('p','taste-sample','이 기기에서 취향을 선택한 참여자 '+selections.length+'명 · 닉네임별 최근 선택'));
if(!selections.length){target.append(node('p','taste-empty','아직 모인 취향이 없어요.'));return}
axes.forEach(([question,labels],i)=>{const block=node('div','taste-distribution');block.append(node('h4','',question));labels.forEach((label,j)=>{const count=selections.filter(r=>r.concept.choices[i]===j).length,percent=Math.round(count/selections.length*100);const row=node('div','taste-distribution-label');row.append(node('span','',label),node('span','',percent+'%'));const track=node('div','taste-distribution-track'),fill=node('i','');fill.style.width=percent+'%';track.append(fill);block.append(row,track)});target.append(block)})}
$('#participant-tastes').addEventListener('toggle',()=>{if($('#participant-tastes').open)renderParticipantTastes()});

$$('[data-media]').forEach(b=>b.onclick=()=>{media=Number(b.dataset.media);renderMedia()});$('#motion-toggle').onclick=()=>{paused=!paused;$('#media-stage').classList.toggle('paused',paused);$('#motion-toggle').textContent=paused?'▷':'Ⅱ';$('#motion-toggle').setAttribute('aria-label',paused?'콘텐츠 재생':'콘텐츠 일시정지');syncReelPlayback()};
$('#prev-product').onclick=()=>navigate(-1);$('#next-product').onclick=()=>navigate(1);
let accumulated=0,lastWheel=0,lockedUntil=0;
function feedWheel(e){
 if(e.ctrlKey||view!=='feed'||$('dialog[open]')||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
 if(e.target.closest('button,input,select,textarea,summary,dialog'))return;
 if(participating&&!e.target.closest('#media-stage'))return;
 e.preventDefault();const now=Date.now(),gap=now-lastWheel;lastWheel=now;
 // Wait for the trackpad's inertial tail to end before accepting another swipe.
 if(now<lockedUntil||feedMoving){accumulated=0;return}
 if(gap>180)accumulated=0;
 else if(lockedUntil&&accumulated===0){return}
 const d=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
 if(Math.sign(d)!==Math.sign(accumulated))accumulated=0;
 accumulated+=d;if(Math.abs(accumulated)>70){navigate(Math.sign(accumulated));accumulated=0;lockedUntil=now+720}
}
$('#feed-view').addEventListener('wheel',feedWheel,{passive:false});
$('#media-stage').addEventListener('keydown',e=>{if(e.target!==$('#media-stage'))return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();navigate(e.key==='ArrowDown'?1:-1)}});let touch=0;$('#media-stage').addEventListener('touchstart',e=>touch=e.touches[0].clientY,{passive:true});$('#media-stage').addEventListener('touchend',e=>{const d=touch-e.changedTouches[0].clientY;if(Math.abs(d)>75)navigate(d>0?1:-1)},{passive:true});
$('#fund-button').onclick=()=>{if(validAmount())identity(()=>{if(tasteDecided)funding();else startTaste()})};
const notes={blue:['파운데이션까지는 바르기 싫은 날.','거울 앞에서 늘 생각했어요. 신경 쓰이는 곳에만 톡, 바르면 안 될까? 그래서 이 작은 스틱을 그리기 시작했어요.','마지막 터치는, 보송하게? 촉촉하게?'],rose:['빛을 한 겹 더하면 어떨까요?','좋아하는 립 컬러는 그대로 두고, 기분만 바꿔보고 싶었어요. 주머니에서 꺼내 쓱 바르는 빛 한 겹을 만들고 있어요.','입술 위에 어떤 빛을 올려볼까요?'],amber:['좋아하는 순간을 주머니에 넣는다면.','스쳐 지나가는 향이 아쉬워서요. 생각날 때마다 꺼내 바를 수 있는 작은 향을 그려봤어요.','첫인상은 어느 쪽이 좋을까요?']};
function openMakerNote(welcome=false){const p=product(),n=notes[p.id];if(p.userProject){$('#plan-title').textContent=p.title;const c=$('#plan-content');c.replaceChildren(node('span','making-eyebrow','MAKER / PROJECT'),node('h3','',p.intro),node('p','',p.detail));if(p.detailArt){const im=new Image();im.src=p.detailArt;im.alt=p.title+' 상세페이지';im.style.width='100%';c.append(im);}$('#project-dialog').showModal();return;}if(p.id==='balm'){$('#plan-title').textContent=p.title.replace('\n',' ');const c=$('#plan-content');c.replaceChildren(node('span','making-eyebrow','CARE / NUMBER 04 · 기획 초안'),node('h3','','가까이 닿는 순간까지 생각해요.'),node('p','',p.detail),node('p','','펀딩 목표 '+won(p.goal)+' · 용량·최종 처방은 검토 중'),node('p','','투표 의견을 검토해 틴 또는 스틱 중 최종 용기를 결정해요. 리워드는 최종 확정 용기의 본품 1개이며 개별 맞춤 제작이 아니에요. 반려동물에게 먹이거나 바르는 제품이 아니며, 접촉 관련 검증 결과와 사용 조건은 개발 후 공개할 예정이에요.'));$('#project-dialog').showModal();return;}const detail=['blue','rose','amber'].includes(p.id),dialog=$('#maker-note-dialog');dialog.classList.toggle('image-detail',detail);$('#note-legacy').hidden=detail;$('#note-detail').hidden=!detail;dialog.setAttribute('aria-label',detail?p.title.replace('\n',' ')+' 상세페이지':'메이커 노트');if(detail){
const scent=p.id==='amber',tone=p.id==='blue',name=p.title.replace('\n',' '),prefix=tone?'tone':scent?'scent':'gloss',art=$('#note-detail-scroll>.note-detail-image'),fund=$('#note-funding img'),map=$('#note-minimap img');
const detailSrc='assets/details/'+prefix+'-detail.png?v='+(tone?'20261005':scent?'20261004':'edf5b7ecafeb');
art.src=detailSrc;art.width=1720;art.height=tone?11460:scent?9002:13502;art.alt=name+' 상세페이지';
map.src=detailSrc;map.width=1720;map.height=art.height;
fund.src='assets/details/'+prefix+'-funding.png';fund.width=1720;fund.height=tone?7317:scent?7311:7275;fund.alt=name+' 펀딩 정보고시';
$('#note-detail').setAttribute('aria-label',name+' 상세페이지');
dialog.removeAttribute('aria-labelledby');$('#note-funding').open=false;dialog.showModal();$('#note-detail-scroll').scrollTop=0;$('#note-detail-close').focus({preventScroll:true});return;}dialog.setAttribute('aria-labelledby','note-title');$('#note-heading').textContent=n[0];$('#note-body').textContent=n[1];$('#note-sketch-label').textContent=p.title.replace('\n',' ');$('#note-back').textContent=welcome?'제품 둘러보기 ':'내 선택으로 돌아가기 ';$('#maker-note-dialog').showModal()}
function showWelcomeNote(){if(view!=='feed'||makerNoteSeen||$('dialog[open]'))return;openMakerNote(true);makerNoteSeen=true}
$('#maker-note-button').onclick=()=>openMakerNote();
function closeNote(){$('#maker-note-dialog').close();$(participating?'#maker-note-button':'#social-note').focus({preventScroll:true})}
$('#note-back').onclick=closeNote;
$('#note-detail-close').onclick=closeNote;

$('#nickname-form').onsubmit=e=>{e.preventDefault();const name=$('#nickname-input').value.trim();if(!name){$('#nickname-error').textContent='닉네임을 입력해 주세요.';return}$('#nickname-dialog').close();let selectedName=name;if(!$('#restore-existing').checked&&profiles.some(p=>p.name===name)){let n=2;while(profiles.some(p=>p.name===name+' · '+n))n++;selectedName=name+' · '+n}restoreProfile(selectedName);const action=pending;pending=null;action?.()};
$('#nickname-dialog').addEventListener('cancel',()=>pending=null);$$('.dialog-cancel').forEach(b=>b.onclick=()=>{pending=null;b.closest('dialog').close()});
$('#fund-dialog').addEventListener('close',()=>{submitting=false});
$('#completion-card').onclick=()=>{$('#fund-dialog').close();openSavedConcept(state.records[state.records.length-1])};
$('#see-result').onclick=()=>{$('#fund-dialog').close();show('result')};
$('#intro-again').onclick=()=>{show('journey');scrollTo({top:0,behavior:'instant'})};
function nextVisitor(){window.dispatchEvent(new Event('n00:reset-visitor'));clearTimeout(idleTimer);clearTimeout(idleCountdown);archiveProfile();$$('dialog').forEach(d=>{if(d.open)d.close()});pending=null;submitting=false;state={nickname:'',budget:1000000,records:[],picks:[],drafts:{},makers:[]};votes={};try{localStorage.removeItem(voteKey)}catch{}makerNoteSeen=false;tasteConcept=null;tasteChoices=[null,null,null];tasteStep=0;tasteDecided=false;viewingRecord=false;category='all';list=products;index=0;option=0;qty=1;contribution=15000;reward=1;goods='미니 케이스';media=0;accountTab(false);collectionView='likes';resetSocial();save();['nickname-input','comment-input','creator-name','creator-description'].forEach(id=>$('#'+id).value='');$('#restore-existing').checked=false;renderResult();setParticipation(false);show('journey');if(typeof history!=='undefined')history.replaceState(null,'',location.pathname+location.search);scrollTo({top:0,behavior:'instant'});armIdle()}
$('#new-visitor').onclick=()=>{if(confirm('현재 닉네임의 기록을 보관하고 다음 관람객 체험을 시작할까요?'))nextVisitor()};
$('#save-record').onclick=()=>{const lines=['N00 / MY COLLECTION',state.nickname||'GUEST',`참여 ${state.records.length}건`,...state.records.map(r=>products.find(p=>p.id===r.product).title.replace('\n',' ')+' | '+r.option+' | '+r.qty+'개 | '+won(r.amount)),`남은 체험 예산 ${won(state.budget)}`,'전시용 모의 펀딩 기록'];const blob=new Blob(['\uFEFF'+lines.join('\n')],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='N00-my-collection.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#result-feedback').textContent='기록 파일을 저장했어요.'};
function renderOutcome(success){
 if(!outcomeRecord)return;const r=outcomeRecord,p=products.find(p=>p.id===r.product);
 $('#outcome-success').setAttribute('aria-pressed',String(success));$('#outcome-failed').setAttribute('aria-pressed',String(!success));
 $('#outcome-title').textContent=success?'함께 만든 시작.':'이번 제작은 쉬어갑니다.';$('#outcome-product').textContent=p.title.replace('\n',' ');
 const c=$('#outcome-content');c.replaceChildren();
 const rows=success?[
 ['목표 달성 · 제작 준비',r.option],['다음으로 만날 순간','샘플 확정 → 제작 → 정식 출시. 출시 혜택은 출시 시 제공돼요.'],['나의 기여',(r.amount/p.goal*100).toFixed(2)+'% · '+won(r.amount)]
 ]:[['전액 환불 완료 · 체험 예시',won(r.amount)+' 전액이 참여자에게 돌아가요. 제작과 리워드 제공은 진행되지 않아요.'],['다음 발견을 위한 선물','다음 펀딩 할인 쿠폰 1장 · 플랫폼 제공'],['쿠폰 조건','금액·사용 기한·최소 참여금은 미정이에요. 실제 사용 가능한 쿠폰이 아닌 전시용 예시입니다.']];
 rows.forEach(([title,body])=>{const box=document.createElement('article');box.className='outcome-card';const h=document.createElement('h3'),t=document.createElement('p');h.textContent=title;t.textContent=body;box.append(h,t);c.append(box)});
}
$('#outcome-success').onclick=()=>renderOutcome(true);$('#outcome-failed').onclick=()=>renderOutcome(false);$('#close-outcome').onclick=()=>$('#outcome-dialog').close();$('#outcome-discover').onclick=()=>{$('#outcome-dialog').close();categories()};
// Planning participation is separate from monetary funding.
const voteKey='n00_planning_votes_v1';let votes={};try{const v=JSON.parse(localStorage.getItem(voteKey)||'{}');if(v&&typeof v==='object'&&!Array.isArray(v))votes=v}catch{}
const questions={balm:['멀티 밤에서 더 원하는 사용감은?',['가볍게 밀착','도톰한 보습']],blue:['다음 샘플의 마무리감은?',['보송한 마무리','촉촉한 마무리']],rose:['다음 글로스에서 보고 싶은 빛은?',['맑은 유리광','은은한 펄광']],amber:['다음 향의 첫인상은?',['가벼운 우디','포근한 머스크']]};
function openPlan(id,joined=false){const p=products.find(x=>x.id===id);$('#plan-title').textContent=p.title.replace('\n',' ');const c=$('#plan-content');c.replaceChildren();const intro=document.createElement('p');intro.textContent=joined?'체험 참여 완료 · '+N00Funding.timing(p.id).description:'마음에 드는 아이디어가 제품이 되기까지. 리워드와 예상 일정을 먼저 확인하세요.';c.append(intro);const peek=document.createElement('div');peek.className='next-moment';const heading=document.createElement('h3');heading.textContent='다음으로 기다릴 순간';const note=document.createElement('p');note.textContent=N00Funding.timing(p.id).description+' · 목표 달성 확인 후 샘플 소식';peek.append(heading,note);c.append(peek);const steps=[['01 / 기획 공개','컬러·제형에 대한 의견을 모으고 있어요.'],['02 / 펀딩 일정', N00Funding.period(p.id)+' · '+N00Funding.timing(p.id).description],['03 / 샘플 확정','목표 달성 확인 후 샘플 확정 일정을 안내해요.'],['04 / 제작 예정',p.production+' · 목표 달성 시 제작 진행'],['05 / 배송 예정','펀딩 종료 후 약 '+p.deliveryWeeks+'주 이내 순차 배송. 상세 일정은 제작 소식으로 안내해요.']];steps.forEach(([title,body])=>{const item=document.createElement('article');item.className='plan-step';const h=document.createElement('h3'),p=document.createElement('p');h.textContent=title;p.textContent=body;item.append(h,p);c.append(item)});const reward=document.createElement('p');reward.textContent='리워드: 참여 금액에 따라 출시 혜택, 본품, 펀딩 한정 세트 중 선택합니다. 목표 미달 시 제작하지 않고 개인에게 참여금 전액을 환불합니다. 플랫폼의 다음 펀딩 할인 쿠폰은 환불과 별도로 제공됩니다. 금액·구성과 일정은 전시용 예시입니다.';c.append(reward);const news=document.createElement('details'),summary=document.createElement('summary'),body=document.createElement('p');summary.textContent='제작자 소식 / 첫 샘플을 준비하고 있어요';body.textContent='지금 모인 취향과 의견을 바탕으로 다음 샘플을 검토하고 있어요. 방향이 정해지면 이곳에 샘플 사진과 변경 사항을 공유할게요. — studio.n00 (예시 소식)';news.append(summary,body);c.append(news);$('#project-dialog').showModal()}
$('#close-plan').onclick=()=>$('#project-dialog').close();
// Placeholder choreography only; final rotation / makeup footage replaces these assets.
function animateBridge(){const r=$('.turn-scene').getBoundingClientRect(),p=$('.turn-scene').classList.contains('embedded-turn')?Number($('.faces-scroll').dataset.bridge||0):Math.max(0,Math.min(1,-r.top/(r.height-innerHeight)));$$('.orbit-products img').forEach((img,i)=>{img.style.opacity=String(Math.min(1,p*3));img.style.transform=`translateY(${(1-p)*(i%2?100:-100)}px) rotate(${(i-1)*20+p*15}deg)`});$('.turn-face').style.opacity=String(1-Math.max(0,(p-.6)/.4)*.7);const c=$('#categories').getBoundingClientRect();$('#skip-intro').hidden=view!=='journey'||c.top<innerHeight*.8}
addEventListener('scroll',animateBridge,{passive:true});archiveProfile();wallet();animateBridge();
let idleTimer,idleCountdown,idleDeadline=0;
function idleTick(){const seconds=Math.max(0,Math.ceil((idleDeadline-Date.now())/1000));$('#idle-seconds').textContent=String(seconds);if(seconds===0){nextVisitor();return}idleCountdown=setTimeout(idleTick,Math.min(1000,idleDeadline-Date.now()));idleCountdown?.unref?.()}
function showIdle(){if(view==='journey'&&!state.nickname&&!$('dialog[open]')&&(typeof scrollY==='undefined'||scrollY<10)){armIdle();return}idleDeadline=Date.now()+30000;$('#idle-dialog').showModal();idleTick();$('#idle-continue').focus()}
function armIdle(){if($('#idle-dialog').open)return;clearTimeout(idleTimer);idleTimer=setTimeout(showIdle,600000);idleTimer?.unref?.()}
function continueVisit(){clearTimeout(idleCountdown);$('#idle-dialog').close();armIdle()}
['pointerdown','pointermove','keydown','wheel','touchstart','scroll'].forEach(type=>addEventListener(type,armIdle,{passive:true}));
$('#idle-continue').onclick=continueVisit;$('#idle-dialog').addEventListener('cancel',e=>{e.preventDefault();continueVisit()});$('#idle-new').onclick=nextVisitor;armIdle();
products.filter(p=>p.userProject).forEach(p=>questions[p.id]=p.axes[0]);

})();
