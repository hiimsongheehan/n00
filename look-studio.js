(() => {
  const studio = document.querySelector('#look-studio');
  const portrait = studio.querySelector('.look-portrait');
  const options = studio.querySelector('.look-options');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const looks = [
    {name:'오리지널', tone:'original'},
    {name:'라임 펄', tone:'lime'},
    {name:'실버 스모키', tone:'silver'},
    {name:'피치 글로우', tone:'peach'},
    {name:'래시 포인트', tone:'lash'}
  ];
  let selected = 0, visible = false;
  const layers = looks.map((look, i) => {
    const layer = document.createElement('div');
    layer.className = 'look-layer';
    const image = new Image();
    image.src = `assets/looks/${i}-wide.jpg`;
    image.alt = look.name + ' 메이크업';
    const video = document.createElement('video');
    // Full-screen 16:9 footage generated from opaque white source artwork.
    video.src = `assets/looks/${i}-wide.mp4?v=20261103`;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('aria-hidden', 'true');
    video.addEventListener('playing', () => {
      if (selected === i && visible && !reduced.matches && !document.hidden) layer.classList.add('is-playing');
      else video.pause();
    });
    video.addEventListener('error', () => layer.classList.remove('is-playing'));
    layer.append(image, video);
    portrait.append(layer);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'look-option';
    button.innerHTML = `<span class="look-swatch ${look.tone}" aria-hidden="true"></span><span>${look.name}</span>`;
    button.addEventListener('click', () => select(i, true));
    options.append(button);
    return {layer, video, button};
  });
  function playback() {
    layers.forEach(({video}, i) => {
      if (video.getAttribute('src') && i === selected && visible && !document.hidden && !reduced.matches && !video.ended) video.play().catch(() => {});
      else video.pause();
    });
  }
  function select(i, replay = false) {
    selected = i;
    layers.forEach(({layer, video, button}, j) => {
      layer.classList.toggle('is-selected', j === i);
      layer.setAttribute('aria-hidden', String(j !== i));
      button.setAttribute('aria-pressed', String(j === i));
      if (replay || j !== i) {
        video.pause();
        layer.classList.remove('is-playing');
        if (video.readyState > 0) video.currentTime = 0;
      }
    });
    document.querySelector('#look-name').textContent = looks[i].name;
    const nextFace = document.querySelector('.turn-face img');
    nextFace.src = `assets/looks/${i}-wide.jpg`;
    nextFace.alt = `${looks[i].name} — 선택한 메이크업 룩`;
    studio.dataset.look = String(i);
    playback();
  }
  const faces = document.querySelector('.faces-scroll');
  function updateVisibility() {
    const bounds = faces.getBoundingClientRect();
    visible = faces.dataset.lookVisible === 'true' && bounds.bottom > 0 && bounds.top < innerHeight;
    studio.querySelector('.look-controls').inert = Number(faces.dataset.bridge || 0) > .2;
    playback();
  }
  window.addEventListener('n00:portrait-progress', updateVisibility);
  document.addEventListener('visibilitychange', playback);
  reduced.addEventListener('change', () => {
    if (reduced.matches) layers.forEach(({layer}) => layer.classList.remove('is-playing'));
    playback();
  });
  window.addEventListener('n00:reset-visitor', () => select(0, true));
  select(0);
  updateVisibility();
})();
