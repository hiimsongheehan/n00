/* PRINT: hands the card to a phone through a QR. The card travels inside the link, so nothing is uploaded. */
(() => {
 const cardPage = 'https://hiimsongheehan.github.io/n00/card.html';
 const dialog = document.querySelector('#card-qr-dialog');
 const text = selector => document.querySelector(selector).textContent.trim();
 function encode(card) {
  const bytes = new TextEncoder().encode(JSON.stringify(card));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
 }
 document.querySelector('#taste-print').addEventListener('click', () => {
  const src = document.querySelector('#result-object img')?.getAttribute('src') || '';
  const card = {
   t: text('#concept-name'),
   d: text('#concept-direction p'),
   k: text('#concept-keywords'),
   o: text('#concept-owner'),
   i: src.startsWith('assets/') ? src : '',
   r: document.querySelector('#taste-artifact').dataset.imageOrientation === 'horizontal' ? 1 : 0
  };
  const code = qrcode(0, 'M');
  code.addData(cardPage + '?c=' + encode(card), 'Byte');
  code.make();
  document.querySelector('#card-qr-code').innerHTML = code.createSvgTag({cellSize: 4, margin: 0, scalable: true});
  dialog.showModal();
 });
 document.querySelector('#card-qr-close').onclick = () => dialog.close();
})();
