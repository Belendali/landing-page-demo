/* =========================================================
   两种点阵语言
   think —— 圆点呼吸波：发散、来回扫、没有方向感 = 正在思考
   exec  —— 方块推进：单向、可累积、本身就是进度 = 正在执行
   ========================================================= */
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const COL = { ink: '17,23,26', acc: '217,98,47', olive: '138,148,99', ok: '93,156,108', faint: '210,198,186' };

class DotField {
  constructor(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.mode = canvas.dataset.mode || 'think';
    this.progress = Number(canvas.dataset.progress || 0);
    this.t = Math.random() * 100;
    this.size();
  }
  size() {
    const w = this.c.clientWidth;
    if (!w) return false;
    const h = Number(this.c.getAttribute('height')) || 34;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.c.width = w * dpr; this.c.height = h * dpr;
    this.c.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = w; this.h = h;
    this.pitch = this.mode === 'think' ? 9 : 8;
    this.cols = Math.floor(w / this.pitch);
    this.rows = Math.max(1, Math.floor(h / this.pitch));
    return true;
  }
  draw() {
    if (!this.w && !this.size()) return;
    const { ctx, cols, rows, pitch } = this;
    ctx.clearRect(0, 0, this.w, this.h);
    this.t += REDUCED ? 0 : 0.045;

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const cx = x * pitch + pitch / 2;
        const cy = y * pitch + pitch / 2;

        if (this.mode === 'think') {
          // 来回扫过的波：半径与透明度一起呼吸
          const wave = Math.sin(x * 0.42 - this.t * 1.5 + Math.sin(y * 0.6 + this.t * 0.4));
          const e = (wave + 1) / 2;                       // 0..1
          const r = 0.9 + e * 2.0;
          const a = 0.1 + e * 0.55;
          const c = e > 0.72 ? COL.olive : COL.ink;
          ctx.fillStyle = `rgba(${c},${a})`;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, 6.283);
          ctx.fill();
        } else {
          // 单向推进：前沿之前实心，前沿处闪烁，之后留底
          const front = this.progress * cols;
          const dist = front - x;
          let a, c = COL.acc, s = 4.4;
          if (dist > 1.5) { a = 0.9; }
          else if (dist > -0.6) { a = 0.45 + 0.5 * Math.abs(Math.sin(this.t * 3 + y)); }
          else { a = 0.16; c = COL.faint; s = 3.6; }
          if (this.progress >= 0.999) { c = COL.ok; a = dist > 1.5 ? 0.85 : a; }
          ctx.fillStyle = `rgba(${c},${a})`;
          const rr = 1.4;
          const px = cx - s / 2, py = cy - s / 2;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(px, py, s, s, rr) : ctx.rect(px, py, s, s);
          ctx.fill();
        }
      }
    }
  }
}

const fields = new Set();
function mountFields(root = document) {
  root.querySelectorAll('canvas.dotfield').forEach((c) => {
    if (c.__f) return;
    const f = new DotField(c);
    c.__f = f;
    fields.add(f);
  });
}
function tick() {
  fields.forEach((f) => { if (f.c.isConnected && f.c.clientWidth) { if (!f.w) f.size(); f.draw(); } });
  requestAnimationFrame(tick);
}

/* =========================================================
   环境层：整块对话区的背景点阵
   思考 = 圆点呼吸波 / 执行 = 方块推进 / 待机 = 极淡静止
   消息本身保持普通气泡，状态交给背景说
   ========================================================= */
const bg = document.getElementById('bgField');
const bgx = bg.getContext('2d');
const BG = { mode: 'idle', progress: 0, t: 0, alpha: 0, target: 0 };

