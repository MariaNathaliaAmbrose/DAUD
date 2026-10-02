(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Toast: one small status message for every "button without a backend" */
  const toastEl = $('.toast'); let timer;
  const toast = msg => {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(timer); timer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  };

  /* Mobile nav */
  const burger = $('.burger'), nav = $('#nav');
  const setNav = open => { nav.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); };
  burger.addEventListener('click', () => setNav(!nav.classList.contains('open')));
  nav.addEventListener('click', e => e.target.closest('a') && setNav(false));
  document.addEventListener('keydown', e => e.key === 'Escape' && setNav(false));

  /* Search bar */
  const sBtn = $('.js-search'), sForm = $('.search');
  sBtn.addEventListener('click', () => {
    sForm.hidden = !sForm.hidden;
    sBtn.setAttribute('aria-expanded', !sForm.hidden);
    if (!sForm.hidden) $('input', sForm).focus();
  });

  /* Cart + wishlist (UI only) */
  let cart = 0; const cartN = $('.cart-n');
  $('.js-cart').addEventListener('click', () => toast(cart ? `${cart} item${cart > 1 ? 's' : ''} in your bag` : 'Your bag is empty'));
  $('.js-account').addEventListener('click', () => toast('Accounts open soon'));
  $$('.add').forEach(b => b.addEventListener('click', () => {
    cart++; cartN.textContent = cart; cartN.hidden = false; toast(`${b.dataset.name} added to bag`);
  }));
  $$('.heart').forEach(b => b.addEventListener('click', () =>
    b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true')));
  $$('.soon').forEach(a => a.addEventListener('click', e => { e.preventDefault(); toast('This page is coming soon'); }));
  $$('.js-news').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault(); toast("You're in the club. Check your inbox."); f.reset();
  }));

  /* Product filters + ?q= search from the header form */
  const prods = $$('.prod'), pills = $$('.pill');
  if (prods.length) {
    const apply = (tag, q = '') => {
      prods.forEach(p => {
        p.hidden = !((tag === 'all' || p.dataset.tags.includes(tag)) && p.textContent.toLowerCase().includes(q));
      });
      if (prods.every(p => p.hidden)) toast('No match. Try "run" or "trail".');
    };
    pills.forEach(b => b.addEventListener('click', () => {
      pills.forEach(x => x.setAttribute('aria-pressed', x === b));
      apply(b.dataset.tag);
    }));
    const q = (new URLSearchParams(location.search).get('q') || '').trim().toLowerCase();
    if (q) { pills.forEach(x => x.setAttribute('aria-pressed', false)); apply('all', q); }
  }

  /* Scroll reveal: only on headline blocks, not every element */
  const rv = $$('.rv');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .15 });
    rv.forEach(el => io.observe(el));
  } else rv.forEach(el => el.classList.add('in'));

  /* Illustrated separator: runner advances with scroll (progress 0..1 via --p) */
  const tracks = $$('.track');
  if (tracks.length) {
    let tick = false;
    const run = () => {
      tracks.forEach(t => {
        const r = t.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
        t.style.setProperty('--p', p.toFixed(3));
      });
      tick = false;
    };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* Marquee: clone the content once so the loop is seamless */
  const track = $('.marquee__track');
  if (track) {
    [...track.children].forEach(n => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.append(c); });
  }

  /* Image safety net: try other extensions, then show the halftone placeholder */
  const EXT = ['jpg', 'jpeg', 'png', 'webp'];
  const fix = img => {
    const i = +img.dataset.try || 0;
    if (i < EXT.length) {
      img.dataset.try = i + 1;
      img.src = img.getAttribute('src').replace(/\.\w+$/, '.' + EXT[i]);
    } else img.hidden = true;
  };
  $$('img').forEach(img => {
    img.addEventListener('error', () => fix(img));
    if (img.complete && !img.naturalWidth && img.currentSrc) fix(img);
  });
})();
