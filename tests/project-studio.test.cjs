const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const store=new Map();
const context={window:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},indexedDB:{open(){throw Error('Unavailable')}},URL,console};vm.createContext(context);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../project-studio.js'),'utf8'),context);
(async()=>{const core=context.window.N00ProjectStudio;await core.ready;
const originalDraft=core.blank(),live={title:'공개본'};const original={id:'id',live,version:2,draft:originalDraft};const changed=core.blank();changed.title='수정 중';changed.guide={audience:'대상'};const stored=core.draftSnapshot(original,changed,{step:2,guideStep:3,candidates:[{seed:5}],generated:[]},'unused','2026-10-21');assert.equal(stored.id,'id');assert.equal(stored.live.title,'공개본');assert.equal(stored.version,2);assert.equal(original.draft.title,'');changed.title='추가 수정';assert.equal(stored.draft.title,'수정 중');const restored=JSON.parse(JSON.stringify(stored));assert.equal(restored.progress.step,2);assert.equal(restored.progress.guideStep,3);assert.equal(restored.progress.candidates[0].seed,5);assert.equal(restored.draft.guide.audience,'대상');assert.equal(core.draftSnapshot(null,core.blank(),{step:0},'new','now').live,null);console.log('PASS: draft snapshot isolates live publication, restores wizard/question/candidate state, preserves partial answers and supports new drafts.');
assert.equal(core.count(),0);assert.notEqual(core.validate(core.blank()),'');
const d=core.blank();Object.assign(d,{title:'프로젝트',pitch:'한 줄 제안',description:'기획 설명',direction:'기획 방향',poster:'assets/lickable/05.jpg'});d.rewards.forEach((r,i)=>r.description='구성 '+i);
assert.equal(core.validate(d),'');
const ready=core.readiness(d);assert.equal(ready.filter(row=>row.blocking).length,0);assert.equal(ready.find(row=>row.id==='video').status,'optional');assert.equal(ready.find(row=>row.id==='detail').status,'optional');const incomplete=core.blank();const issues=core.readiness(incomplete);assert.ok(issues.find(row=>row.id==='poster').blocking);assert.ok(issues.find(row=>row.id==='plan').blocking);assert.equal(issues.find(row=>row.id==='poster').step,2);const invalidFile={...d,video:'media:missing'};assert.ok(core.readiness(invalidFile).find(row=>row.id==='video').blocking);const invalidDate={...d,opensAt:'2026-02-30'};assert.ok(core.readiness(invalidDate).find(row=>row.id==='schedule').blocking);console.log('PASS: preparation checklist, missing field destinations, optional media, unavailable file and invalid dates.');
const p=core.product({id:'maker-test',live:d,version:1});assert.equal(p.goal,d.goal);assert.equal(p.pendingVideo,true);assert.equal(p.rewards[1].min,d.rewards[1].min);assert.equal(p.axes.length,3);p.axes[0][0]='수정';assert.notEqual(d.axes[0][0],'수정');
d.rewards[1].min=d.rewards[0].min;assert.notEqual(core.validate(d),'');d.rewards[1].min=18000;d.closesAt='2026-01-01';assert.notEqual(core.validate(d),'');
const cost=core.blank();let result=core.estimate(cost);
assert.equal(result.profit,306000);assert.equal(result.unitGain,8060);assert.equal(result.breakEven,78);assert.equal(result.targetUnits,100);assert.equal(result.recommendedGoal,1800000);
cost.economics.quantity=20;result=core.estimate(cost);assert.equal(result.produced,100);assert.equal(result.profit,-778800);
cost.economics.unit=20000;assert.equal(core.estimate(cost).breakEven,null);
cost.economics.fee=100;assert.equal(core.estimate(cost).valid,false);
cost.economics.fee=8;cost.economics.unit=4500;cost.economics.quantity=1.5;assert.equal(core.estimate(cost).valid,false);
for(const category of ['care','tone','gloss','scent']){const idea=core.suggestIdea(category);assert.equal(idea.category,category);assert.notEqual(core.suggestIdea(category,idea.seed).seed,idea.seed);const old=core.blank();old.poster='my-poster';const applied=core.applyIdea(old,idea);assert.equal(applied.poster,'my-poster');assert.equal(applied.title,idea.format);assert.equal(old.title,'');assert.equal(applied.axes.length,3);}
assert.equal(Object.hasOwn(p,'economics'),false,'private costs must not enter public product');
assert.equal(core.ideaCount(),24);
for(const category of ['all','care','tone','gloss','scent']){const batch=core.candidateIdeas(category);assert.equal(batch.length,3);assert.equal(new Set(batch.map(x=>x.seed)).size,3);if(category!=='all')assert.ok(batch.every(x=>x.category===category));const reroll=core.candidateIdeas(category,batch.map(x=>x.seed));assert.ok(reroll.every(x=>!batch.some(y=>y.seed===x.seed)));}
console.log('PASS: 24 candidates, three distinct filtered options, reroll avoids previous batch.');
console.log('PASS: economics including MOQ, loss, break-even and invalid inputs; random idea filters, explicit immutable application and private cost data.');
console.log('PASS: empty draft, valid draft, ascending rewards, schedule validation, product mapping, snapshot isolation, unavailable media DB fallback.');
})().catch(e=>{console.error(e);process.exitCode=1});