function bgSize() {
  const w = bg.clientWidth, h = bg.clientHeight;
  if (!w || !h) return false;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  bg.width = w * dpr; bg.height = h * dpr;
  bgx.setTransform(dpr, 0, 0, dpr, 0, 0);
  BG.w = w; BG.h = h;
  return true;
}
function bgSet(mode, progress) {
  BG.mode = mode;
  if (progress !== undefined) BG.progress = progress;
  BG.target = mode === 'idle' ? 0.1 : mode === 'think' ? 0.62 : 0.5;
}
function bgDraw() {
  if ((!BG.w || bg.width === 0) && !bgSize()) { requestAnimationFrame(bgDraw); return; }
  const { w, h } = BG;
  bgx.clearRect(0, 0, w, h);
  BG.t += REDUCED ? 0 : 0.04;
  BG.alpha += (BG.target - BG.alpha) * 0.05;

  const P = 15;
  const cols = Math.ceil(w / P), rows = Math.ceil(h / P);
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const cx = x * P + P / 2, cy = y * P + P / 2;
      if (BG.mode === 'exec') {
        // 方块由左向右推进，整块背景就是这次运行的进度
        const front = BG.progress * cols;
        const d = front - x;
        let a, c = COL.acc, s = 3.4;
        if (d > 1.5) a = 0.5;
        else if (d > -0.8) a = 0.3 + 0.7 * Math.abs(Math.sin(BG.t * 3 + y * 0.7));
        else { a = 0.16; c = COL.faint; s = 2.6; }
        bgx.fillStyle = `rgba(${c},${(a * BG.alpha).toFixed(3)})`;
        bgx.beginPath();
        bgx.roundRect ? bgx.roundRect(cx - s / 2, cy - s / 2, s, s, 1.1) : bgx.rect(cx - s / 2, cy - s / 2, s, s);
        bgx.fill();
      } else {
        // 圆点呼吸波：来回扫，没有方向
        const wave = Math.sin(x * 0.34 - BG.t * 1.35 + Math.sin(y * 0.5 + BG.t * 0.35));
        const e = (wave + 1) / 2;
        const r = 0.7 + e * 1.7;
        const c = e > 0.74 ? COL.olive : COL.ink;
        bgx.fillStyle = `rgba(${c},${((0.08 + e * 0.42) * BG.alpha).toFixed(3)})`;
        bgx.beginPath();
        bgx.arc(cx, cy, r, 0, 6.283);
        bgx.fill();
      }
    }
  }
  requestAnimationFrame(bgDraw);
}

/* ============ Clover 式失焦像素团 ============ */
const blob = document.getElementById('heroBlob');
const bctx = blob.getContext('2d');
let blobPal = [COL.faint, COL.faint];
let blobT = 0;
function drawBlob() {
  const w = blob.clientWidth, h = 132;
  if (!w) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (blob.width !== w * dpr) { blob.width = w * dpr; blob.height = h * dpr; }
  bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  bctx.clearRect(0, 0, w, h);
  blobT += REDUCED ? 0 : 0.006;
  const P = 22, cols = Math.ceil(w / P), rows = Math.ceil(h / P);
  const ccx = cols / 2 + Math.sin(blobT) * 1.1;
  const ccy = rows / 2 + Math.cos(blobT * 0.8) * 0.6;
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const d = Math.hypot(x - ccx, (y - ccy) * 1.35);
      const fall = Math.max(0, 1 - d / (cols * 0.36));
      if (fall <= 0.02) continue;
      const mix = Math.min(1, fall * 1.25 + Math.sin(x * 0.9 + y * 0.7 + blobT * 2) * 0.14);
      const c = mix > 0.55 ? blobPal[0] : blobPal[1];
      bctx.fillStyle = `rgba(${c},${(fall * 0.95).toFixed(3)})`;
      bctx.beginPath();
      const s = P - 3;
      bctx.roundRect ? bctx.roundRect(x * P + 1.5, y * P + 1.5, s, s, 5) : bctx.rect(x * P, y * P, s, s);
      bctx.fill();
    }
  }
  requestAnimationFrame(drawBlob);
}

/* ============ 页面元素 ============ */
const chatBody = document.getElementById('chatBody');
const taskList = document.getElementById('taskList');
const taskEmpty = document.getElementById('taskEmpty');
const artList = document.getElementById('artList');
const artEmpty = document.getElementById('artEmpty');
const memList = document.getElementById('memList');
const heroNum = document.getElementById('heroNum');
const heroSub = document.getElementById('heroSub');
const heroStage = document.getElementById('heroStage');
const taskCount = document.getElementById('taskCount');
const graphWrap = document.getElementById('graphWrap');

