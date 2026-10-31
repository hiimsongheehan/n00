(() => {
 const button = document.querySelector('#fullscreen-toggle');
 const feedback = document.querySelector('#fullscreen-feedback');
 const active = () => document.fullscreenElement || document.webkitFullscreenElement;
 function sync() {
  button.textContent = active() ? '전체화면 닫기 ⛶' : '전체화면 ⛶';
  button.setAttribute('aria-pressed', String(Boolean(active())));
  button.setAttribute('aria-label', active() ? '전체화면 닫기' : '전체화면 보기');
 }
 button.addEventListener('click', async () => {
  feedback.textContent = '';
  try {
   if (active()) {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    await exit.call(document);
   } else {
    const root = document.documentElement;
    const enter = root.requestFullscreen || root.webkitRequestFullscreen;
    if (!enter) throw new Error('Unsupported');
    await enter.call(root);
   }
   sync();
  } catch {
   feedback.textContent = '이 브라우저에서는 전체화면을 지원하지 않아요. 브라우저의 전체화면 메뉴를 이용해 주세요.';
  }
 });
 document.addEventListener('fullscreenchange', sync);
 document.addEventListener('webkitfullscreenchange', sync);
})();
