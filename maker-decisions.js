/* Local exhibition journal: drafts never appear as published decisions. */
(()=>{
'use strict';
const clone=value=>JSON.parse(JSON.stringify(value));
function aggregate(id,state,profiles,axes){
 const snapshots=profiles.filter(p=>p.name!==state.nickname).map(p=>p.state).concat(state);
 const entries=snapshots.map(s=>[...(s.records||[])].reverse().find(r=>r.product===id)).filter(r=>r?.concept&&Array.isArray(r.concept.choices));
 return axes.map((axis,i)=>({question:axis[0],options:axis[1].map((label,v)=>({label,count:entries.filter(r=>r.concept.choices[i]===v&&r.concept.keywords?.[i]===label).length}))}));
}
function validate(draft,axes,hasPublished){
 if(!draft.title?.trim()||!draft.summary?.trim())return '제목과 결정 요약을 입력해주세요.';
 if(draft.decisions?.length!==axes.length||draft.decisions.some(d=>!d.outcome?.trim()||!d.reason?.trim()))return '각 질문의 최종 방향과 결정 이유를 입력해주세요.';
 if(hasPublished&&!draft.changeNote?.trim())return '이전 공개 내용에서 달라진 점을 입력해주세요.';
 return '';
}
function publishRevision(current,candidate,id,at){return {draft:null,revisions:[...(current.revisions||[]),{...clone(candidate),id,publishedAt:at}]};}
window.N00DecisionCore={aggregate,validate,publishRevision};
window.createMakerDecisions=function(config){
 const {products,axes,getState,getProfiles,refresh,directions}=config;
 const key='n00_maker_decisions_v1';let database={projects:{},seen:{}};
 try{const v=JSON.parse(localStorage.getItem(key)||'null');if(v?.projects&&v?.seen)database=v;}catch{}
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const $=s=>document.querySelector(s),project=id=>products.find(p=>p.id===id),name=id=>project(id).title.replace('\n',' ');
 const entry=id=>database.projects[id]||(database.projects[id]={draft:null,revisions:[]});
 const latest=id=>entry(id).revisions.at(-1);
 function persist(){try{localStorage.setItem(key,JSON.stringify(database));return true;}catch{return false;}}
 const date=t=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric'}).format(new Date(t));
 function isUnread(id){const r=latest(id);return !!r&&database.seen[getState().nickname||'guest']?.[id]!==r.id;}
 function summary(id){const r=latest(id);return r?{title:r.title,summary:r.summary,date:date(r.publishedAt),unread:isUnread(id)}:null;}
 function publicBody(id,revision,preview=false){
 const body=el('div','decision-content');
 if(!revision){body.append(el('span','making-eyebrow','COLLECTING TASTES'),el('h3','','아직 최종 방향이 공개되지 않았어요.'),el('p','',directions[id].direction),el('p','decision-muted','참여 의견과 샘플 테스트를 검토한 뒤, 메이커가 결정 이유와 다음 소식을 안내할 예정이에요.'));return body;}
 body.append(el('span','making-eyebrow',preview?'PREVIEW · 아직 공개되지 않았어요':'DIRECTION CONFIRMED · 기획 방향 공개'),el('h3','decision-title',revision.title),el('p','decision-summary',revision.summary));
 if(revision.publishedAt)body.append(el('p','decision-muted',date(revision.publishedAt)+' · '+(entry(id).revisions.length>1?'변경 안내 포함':'최종 제조·검증 완료를 뜻하지 않아요.')));
 const record=[...getState().records].reverse().find(r=>r.product===id);
 if(record){const personal=el('section','decision-personal');personal.append(el('span','making-eyebrow','YOUR TASTE / MAKER’S DIRECTION'));
 if(record.concept?.keywords?.length){personal.append(el('p','decision-muted','가장 최근에 확정한 취향을 기준으로 보여드려요. 기존 참여 카드는 당시 기록 그대로 유지돼요.'));
 const table=el('table','decision-comparison');const head=el('thead');const hr=el('tr');['내가 보탠 취향','메이커의 결정'].forEach(t=>{const th=el('th','',t);th.scope='col';hr.append(th)});head.append(hr);table.append(head);const rows=el('tbody');
 revision.decisions.forEach((d,i)=>{const row=el('tr'),own=record.concept.keywords[i]||'선택 기록 없음',cell=el('td');cell.append(el('span','',d.outcome));if(own===d.outcome)cell.append(el('small','decision-match','같은 방향으로 진행'));else{const a=el('a','decision-reason-link','결정 이유 보기');a.href='#decision-reason-'+i;cell.append(a);}row.append(el('td','',own),cell);rows.append(row)});table.append(rows);personal.append(table);
 }else personal.append(el('p','','당신이 지지한 기획이 이 방향으로 구체화됐어요.'));body.append(personal);}
 revision.decisions.forEach((d,i)=>{const section=el('section','making-step');section.id='decision-reason-'+i;section.append(el('span','making-eyebrow',String(i+1).padStart(2,'0')+' / '+d.question),el('h3','',d.outcome),el('p','',d.reason));if(d.image){const figure=el('figure','decision-evidence');const img=el('img');img.src=d.image;img.alt=d.imageCaption||d.question+' 검토 자료';figure.append(img);if(d.imageCaption)figure.append(el('figcaption','',d.imageCaption));section.append(figure)}body.append(section)});
 const next=el('section','making-step');next.append(el('span','making-eyebrow','NEXT UPDATE'),el('h3','',revision.nextTitle||'다음 소식을 준비하고 있어요'),el('p','',revision.nextDate?date(revision.nextDate+'T12:00:00+09:00')+' 공개 예정':'공개 일정 준비 중'));body.append(next);
 if(!preview&&entry(id).revisions.length>1){const history=el('details','decision-history');history.append(el('summary','','변경 이력 · '+(entry(id).revisions.length-1)+'건'));[...entry(id).revisions].reverse().forEach((r,i)=>{const item=el('section','making-step');item.append(el('span','making-eyebrow',date(r.publishedAt)+(i===0?' · 현재 공개 내용':'')),el('h3','',r.title),el('p','',r.changeNote||'첫 기획 방향 공개'));r.decisions.forEach(d=>item.append(el('p','decision-muted',d.question+' · '+d.outcome+' — '+d.reason)));history.append(item)});body.append(history)}
 return body;
 }
 function openNews(id,trigger,previewRevision){
 const dialog=$('#making-news-dialog');$('#making-news-title').textContent=previewRevision?'공개 전 미리보기':'함께 만드는 과정.';dialog.querySelector('.making-product').textContent=name(id);const note=dialog.querySelector('.making-example');note.textContent=previewRevision?'미리보기 · 저장하거나 공개하기 전에는 참여자에게 표시되지 않아요.':'이 기기에 저장된 메이커 제작 소식';
 const r=previewRevision||latest(id);$('#making-news-body').replaceChildren(publicBody(id,r,!!previewRevision));
 dialog.onclose=()=>trigger?.isConnected&&trigger.focus({preventScroll:true});dialog.showModal();dialog.scrollTop=0;$('#making-news-close').focus({preventScroll:true});
 if(!previewRevision&&r){const person=getState().nickname||'guest';database.seen[person]??={};database.seen[person][id]=r.id;persist();refresh();}
 }
 let editingId=null,draft=null,pendingImages=0,openingTrigger=null;
 const editor=el('dialog','decision-editor');editor.id='decision-editor';editor.setAttribute('aria-labelledby','decision-editor-title');editor.innerHTML='<header class="making-news-header"><span class="making-eyebrow">N[00] / MAKER STUDIO</span><button type="button" class="decision-close" aria-label="결정 작성 닫기">×</button></header><h2 id="decision-editor-title">의견을 듣고, 방향을 정해요.</h2><p class="decision-editor-product"></p><p class="decision-muted">전시용 메이커 관리 · 이 기기에서 저장·공개돼요. 다른 기기에는 전달되지 않아요.</p><div id="decision-editor-stats"></div><form id="decision-form"><div id="decision-fields"></div><p id="decision-editor-feedback" role="status" aria-live="polite"></p><div class="decision-editor-actions"><button type="button" data-save class="outline">임시 저장</button><button type="submit" class="primary">미리보기</button></div></form>';
 document.body.append(editor);editor.querySelector('.decision-close').onclick=()=>editor.close();editor.onclose=()=>openingTrigger?.isConnected&&openingTrigger.focus({preventScroll:true});
 function field(parent,label,key,type='text',value='',required=false){const id='decision-field-'+key.replaceAll('.','-');const wrap=el('div','decision-field'),lab=el('label','',label);lab.htmlFor=id;const input=el(type==='textarea'?'textarea':'input');if(type!=='textarea')input.type=type;else input.rows=3;input.id=id;input.value=value;input.required=required;if(type!=='date')input.maxLength=type==='textarea'?1500:140;wrap.append(lab,input);parent.append(wrap);return input;}
 function blank(id){return {title:'',summary:'',decisions:axes[id].map(a=>({question:a[0],outcome:'',reason:'',image:'',imageCaption:''})),nextTitle:'',nextDate:'',changeNote:''};}
 function collect(){draft.title=$('#decision-field-title').value.trim();draft.summary=$('#decision-field-summary').value.trim();draft.nextTitle=$('#decision-field-nextTitle').value.trim();draft.nextDate=$('#decision-field-nextDate').value;draft.changeNote=$('#decision-field-changeNote')?.value.trim()||'';draft.decisions.forEach((d,i)=>{const value=$('#decision-outcome-'+i).value;d.outcome=value==='custom'?$('#decision-field-custom-'+i).value.trim():value;d.reason=$('#decision-field-reason-'+i).value.trim();d.imageCaption=$('#decision-field-caption-'+i).value.trim()});return clone(draft);}
 function feedback(text){$('#decision-editor-feedback').textContent=text;}
 function saveDraft(){if(pendingImages){feedback('사진을 준비하고 있어요. 잠시 후 저장해주세요.');return false;}entry(editingId).draft=collect();if(!persist()){feedback('저장 공간이 부족해요. 사진 수나 크기를 줄여주세요.');return false;}feedback('임시 저장했어요. 참여자에게는 아직 보이지 않아요.');return true;}
 async function readPhoto(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>12*1024*1024)throw Error('JPG·PNG·WebP 사진을 12MB 이하로 선택해주세요.');const bitmap=await createImageBitmap(file);const scale=Math.min(1,1200/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();return canvas.toDataURL('image/jpeg',.78);}
 function openEditor(id,trigger){editingId=id;openingTrigger=trigger;draft=clone(entry(id).draft||latest(id)||blank(id));pendingImages=0;editor.querySelector('.decision-editor-product').textContent=name(id);const stats=$('#decision-editor-stats');stats.replaceChildren();const disclosure=el('details','decision-stats');disclosure.append(el('summary','','참여 의견 확인'));disclosure.append(el('p','decision-muted','이 기기의 닉네임별 최근 확정 취향 · 중복 참여 제외 · 현재 질문과 일치하는 기록 기준'));aggregate(id,getState(),getProfiles(),axes[id]).forEach(a=>{const line=el('div','decision-stat-row');line.append(el('strong','',a.question));a.options.forEach(o=>line.append(el('span','',o.label+' · '+o.count+'명')));disclosure.append(line)});stats.append(disclosure);
 const fields=$('#decision-fields');fields.replaceChildren();field(fields,'소식 제목','title','text',draft.title,true);field(fields,'결정 요약','summary','textarea',draft.summary,true);
 draft.decisions.forEach((d,i)=>{const section=el('fieldset','decision-question');section.append(el('legend','',axes[id][i][0]));const label=el('label','','최종 방향');label.htmlFor='decision-outcome-'+i;const select=el('select');select.id=label.htmlFor;const empty=el('option','','방향을 선택해주세요');empty.value='';select.append(empty);axes[id][i][1].forEach(t=>{const opt=el('option','',t);opt.value=t;select.append(opt)});const custom=el('option','','조정안 직접 작성');custom.value='custom';select.append(custom);select.value=axes[id][i][1].includes(d.outcome)?d.outcome:d.outcome?'custom':'';select.required=true;section.append(label,select);const customInput=field(section,'조정한 방향','custom-'+i,'text',select.value==='custom'?d.outcome:'');customInput.parentElement.hidden=select.value!=='custom';select.onchange=()=>{customInput.parentElement.hidden=select.value!=='custom';customInput.required=select.value==='custom';};customInput.required=select.value==='custom';field(section,'결정 이유 · 의견과 테스트를 어떻게 검토했나요?','reason-'+i,'textarea',d.reason,true);
 const photoLabel=el('label','','샘플·비교 자료 (선택)');photoLabel.htmlFor='decision-photo-'+i;const file=el('input');file.id=photoLabel.htmlFor;file.type='file';file.accept='image/jpeg,image/png,image/webp';const preview=el('img','decision-upload-preview');preview.alt='첨부한 검토 자료';preview.hidden=!d.image;if(d.image)preview.src=d.image;const remove=el('button','plain','사진 삭제');remove.type='button';remove.hidden=!d.image;remove.onclick=()=>{d.image='';preview.removeAttribute('src');preview.hidden=true;remove.hidden=true;file.value='';};file.onchange=async()=>{const f=file.files[0];if(!f)return;pendingImages++;try{d.image=await readPhoto(f);preview.src=d.image;preview.hidden=false;remove.hidden=false;feedback('사진을 준비했어요.')}catch(e){feedback(e.message)}finally{pendingImages--;}};section.append(photoLabel,file,preview,remove);field(section,'자료 설명 (선택)','caption-'+i,'text',d.imageCaption);fields.append(section);});
 field(fields,'다음에 공개할 내용 (선택)','nextTitle','text',draft.nextTitle);field(fields,'다음 공개 예정일 (선택)','nextDate','date',draft.nextDate);if(latest(id))field(fields,'이전 공개 내용에서 달라진 점','changeNote','textarea',entry(id).draft?.changeNote||'',true);feedback('');editor.showModal();editor.scrollTop=0;
 }
 editor.querySelector('[data-save]').onclick=saveDraft;
 $('#decision-form').onsubmit=e=>{e.preventDefault();if(pendingImages){feedback('사진을 준비하고 있어요. 잠시 후 다시 시도해주세요.');return;}const candidate=collect(),error=validate(candidate,axes[editingId],!!latest(editingId));if(error){feedback(error);return;}openNews(editingId,editor.querySelector('[type="submit"]'),candidate);const actions=el('div','decision-editor-actions');const back=el('button','outline','계속 수정하기');back.type='button';back.onclick=()=>$('#making-news-dialog').close();const publish=el('button','primary','이 내용 공개하기');publish.type='button';publish.onclick=()=>{
 const previous=clone(entry(editingId));database.projects[editingId]=publishRevision(previous,candidate,crypto.randomUUID(),new Date().toISOString());
 if(!persist()){database.projects[editingId]=previous;publish.textContent='저장 공간이 부족해요. 사진을 줄여주세요.';return;}
 publish.disabled=true;$('#making-news-dialog').close();editor.close();refresh();};actions.append(back,publish);$('#making-news-body').append(actions);};
 function mountManager(container){const section=el('section','decision-manager');section.append(el('span','making-eyebrow','MAKER JOURNAL'),el('h3','','의견과 최종 방향 관리'),el('p','decision-muted','세 제품의 참여 의견을 확인하고, 결정 이유와 다음 소식을 공개해요. 이 기기에서만 제공되는 전시용 관리 기능이에요.'));products.forEach(p=>{const row=el('div','decision-manager-row'),copy=el('div');copy.append(el('strong','',name(p.id)),el('small','',entry(p.id).draft?'임시 저장한 내용 있음':latest(p.id)?'공개됨 · '+date(latest(p.id).publishedAt):'아직 공개한 결정 없음'));const button=el('button','outline',latest(p.id)?'변경 안내 작성':'결정 내용 작성');button.type='button';button.onclick=()=>openEditor(p.id,button);row.append(copy,button);section.append(row)});container.prepend(section);}
 function latestButton(id){const info=summary(id),button=el('button','making-latest');button.type='button';button.append(el('span','making-eyebrow',info?(info.unread?'NEW NOTE · ':'MAKER NOTE · ')+info.date:'MAKER NOTE · 의견 수집 중'),el('strong','',info?.title||'당신의 취향을 모으고 있어요'),el('span','making-latest-summary',info?.summary||'최종 방향이 정해지면 검토 내용과 결정 이유를 전할게요.'),el('span','making-link','나의 취향과 제작 과정 보기'));button.onclick=()=>openNews(id,button);return button;}
 window.addEventListener('storage',e=>{if(e.key===key){try{const v=JSON.parse(e.newValue);if(v?.projects&&v?.seen){database=v;refresh();}}catch{}}});
 return {openNews,openEditor,mountManager,latestButton,summary};
};
})();