const AG = {
  codex: { cls: 'ag-cx', name: 'codex_fly' },
  claps: { cls: 'ag-ca', name: 'claps-agent' },
  claude: { cls: 'ag-cc', name: 'claude-code' },
  lead: { cls: 'ag-cx', name: 'codex_fly · 组长' },
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const scroll = () => { chatBody.scrollTop = chatBody.scrollHeight; };

function setStage(text, pal) {
  heroStage.textContent = text;
  if (pal) blobPal = pal;
}
function setHero(pct, sub) {
  heroNum.textContent = Math.round(pct);
  heroSub.textContent = sub;
}
function setMember(key, text, busy) {
  const el = document.querySelector(`[data-mst="${key}"]`);
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('busy', !!busy);
}

/* ============ 执行图 ============ */
const GNODES = [
  { id: 'goal', x: 108, y: 6, w: 62, h: 30, t: '目标', s: '选题清单' },
  { id: 'a', x: 6, y: 62, w: 78, h: 38, t: '抓取', s: 'codex_fly' },
  { id: 'b', x: 96, y: 62, w: 78, h: 38, t: '归类', s: 'claps-agent' },
  { id: 'c', x: 186, y: 62, w: 78, h: 38, t: '成稿', s: 'claude-code' },
  { id: 'gate', x: 96, y: 128, w: 78, h: 38, t: '人工审查', s: '你' },
  { id: 'out', x: 108, y: 190, w: 62, h: 30, t: '交付', s: 'artifact ×2' },
];
const GEDGES = ['M139 36 V48 H45 V60', 'M139 36 V48 H135 V60', 'M139 36 V48 H225 V60',
  'M45 100 V114 H135 V126', 'M135 100 V126', 'M225 100 V114 H135 V126', 'M135 166 V188'];
let gstate = {};
function renderGraph() {
  const nodes = GNODES.map((n) => {
    const st = gstate[n.id] || 'wait';
    return `<g class="gnode ${st}"><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9"/>
      <text x="${n.x + n.w / 2}" y="${n.y + n.h / 2 - 2}" class="n-t">${n.t}</text>
      <text x="${n.x + n.w / 2}" y="${n.y + n.h / 2 + 10}" class="n-s">${n.s}</text></g>`;
  }).join('');
  graphWrap.innerHTML = `<svg viewBox="0 0 270 228">
    <defs><marker id="a2" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="#d8cec4"/></marker></defs>
    <g stroke="#d8cec4" stroke-width="1.3" fill="none" marker-end="url(#a2)">
      ${GEDGES.map((d) => `<path d="${d}"/>`).join('')}
    </g>${nodes}</svg>`;
}
function gset(id, st) { gstate[id] = st; renderGraph(); }

/* ============ 聊天构件 ============ */
function addRow(html, cls = '') {
  const el = document.createElement('div');
  el.className = 'row ' + cls;
  el.innerHTML = html;
  chatBody.appendChild(el);
  mountFields(el);
  scroll();
  return el;
}
function agentRow(key, inner) {
  const a = AG[key];
  return addRow(`<i class="ag ${a.cls}" style="margin-top:2px"></i>
    <div class="col"><div class="who">${a.name}</div>${inner}</div>`);
}
function addTask(id, title, key, status = 'wait', label = '排队中') {
  taskEmpty.style.display = 'none';
  const a = AG[key];
  const el = document.createElement('div');
  el.className = 'task-card'; el.dataset.tk = id;
  el.innerHTML = `<div class="tk-t">${title}</div>
    <div class="tk-m"><i class="ag ${a.cls}"></i>${a.name}<span class="st ${status}">${label}</span></div>`;
  taskList.appendChild(el);
  taskCount.textContent = taskList.children.length;
}
function tkStatus(id, cls, label) {
  const s = document.querySelector(`[data-tk="${id}"] .st`);
  if (s) { s.className = 'st ' + cls; s.textContent = label; }
}
function addArtifact(kind, name, sub) {
  artEmpty.style.display = 'none';
  const el = document.createElement('div');
  el.className = 'art-item';
  el.innerHTML = `<span class="art-ic">${kind}</span>
    <span><span class="art-n">${name}</span><br><span class="art-s">${sub}</span></span>`;
  artList.appendChild(el);
}

/* ============ 主流程：TikTok 宠物账号选题 ============ */
let runToken = 0;

async function run() {
  const my = ++runToken;
  const alive = () => my === runToken;

  chatBody.innerHTML = ''; taskList.innerHTML = ''; artList.innerHTML = '';
  taskEmpty.style.display = ''; artEmpty.style.display = '';
  taskCount.textContent = '0';
  gstate = {}; renderGraph();
  setHero(0, '还没有开始'); setStage('待命', [COL.faint, COL.faint]); bgSet('idle');
  ['codex', 'claps', 'claude'].forEach((k) => setMember(k, '待命', false));

  await sleep(500); if (!alive()) return;

  // 1) 你提出目标
  addRow(`<div class="bub">帮我把 TikTok 宠物赛道的爆款账号整理一下，出一份下周能用的选题清单。</div>`, 'you');
  await sleep(900); if (!alive()) return;

  // 2) 组长思考 —— 背景切成圆点呼吸波
  setStage('思考中', [COL.olive, COL.ink]);
  setHero(4, '正在理解目标');
  bgSet('think');
  const think = agentRow('lead', `<div class="bub">
      <b>正在拆解目标</b><span class="ell"><i></i><i></i><i></i></span>
      <div class="think-note" id="thinkNote">读取项目记忆…</div>
      <div class="think-note" id="thinkLog">memory: 宠物赛道 → 北美 / 东南亚</div>
    </div>`);
  const notes = [
    ['读取项目记忆…', 'memory: 宠物赛道 → 北美 / 东南亚'],
    ['判断需要几个人…', 'plan: 抓取 → 归类 → 成稿'],
    ['挑选执行体…', 'assign: codex_fly / claps-agent / claude-code'],
  ];
  for (let i = 0; i < notes.length; i++) {
    await sleep(1050); if (!alive()) return;
    think.querySelector('#thinkNote').textContent = notes[i][0];
    think.querySelector('#thinkLog').textContent = notes[i][1];
    setHero(4 + i * 4, '正在拆解目标');
  }
  await sleep(800); if (!alive()) return;
  think.remove();

  // 3) 分工
  agentRow('lead', `<div class="bub">拆成三步，我来点兵：<b>codex_fly</b> 抓数据 → <b>claps-agent</b> 归类爆款结构 → <b>claude-code</b> 出清单。全程你可以在右边看进度。</div>`);
  addTask('t1', '抓取 50 个宠物账号数据', 'codex');
  addTask('t2', '归类爆款内容结构', 'claps');
  addTask('t3', '产出下周选题清单', 'claude');
  gset('goal', 'done');
  setStage('执行中', [COL.acc, COL.olive]);
  bgSet('exec', 0);
  await sleep(700); if (!alive()) return;

  // 4) 三个执行体依次开工 —— 方块推进
  const jobs = [
    { key: 'codex', tk: 't1', gid: 'a', task: '抓取 50 个宠物账号数据', dur: 4200, delay: 0,
      logs: ['连接 TikTok 开放数据…', '已抓取 12 / 50 个账号', '已抓取 31 / 50 个账号', '已抓取 50 / 50 · 清洗字段'] },
    { key: 'claps', tk: 't2', gid: 'b', task: '归类爆款内容结构', dur: 4200, delay: 1500,
      logs: ['载入 50 条样本…', '聚类：萌宠日常 / 剧情 / 知识科普', '提取共性钩子与完播特征', '归类完成 · 6 种结构'] },
    { key: 'claude', tk: 't3', gid: 'c', task: '产出下周选题清单', dur: 4000, delay: 3200,
      logs: ['读取归类结果…', '生成 12 条选题…', '补完播率与涨粉预估', '成稿 · 12 条选题'] },
  ];

  jobs.forEach((j) => {
    setTimeout(async () => {
      if (!alive()) return;
      setMember(j.key, '执行中', true);
      tkStatus(j.tk, 'doing', '进行中');
      gset(j.gid, 'run');
      const card = agentRow(j.key, `<div class="work-card">
          <div class="work-top">
            <div><div class="work-task">${j.task}</div></div>
            <span class="work-pct">0%</span>
          </div>
          <div class="prog"><i></i></div>
          <div class="work-log">${j.logs[0]}</div>
        </div>`);
      const barI = card.querySelector('.prog i');
      const pct = card.querySelector('.work-pct');
      const log = card.querySelector('.work-log');
      const t0 = performance.now();
      await new Promise((done) => {
        const step = () => {
          if (!alive()) return done();
          const p = Math.min(1, (performance.now() - t0) / j.dur);
          barI.style.width = (p * 100).toFixed(1) + '%';
          pct.textContent = Math.round(p * 100) + '%';
          log.textContent = j.logs[Math.min(j.logs.length - 1, Math.floor(p * j.logs.length))];
          if (p < 1) requestAnimationFrame(step); else done();
        };
        step();
      });
      if (!alive()) return;
      card.querySelector('.work-card').classList.add('done');
      pct.textContent = '完成 ✓';
      setMember(j.key, '待命', false);
      tkStatus(j.tk, 'done', '已完成');
      gset(j.gid, 'done');
    }, j.delay);
  });

  // 跟随整体进度
  const total = 3200 + 4000;
  const t0 = performance.now();
  await new Promise((done) => {
    const step = () => {
      if (!alive()) return done();
      const p = Math.min(1, (performance.now() - t0) / total);
      setHero(12 + p * 76, p < 1 ? '3 个执行体正在并行工作' : '等待你的确认');
      bgSet('exec', p);   // 整块背景就是这次运行的进度
      if (p < 1) requestAnimationFrame(step); else done();
    };
    step();
  });
  if (!alive()) return;
  await sleep(400); if (!alive()) return;

  // 5) 交付
  addArtifact('CSV', 'tiktok-pet-accounts.csv', '50 个账号 · 刚刚');
  addArtifact('MD', 'weekly-content-angles.md', '12 条选题 · 刚刚');
  agentRow('lead', `<div class="bub">三步都完成了，清单在这里 —— 12 条选题，带完播率与涨粉预估。
      <div class="art-chip"><span class="art-ic">MD</span>
        <span><span class="art-n">weekly-content-angles.md</span><br>
        <span class="art-s">12 条选题 · 已存入任务 #131</span></span></div>
    </div>`);
  gset('gate', 'gate');
  tkStatus('t3', 'review', '待审查');
  setStage('等你拍板', [COL.acc, COL.acc]);
  setHero(88, '等待你的确认');
  bgSet('idle');   // 活干完了，背景安静下来，等人
  await sleep(600); if (!alive()) return;

  const bar = document.createElement('div');
  bar.className = 'approve';
  bar.innerHTML = `<span>清单可以用吗？关键决定永远由你来做 ——</span>
    <button class="btn-ok">通过 ✓</button><button class="btn-no">送回修改</button>`;
  chatBody.appendChild(bar); scroll();

  const finish = async () => {
    if (!alive()) return;
    bar.remove();
    addRow(`<div class="bub">通过 ✓</div>`, 'you');
    tkStatus('t3', 'done', '已完成');
    gset('gate', 'done'); gset('out', 'done');
    setHero(100, '本次运行已完成');
    setStage('已完成', [COL.ok, COL.olive]);
    await sleep(500); if (!alive()) return;
    const m = document.createElement('div');
    m.className = 'mem-item';
    m.innerHTML = '选题清单要带 <b>完播率与涨粉数据</b>';
    memList.prepend(m);
    agentRow('lead', `<div class="bub">已归档，并记住了你的偏好：<b>选题清单要带完播率与涨粉数据</b>。下次直接按这个标准出。</div>`);
  };
  bar.querySelector('.btn-ok').addEventListener('click', finish);
  bar.querySelector('.btn-no').addEventListener('click', finish);
}

/* ============ 视图切换 ============ */
const VIEWS = { chat: 'viewChat', fleet: 'viewFleet', projects: 'viewProjects', memory: 'viewMemory', launch: 'viewLaunch', tasks: 'viewTasks', autos: 'viewAutos' };
const LABELS = { fleet: '执行体', projects: '项目', memory: '记忆', launch: 'Launch', tasks: 'Neo 任务', autos: '自动化' };
const chatBtn = document.querySelector('.nv[data-view="chat"]');
const moreBtn = document.getElementById('moreBtn');
const moreMenu = document.getElementById('moreMenu');
const moreLabel = document.getElementById('moreLabel');
const moreBadge = document.getElementById('moreBadge');
const closeMore = () => { moreMenu.classList.add('hidden'); moreBtn.classList.remove('open'); };

function showView(name) {
  Object.entries(VIEWS).forEach(([k, id]) => document.getElementById(id).classList.toggle('hidden', k !== name));
  const inChat = name === 'chat';
  chatBtn.classList.toggle('active', inChat);
  moreLabel.textContent = inChat ? '更多' : LABELS[name];
  moreBtn.classList.toggle('at-view', !inChat);
  moreBadge.classList.toggle('hidden', !inChat);
  document.querySelectorAll('.mm-item').forEach((i) => i.classList.toggle('active', i.dataset.view === name));
  closeMore();
  setTimeout(() => { mountFields(); fields.forEach((f) => f.size()); }, 40);
}
chatBtn.addEventListener('click', () => showView('chat'));
document.querySelectorAll('.mm-item').forEach((i) => i.addEventListener('click', () => showView(i.dataset.view)));
moreBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const closed = moreMenu.classList.toggle('hidden');
  moreBtn.classList.toggle('open', !closed);
});
document.addEventListener('click', (e) => { if (!e.target.closest('.more-wrap')) closeMore(); });

document.querySelectorAll('.ctx-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ctx-tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.pane').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    document.querySelector(`[data-pane="${tab.dataset.tab}"]`).classList.add('active');
  });
});
document.getElementById('replayBtn').addEventListener('click', run);
window.addEventListener('resize', () => fields.forEach((f) => f.size()));

mountFields();
renderGraph();
bgSize();
requestAnimationFrame(tick);
requestAnimationFrame(drawBlob);
requestAnimationFrame(bgDraw);
window.addEventListener('resize', bgSize);
run();
