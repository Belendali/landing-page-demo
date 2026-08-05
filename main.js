// scroll-triggered reveal
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // chat sections animate messages sequentially — wait for the full sequence
        const wait = entry.target.querySelector('.cw-body') ? 4200 : 1600;
        setTimeout(() => entry.target.classList.add('reveal-done'), wait);
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.18 }
);
document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));

// hero hover effect — candlestick bars rise near the cursor (base.org-style, red theme)
(() => {
  const hero = document.querySelector('.hero');
  const canvas = document.getElementById('hero-fx');
  if (!hero || !canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const GRID = 26;
  const MOUSE_R = 80;
  const AGENT_R = 70;
  let cells = [];
  let W = 0, H = 0;

  // weighted red-led palette, light and airy: coral, salmon, blush, warm sand, brand red accent
  const PALETTE = [
    { c: '224,122,95', w: 4 },
    { c: '236,160,140', w: 3 },
    { c: '243,196,183', w: 2 },
    { c: '233,207,175', w: 2 },
    { c: '178,58,43', w: 1 },
  ];
  const pick = () => {
    let r = Math.random() * PALETTE.reduce((s, p) => s + p.w, 0);
    for (const p of PALETTE) { if ((r -= p.w) <= 0) return p.c; }
    return PALETTE[0].c;
  };

  function build() {
    const rect = hero.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cells = [];
    for (let x = GRID / 2; x < W; x += GRID) {
      for (let y = GRID / 2; y < H; y += GRID) {
        if (Math.random() < 0.45) continue; // keep it sparse
        cells.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          bw: 5 + Math.random() * 3,
          bh: 10 + Math.random() * 34,
          attack: 0.05 + Math.random() * 0.07, // per-cell lag → staggered, softer arrival
          color: pick(),
          e: 0,
        });
      }
    }
  }

  const mouse = { x: -9999, y: -9999 };
  hero.addEventListener('mousemove', (ev) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = ev.clientX - rect.left;
    mouse.y = ev.clientY - rect.top;
  });
  hero.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  // an idle "agent" drifts around and faintly lights bars, so the hero
  // breathes even before the first hover
  let t = Math.random() * 100;

  function frame() {
    t += 0.008;
    const ax = W * (0.5 + 0.38 * Math.sin(t * 0.9) * Math.cos(t * 0.33));
    const ay = H * (0.45 + 0.3 * Math.sin(t * 0.62 + 1.7));
    ctx.clearRect(0, 0, W, H);
    for (const cell of cells) {
      const dm = Math.hypot(cell.x - mouse.x, cell.y - mouse.y);
      let target = 0;
      if (dm < MOUSE_R) target = 1 - dm / MOUSE_R;
      const da = Math.hypot(cell.x - ax, cell.y - ay);
      if (da < AGENT_R) target = Math.max(target, 0.35 * (1 - da / AGENT_R));
      // ease toward target: slow attack gives the delayed, premium arrival; slower release for a soft tail
      cell.e += (target - cell.e) * (target > cell.e ? cell.attack : 0.04);
      if (cell.e < 0.012) continue;
      const ease = cell.e * cell.e * (3 - 2 * cell.e);
      const h = cell.bh * (0.3 + 0.7 * ease);
      const a = Math.min(1, cell.e * 1.2);
      ctx.fillStyle = `rgba(${cell.color},${a})`;
      ctx.beginPath();
      ctx.roundRect(cell.x - cell.bw / 2, cell.y - h / 2, cell.bw, h, 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  build();
  window.addEventListener('resize', build);
  requestAnimationFrame(frame);
})();

// language toggle — the choice carries into the product (onboarding reads it)
const pills = document.querySelectorAll('.lang-pill');
const savedLang = localStorage.getItem('claps-lang');
if (savedLang) {
  pills.forEach((p) => p.classList.toggle('is-active', p.dataset.lang === savedLang));
}
pills.forEach((pill) => {
  pill.addEventListener('click', () => {
    pills.forEach((p) => p.classList.remove('is-active'));
    pill.classList.add('is-active');
    localStorage.setItem('claps-lang', pill.dataset.lang);
  });
});
