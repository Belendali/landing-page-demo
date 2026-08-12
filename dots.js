// 点阵活跃度图：每个点是一个时间片，橙色 = 有任务在跑。
// 底部密集、向上稀疏，边缘不规则——像一条活着的负载曲线。
(() => {
  const DIM = '#2a2a30';
  const ACC = '#ff6a1f';
  const PITCH = 8;   // 网格步距
  const SIZE = 4.5;  // 点大小

  // 固定种子随机，保证每次渲染同一块画布图案一致
  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function build(canvas) {
    const seed = Number(canvas.dataset.dots || 7) * 977 + Number(canvas.dataset.i || 0) * 131 + 17;
    const rand = rng(seed);
    // 点阵密度对应真实数值：数字越大，橙点堆得越高
    const level = canvas.dataset.level !== undefined ? Number(canvas.dataset.level) : 0.36;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = Number(canvas.getAttribute('height')) || 120;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = Math.floor(w / PITCH);
    const rows = Math.floor(h / PITCH);

    // 每列一个填充高度，用几条正弦叠加做出起伏的"天际线"
    const heights = [];
    const p1 = rand() * 6.28, p2 = rand() * 6.28, p3 = rand() * 6.28;
    for (let c = 0; c < cols; c++) {
      const x = c / cols;
      const amp = 0.42 * level + 0.06;
      let v = level
        + amp * 0.42 * Math.sin(x * 9 + p1)
        + amp * 0.27 * Math.sin(x * 21 + p2)
        + amp * 0.19 * Math.sin(x * 37 + p3)
        + (rand() - 0.5) * amp * 0.38;
      heights.push(Math.max(0.04, Math.min(0.94, v)));
    }

    // 生成稳定的点阵状态
    const cells = [];
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const depth = (rows - r) / rows;      // 1 = 最底部
        const fill = heights[c];
        let p;
        if (depth <= fill) {
          p = 0.9 - 0.35 * (depth / fill);     // 越靠近顶端越稀
        } else {
          p = 0.16 * Math.exp(-(depth - fill) * 9); // 上方零星飞溅
        }
        cells.push({ c, r, on: rand() < p, p });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const cell of cells) {
        ctx.fillStyle = cell.on ? ACC : DIM;
        ctx.fillRect(cell.c * PITCH, cell.r * PITCH, SIZE, SIZE);
      }
    }
    draw();
    return { cells, draw, rand };
  }

  const canvases = [...document.querySelectorAll('canvas.dots')];
  const built = new Map();

  // 隐藏视图里的画布宽度为 0，等它真正可见时再构建
  function ensure(canvas) {
    const w = canvas.clientWidth;
    if (!w) return;
    const prev = built.get(canvas);
    if (prev && prev.w === w) return;
    const field = build(canvas);
    field.w = w;
    built.set(canvas, field);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) ensure(e.target); });
  });
  canvases.forEach((c, i) => { c.dataset.i = i; io.observe(c); ensure(c); });

  // 轻微的"活着"的感觉：每隔一会儿翻转边界上的几个点
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
      for (const f of built.values()) {
        if (!f.cells.length) continue;
        for (let i = 0; i < 6; i++) {
          const cell = f.cells[Math.floor(f.rand() * f.cells.length)];
          if (cell && cell.p > 0.04 && cell.p < 0.85) cell.on = f.rand() < cell.p;
        }
        f.draw();
      }
    }, 900);
  }

  // 顶栏切换视图后，补建刚显形的画布
  document.addEventListener('click', () => setTimeout(() => canvases.forEach(ensure), 60));

  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => canvases.forEach(ensure), 200);
  });
})();
