(() => {
 const dialog=document.querySelector('#maker-note-dialog');
 const scroller=document.querySelector('#note-detail-scroll');
 const artwork=scroller.querySelector('.note-detail-image');
 const map=document.querySelector('#note-minimap');
 const marker=document.querySelector('#note-map-window');
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function sync(){
  if(!dialog.open||!dialog.classList.contains('image-detail'))return;
  const height=artwork.getBoundingClientRect().height;
  if(!height)return;
  const top=clamp(scroller.scrollTop/height,0,1);
  const end=clamp((scroller.scrollTop+scroller.clientHeight)/height,0,1);
  marker.style.top=`${top*100}%`;
  marker.style.height=`${Math.max(0,end-top)*100}%`;
  marker.hidden=top>=1;
  map.setAttribute('aria-valuenow',String(Math.round(clamp(scroller.scrollTop/Math.max(1,height-scroller.clientHeight),0,1)*100)));
 }
 function seek(event){
  const rect=map.getBoundingClientRect();
  const ratio=clamp((event.clientY-rect.top)/rect.height,0,1);
  scroller.scrollTo({top:clamp(ratio*artwork.getBoundingClientRect().height-scroller.clientHeight/2,0,scroller.scrollHeight-scroller.clientHeight),behavior:'instant'});
  sync();
 }
 let dragging=false;
 map.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();dragging=true;map.focus({preventScroll:true});map.setPointerCapture(e.pointerId);seek(e)});
 map.addEventListener('pointermove',e=>{if(dragging)seek(e)});
 map.addEventListener('pointerup',()=>dragging=false);
 map.addEventListener('pointercancel',()=>dragging=false);
 map.addEventListener('lostpointercapture',()=>dragging=false);
 map.addEventListener('keydown',e=>{
  let top=scroller.scrollTop;
  if(e.key==='Home')top=0;
  else if(e.key==='End')top=Math.max(0,artwork.getBoundingClientRect().height-scroller.clientHeight);
  else if(['ArrowDown','PageDown'].includes(e.key))top+=scroller.clientHeight*.8;
  else if(['ArrowUp','PageUp'].includes(e.key))top-=scroller.clientHeight*.8;
  else return;
  e.preventDefault();scroller.scrollTo({top,behavior:'instant'});
 });
 scroller.addEventListener('scroll',sync,{passive:true});
 artwork.addEventListener('load',sync);
 new ResizeObserver(sync).observe(scroller);
 new ResizeObserver(sync).observe(artwork);
 new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open','class']});
})();
