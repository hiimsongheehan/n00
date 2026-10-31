(() => {
  // Replace null with the supplied image path when each final asset arrives.
  const modelImages = { all: null, tone: 'assets/categories/tone-hover.jpg', gloss: 'assets/categories/gloss-hover.jpg', scent: 'assets/categories/scent-hover.jpg' };
  Object.entries(modelImages).forEach(([category, src]) => {
    if (!src) return;
    const card = document.querySelector(`#categories [data-category="${category}"]`);
    if (!card) return;
    const image = new Image();
    image.className = 'category-model';
    image.alt = '';
    image.decoding = 'async';
    image.onload = () => card.classList.add('has-model');
    image.onerror = () => { card.classList.remove('has-model'); image.remove(); };
    card.querySelector('.cat-art').append(image);
    image.src = src;
  });
})();
