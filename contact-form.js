(() => {
 const address = 'songheehan18@gmail.com';
 const form = document.querySelector('#contact-form');
 const send = document.querySelector('#contact-send');
 const status = document.querySelector('#contact-status');
 const mailto = document.querySelector('#contact-mailto');
 function report(message, failed = false) {
  status.textContent = message;
  status.classList.toggle('is-error', failed);
 }
 function clear() {
  report('');
  mailto.hidden = true;
 }
 form.addEventListener('submit', async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (data._honey) return;
  clear();
  send.disabled = true;
  send.textContent = '보내는 중';
  try {
   const response = await fetch('https://formsubmit.co/ajax/' + address, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Accept: 'application/json'},
    body: JSON.stringify({name: data.name, email: data.email, message: data.message, _subject: '[N00] 사이트 문의', _template: 'table', _captcha: 'false'}),
    signal: AbortSignal.timeout(15000)
   });
   const result = await response.json();
   if (String(result.success) !== 'true') throw new Error('Not sent');
   form.reset();
   report('메일을 보냈어요. 고마워요!');
  } catch {
   // Keep the visitor's text and offer their own mail app instead.
   report('보내지 못했어요. 작성한 내용은 그대로 있어요.', true);
   mailto.href = 'mailto:' + address + '?subject=' + encodeURIComponent('[N00] 사이트 문의') + '&body=' + encodeURIComponent(data.message + '\n\n' + data.name + ' / ' + data.email);
   mailto.hidden = false;
  } finally {
   send.disabled = false;
   send.textContent = '메일 보내기';
  }
 });
 form.addEventListener('input', () => { if (status.textContent) clear(); });
 window.addEventListener('n00:reset-visitor', () => { form.reset(); clear(); });
})();
