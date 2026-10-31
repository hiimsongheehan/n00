/* Shared exhibition funding data. Dates match the supplied disclosures. */
(()=>{
const schedule=Object.freeze({opensAt:'2026-11-04T00:00:00+09:00',closesAt:'2026-11-18T23:59:00+09:00',production:'2026. 11. 19 – 2027. 01. 06',deliveryWeeks:8});
const projects={balm:{...schedule,goal:1500000,base:0,people:0},blue:{...schedule,goal:1000000,base:1240000,people:98},rose:{...schedule,goal:1000000,base:780000,people:52},amber:{...schedule,goal:1100000,base:946000,people:43}};
const day=t=>Math.floor((new Date(t).getTime()+9*3600000)/86400000);
function period(id){const p=projects[id],format=t=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(t));return format(p.opensAt)+' – '+format(p.closesAt)+' 23:59 (한국 시간)';}
function timing(id,now=new Date()){
 const p=projects[id],before=now<new Date(p.opensAt),closed=now>=new Date(p.closesAt),days=Math.max(0,day(p.closesAt)-day(now));
 return {badge:closed?'마감':days===0?'D-DAY':`D-${days}`,description:closed?'펀딩이 마감됐어요.':before?new Date(p.opensAt).toLocaleDateString('ko-KR',{month:'long',day:'numeric'})+' 펀딩 오픈 예정':days===0?'오늘 펀딩 마감':`펀딩 마감까지 ${days}일`,status:closed?'CLOSED · 펀딩 마감':before?'UPCOMING · '+new Date(p.opensAt).toLocaleDateString('ko-KR',{month:'long',day:'numeric'})+' 오픈':`FUNDING · ${days===0?'오늘 마감':days+'일 남음'}`};
}
function totals(id,current,profiles){
 const snapshots=profiles.filter(p=>p.name!==current.nickname).map(p=>p.state).concat(current);
 const groups=snapshots.map(s=>s.records.filter(r=>r.product===id));
 const p=projects[id],total=p.base+groups.flat().reduce((sum,r)=>sum+r.amount,0);
 return {total,rate:total/p.goal*100,people:p.people+groups.filter(g=>g.length).length};
}
window.N00Funding={projects,timing,totals,period};
})();
