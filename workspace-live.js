/* =========================================================
   两种点阵语言
   think —— 圆点涟漪：发散、没有方向 = 正在思考
   exec  —— 方块推进：单向、可累积 = 正在执行
   ========================================================= */
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const COL = { ink: '17,23,26', acc: '217,98,47', olive: '138,148,99', ok: '93,156,108', faint: '210,198,186' };

class DotField {
  constructor(canvas) {
    this.c = canvas; this.ctx = canvas.getContext('2d');
    this.mode = canvas.dataset.mode || 'think';
    this.progress = Number(canvas.dataset.progress || 0);
    this.t = Math.random() * 100; this.size();
  }
  size() {
    const w = this.c.clientWidth; if (!w) return false;
    const h = Number(this.c.getAttribute('height')) || 34;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.c.width = w * dpr; this.c.height = h * dpr; this.c.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = w; this.h = h; this.pitch = 8;
    this.cols = Math.floor(w / this.pitch); this.rows = Math.max(1, Math.floor(h / this.pitch));
    return true;
  }
  draw() {
    if (!this.w && !this.size()) return;
    const { ctx, cols, rows, pitch } = this;
    ctx.clearRect(0, 0, this.w, this.h);
    this.t += REDUCED ? 0 : 0.045;
    for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) {
      const cx = x * pitch + pitch / 2, cy = y * pitch + pitch / 2;
      if (this.mode === 'think') {
        const e = (Math.sin(x * 0.42 - this.t * 1.5 + Math.sin(y * 0.6 + this.t * 0.4)) + 1) / 2;
        ctx.fillStyle = `rgba(${e > 0.72 ? COL.olive : COL.ink},${0.1 + e * 0.55})`;
        ctx.beginPath(); ctx.arc(cx, cy, 0.9 + e * 2, 0, 6.283); ctx.fill();
      } else {
        const d = this.progress * cols - x;
        let a, c = COL.acc, s = 4.4;
        if (d > 1.5) a = 0.9;
        else if (d > -0.6) a = 0.45 + 0.5 * Math.abs(Math.sin(this.t * 3 + y));
        else { a = 0.16; c = COL.faint; s = 3.6; }
        if (this.progress >= 0.999 && d > 1.5) { c = COL.ok; a = 0.85; }
        ctx.fillStyle = `rgba(${c},${a})`;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(cx - s / 2, cy - s / 2, s, s, 1.4) : ctx.rect(cx - s / 2, cy - s / 2, s, s);
        ctx.fill();
      }
    }
  }
}
const fields = new Set();
function mountFields(root = document) {
  root.querySelectorAll('canvas.dotfield').forEach((c) => {
    if (c.__f) return; const f = new DotField(c); c.__f = f; fields.add(f);
  });
}
function tick() {
  fields.forEach((f) => { if (f.c.isConnected && f.c.clientWidth) { if (!f.w) f.size(); f.draw(); } });
  requestAnimationFrame(tick);
}

/* ============ 环境层：整块对话区的背景 ============ */
const bg = document.getElementById('bgField');
const bgx = bg.getContext('2d');
const P = 15;
const BG = { mode: 'idle', prev: 'idle', mix: 1, p: 0, pTarget: 0, t: 0, alpha: 0, target: 0.1 };

function bgSize() {
  const w = bg.clientWidth, h = bg.clientHeight; if (!w || !h) return false;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  bg.width = w * dpr; bg.height = h * dpr;
  bgx.setTransform(dpr, 0, 0, dpr, 0, 0);
  BG.w = w; BG.h = h; BG.cols = Math.ceil(w / P); BG.rows = Math.ceil(h / P);
  BG.phase = new Float32Array(BG.cols * BG.rows);
  BG.rate = new Float32Array(BG.cols * BG.rows);
  for (let i = 0; i < BG.phase.length; i++) { BG.phase[i] = Math.random() * 6.283; BG.rate[i] = 0.82 + Math.random() * 0.36; }
  return true;
}
function bgSet(mode, progress) {
  if (progress !== undefined) BG.pTarget = progress;
  if (mode !== BG.mode) { BG.prev = BG.mode; BG.mode = mode; BG.mix = 0; }
  BG.target = mode === 'idle' ? 0.09 : mode === 'think' ? 0.6 : 0.5;
}
function bgPaint(mode, mult) {
  if (mult <= 0.004) return;
  const { cols, rows, t } = BG;
  const breath = 0.72 + 0.28 * Math.sin(t * 0.42) * Math.cos(t * 0.17);
  const base = BG.alpha * mult * breath;
  for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) {
    const i = x * rows + y, ph = BG.phase[i], rt = BG.rate[i];
    const cx = x * P + P / 2, cy = y * P + P / 2;
    if (mode === 'exec') {
      const d = BG.p * cols - x;
      const idle = 0.5 + 0.5 * Math.sin(t * 1.1 * rt + ph);
      let a, c = COL.acc, s = 3.4;
      if (d > 2) a = 0.34 + idle * 0.24;
      else if (d > -1.2) { a = 0.34 + 0.66 * (0.5 + 0.5 * Math.sin(t * 2.6 * rt + ph)); s = 3.8; }
      else { a = 0.1 + idle * 0.08; c = COL.faint; s = 2.6; }
      const al = a * base; if (al < 0.006) continue;
      bgx.fillStyle = `rgba(${c},${al.toFixed(3)})`;
      bgx.beginPath();
      bgx.roundRect ? bgx.roundRect(cx - s / 2, cy - s / 2, s, s, 1.2) : bgx.rect(cx - s / 2, cy - s / 2, s, s);
      bgx.fill();
    } else {
      const fx = cols * (0.5 + 0.26 * Math.sin(t * 0.23));
      const fy = rows * (0.5 + 0.2 * Math.cos(t * 0.19));
      const dist = Math.hypot(x - fx, (y - fy) * 0.85);
      const e = Math.max(0, Math.min(1, (Math.sin(dist * 0.38 - t * 1.15 + ph * 0.5) * 0.62
        + Math.sin(x * 0.2 + y * 0.16 + t * 0.5 * rt) * 0.38 + 1) / 2));
      const soft = e * e * (3 - 2 * e);
      const al = (0.05 + soft * 0.42) * base; if (al < 0.006) continue;
      bgx.fillStyle = `rgba(${soft > 0.78 ? COL.olive : COL.ink},${al.toFixed(3)})`;
      bgx.beginPath(); bgx.arc(cx, cy, 0.55 + soft * 1.85, 0, 6.283); bgx.fill();
    }
  }
}
function bgDraw() {
  if ((!BG.w || bg.width === 0) && !bgSize()) { requestAnimationFrame(bgDraw); return; }
  bgx.clearRect(0, 0, BG.w, BG.h);
  BG.t += REDUCED ? 0 : 0.04;
  BG.alpha += (BG.target - BG.alpha) * 0.035;
  BG.p += (BG.pTarget - BG.p) * 0.06;
  BG.mix += (1 - BG.mix) * 0.028; if (BG.mix > 0.996) BG.mix = 1;
  if (BG.mix < 1) bgPaint(BG.prev, 1 - BG.mix);
  bgPaint(BG.mode, BG.mix);
  requestAnimationFrame(bgDraw);
}

/* ============ 失焦像素团 ============ */
const blob = document.getElementById('heroBlob');
const bctx = blob.getContext('2d');
let blobPal = [COL.faint, COL.faint], blobT = 0;
function drawBlob() {
  const w = blob.clientWidth, h = 132;
  if (!w) { requestAnimationFrame(drawBlob); return; }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (blob.width !== w * dpr) { blob.width = w * dpr; blob.height = h * dpr; }
  bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  bctx.clearRect(0, 0, w, h);
  blobT += REDUCED ? 0 : 0.006;
  const S = 22, cols = Math.ceil(w / S), rows = Math.ceil(h / S);
  const ccx = cols / 2 + Math.sin(blobT) * 1.1, ccy = rows / 2 + Math.cos(blobT * 0.8) * 0.6;
  for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) {
    const d = Math.hypot(x - ccx, (y - ccy) * 1.35);
    const fall = Math.max(0, 1 - d / (cols * 0.36));
    if (fall <= 0.02) continue;
    const mix = Math.min(1, fall * 1.25 + Math.sin(x * 0.9 + y * 0.7 + blobT * 2) * 0.14);
    bctx.fillStyle = `rgba(${mix > 0.55 ? blobPal[0] : blobPal[1]},${(fall * 0.95).toFixed(3)})`;
    bctx.beginPath();
    bctx.roundRect ? bctx.roundRect(x * S + 1.5, y * S + 1.5, S - 3, S - 3, 5) : bctx.rect(x * S, y * S, S - 3, S - 3);
    bctx.fill();
  }
  requestAnimationFrame(drawBlob);
}

/* =========================================================
   模型：Auto 自动匹配 —— 并且把「为什么选它」说出来
   ========================================================= */
const MODELS = [
  { id: 'auto', name: 'Auto', tag: '推荐', d: '按每一步的活自动挑',
    tip: '抓取清洗用快的，判断和写作用强的，全程自动切换。不确定选什么，就用它——省钱又不掉质量。',
    speed: '按需', cost: '最优' },
  { id: 'haiku', name: 'Claude Haiku 4.5', d: '快、便宜',
    tip: '结构化提取、批量清洗、简单分类。答案明确、量大的活交给它，几秒就出。',
    speed: '很快', cost: '$' },
  { id: 'sonnet', name: 'Claude Sonnet 4.5', d: '均衡、会判断',
    tip: '要理解上下文、做取舍、写得像人话的活。日常主力，大部分时候选它不会错。',
    speed: '中等', cost: '$$' },
  { id: 'opus', name: 'Claude Opus 4.5', d: '最强推理',
    tip: '复杂拆解、长链路推理、高要求的创意。慢一些也贵一些，关键的活再用。',
    speed: '较慢', cost: '$$$' },
];
let currentModel = 'auto';
const modelBtn = document.getElementById('modelBtn');
const modelMenu = document.getElementById('modelMenu');
const modelLabel = document.getElementById('modelLabel');

modelMenu.innerHTML = `<div class="mo-label">模型</div>` + MODELS.map((m) => `
  <button class="mo-item ${m.id === 'auto' ? 'on' : ''}" data-m="${m.id}">
    <span class="mo-main">
      <span class="mo-n">${m.name}${m.tag ? `<i class="mo-tag">${m.tag}</i>` : ''}</span>
      <span class="mo-d">${m.d}</span>
    </span>
    <span class="mo-cost">${m.cost}</span>
    <span class="mo-tip"><b>${m.name}</b><p>${m.tip}</p>
      <span class="tip-row"><span>速度 <b>${m.speed}</b></span><span>成本 <b>${m.cost}</b></span></span>
    </span>
  </button>`).join('');

modelBtn.addEventListener('click', (e) => { e.stopPropagation(); modelMenu.classList.toggle('hidden'); });
document.addEventListener('click', (e) => { if (!e.target.closest('.model-wrap')) modelMenu.classList.add('hidden'); });
modelMenu.querySelectorAll('.mo-item').forEach((b) => b.addEventListener('click', () => {
  currentModel = b.dataset.m;
  modelMenu.querySelectorAll('.mo-item').forEach((x) => x.classList.toggle('on', x === b));
  const m = MODELS.find((x) => x.id === currentModel);
  modelLabel.textContent = m.id === 'auto' ? 'Auto' : m.name.replace('Claude ', '');
  modelBtn.querySelector('.auto-spark').style.display = m.id === 'auto' ? '' : 'none';
  modelMenu.classList.add('hidden');
}));
// Auto 时按活儿挑；手动选了就一直用那个
function pickModel(want, why) {
  if (currentModel !== 'auto') {
    const m = MODELS.find((x) => x.id === currentModel);
    return { name: m.name.replace('Claude ', ''), why: '你手动指定的模型', auto: false };
  }
  const m = MODELS.find((x) => x.id === want);
  return { name: m.name.replace('Claude ', ''), why, auto: true };
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
const setStage = (t, pal) => { heroStage.textContent = t; if (pal) blobPal = pal; };
// 百分比属于「当前阶段的这一轮」，不是整个项目
const setHero = (p, s) => {
  heroNum.textContent = Math.round(p);
  heroSub.textContent = s;
  if (sIdx >= 0) stages[sIdx].pct = p;
};
// 右栏执行体卡：状态 / 当前在做什么 / 用的哪个模型
function setExec(k, status, task, model) {
  const card = document.querySelector(`[data-mst="${k}"]`);
  if (!card) return;
  const busy = status === '执行中';
  card.classList.toggle('busy', busy);
  card.querySelector('.ex-st').textContent = status;
  if (task !== undefined) card.querySelector('[data-extask]').textContent = task;
  if (model !== undefined) card.querySelector('[data-exmodel]').textContent = model;
}

/* =========================================================
   产出文档：可以点开来看，并且能对照版本
   ========================================================= */
const ANGLES = [
  { t: '第一次见到雪的柯基', k: '萌宠日常', p: 62, h: '0–3s 直接怼狗子懵住的特写，不加旁白' },
  { t: '猫主子偷吃被抓包全过程', k: '剧情', p: 68, h: '开场就是「咔嚓」一声定格，再倒回去讲' },
  { t: '宠物日常记录', k: '日常', p: 41, v2t: '上班前和狗告别，它以为你不回来了', v2k: '情绪剧情', v2p: 74,
    h: '第 1 秒给狗扒门缝的眼神，别配音乐', changed: true },
  { t: '三只狗抢一个球的战术分析', k: '拟人解说', p: 71, h: '用体育解说腔开场：「比赛第 3 分钟」' },
  { t: '兽医告诉你狗狗最怕的 5 件事', k: '知识科普', p: 54, h: '先抛第 5 名，勾着看完才给第 1 名' },
  { t: '流浪猫第一次进家门的 30 天', k: '长线剧情', p: 76, h: '开头放第 30 天的样子，再切回第 1 天' },
  { t: '分享养宠心得', k: '杂谈', p: 38, v2t: '领养前 vs 领养后 90 天对比', v2k: '对比', v2p: 72,
    h: '左右分屏同框，前 3 秒不说话只给画面', changed: true },
  { t: '给猫做猫饭的一天', k: '生活流', p: 58, h: '第 1 秒先给猫舔嘴的特写，再回到备菜' },
  { t: '狗狗听懂人话的瞬间合集', k: '高能合集', p: 65, h: '把最炸的那条放开头，不留铺垫' },
  { t: '大型犬 vs 小型犬的性格反差', k: '对比', p: 60, h: '开场两只同框做同一件事，反差自己说话' },
  { t: '宠物医院账单大公开', k: '干货', p: 52, h: '第 1 秒把总金额糊脸上，再讲怎么花的' },
  { t: '深夜守着生病的猫', k: '情绪向', p: 70, h: '开场只有呼吸声和监护仪，不解释' },
];
let docV = 'v2';
const docOverlay = document.getElementById('docOverlay');
const docBody = document.getElementById('docBody');
const docVers = document.getElementById('docVers');

function renderDoc() {
  const v2 = docV === 'v2';
  document.getElementById('docMeta').textContent = v2 ? 'v2 · 12 条选题 · 全部带钩子' : 'v1 · 12 条选题';
  document.getElementById('docFootNote').textContent = v2
    ? '存放在任务 #131 · 对比 v1：改写 2 条 · 新增 12 个钩子'
    : '存放在任务 #131 · 首版';
  docVers.innerHTML = ['v1', 'v2'].map((v) =>
    `<button class="dv-btn ${v === docV ? 'on' : ''}" data-v="${v}">${v}</button>`).join('');
  docVers.querySelectorAll('.dv-btn').forEach((b) => b.addEventListener('click', () => { docV = b.dataset.v; renderDoc(); }));

  docBody.innerHTML = `<h3>下周选题清单 · TikTok 宠物赛道</h3>
    <div class="d-sub">基于 50 个北美 / 东南亚账号 · 6 种爆款结构 · ${v2 ? '每条附 3 秒钩子' : '完播率为同类账号中位数'}</div>
    ${ANGLES.map((a, i) => {
      const t = v2 && a.v2t ? a.v2t : a.t;
      const k = v2 && a.v2k ? a.v2k : a.k;
      const p = v2 && a.v2p ? a.v2p : a.p;
      return `<div class="d-item">
        <div class="d-top"><span class="d-i">${String(i + 1).padStart(2, '0')}</span>
          <span class="d-t ${v2 && a.changed ? 'changed' : ''}">${t}</span></div>
        <div class="d-meta">结构 ${k}<span>预估完播 ${p}%</span></div>
        ${v2 ? `<div class="d-hook"><b>开头 3 秒</b>${a.h}</div>` : ''}
      </div>`;
    }).join('')}`;
}
function openDoc(v) { docV = v || docV; renderDoc(); docOverlay.classList.remove('hidden'); }
document.getElementById('docClose').addEventListener('click', () => docOverlay.classList.add('hidden'));
docOverlay.addEventListener('click', (e) => { if (e.target === docOverlay) docOverlay.classList.add('hidden'); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') docOverlay.classList.add('hidden'); });
// 聊天里和右栏的产出都能点开
document.addEventListener('click', (e) => {
  const chip = e.target.closest('.art-chip, .art-card .art-head');
  if (chip && chip.dataset.doc !== 'no') { openDoc(chip.dataset.v || docV); return; }
  const open = e.target.closest('[data-open]');
  if (open) { openDoc(open.dataset.open); return; }
  const follow = e.target.closest('[data-follow]');
  if (follow) { follow.closest('.next-row').querySelectorAll('[data-follow]').forEach((b) => (b.disabled = true)); followUp(follow.dataset.follow); }
});

/* =========================================================
   阶段：每个阶段各自的进度；修改 = 同阶段新一轮，不倒退
   ========================================================= */
const stages = [];
let sIdx = -1;
const stageBadge = document.getElementById('stageBadge');
const stageName = document.getElementById('stageName');
const stageStrip = document.getElementById('stageStrip');

function renderStages() {
  stageBadge.classList.toggle('hidden', sIdx < 0);
  if (sIdx < 0) { stageName.textContent = '还没有开始'; stageStrip.innerHTML = ''; return; }
  const s = stages[sIdx];
  stageBadge.textContent = `阶段 ${sIdx + 1}`;
  stageName.textContent = s.name + (s.rounds > 1 ? ` · 第 ${s.rounds} 轮` : '');
  // 之前完成的阶段列在下面，进度各自留着
  stageStrip.innerHTML = stages.slice(0, sIdx).map((x, i) =>
    `<div class="stage-row done"><i>阶段 ${i + 1}</i><span class="sr-n">${x.name}</span>
      <span class="sr-s">${x.rounds} 轮 · 完成 ✓</span></div>`).join('');
}
function startStage(name) {
  sIdx++;
  stages.push({ name, rounds: 1, pct: 0 });
  renderStages();
}
function nextRound() {
  if (sIdx < 0) return;
  stages[sIdx].rounds++;
  stages[sIdx].pct = 0;
  renderStages();
}
function finishStage() { if (sIdx >= 0) stages[sIdx].pct = 100; renderStages(); }

/* ============ 从团队里加人 ============ */
// 团队里有、但还没进这个对话的执行体
const POOL = [
  { id: 'p1', cls: 'ag-cc', name: 'claude-code', loc: '服务器', good: '擅长 代码 / 重构 · 常驻不休眠', hb: '心跳 3s' },
  { id: 'p2', cls: 'ag-cx', name: 'codex_k8s', loc: '云端', good: '擅长 批处理 / 长任务 · 可并发 8 路', hb: '心跳 4s' },
  { id: 'p3', cls: 'ag-ca', name: 'claps-agent-2', loc: '云端', good: '擅长 网页调研 / 抓取', hb: '心跳 5s' },
];
const joined = new Set();
const addBtn = document.getElementById('addExecBtn');
const addPanel = document.getElementById('addPanel');
const apList = document.getElementById('apList');

function renderPool() {
  const left = POOL.filter((p) => !joined.has(p.id));
  apList.innerHTML = left.length ? left.map((p) => `
    <div class="ap-row" data-p="${p.id}">
      <i class="ag ${p.cls}"></i>
      <span class="ap-main">
        <span class="ap-n">${p.name}<i class="ap-loc">${p.loc}</i></span>
        <span class="ap-good">${p.good}</span>
      </span>
      <button class="ap-join">加入</button>
    </div>`).join('')
    : `<div class="ap-empty">团队里的执行体都在这个对话里了。<br>需要更多就接入一台新的。</div>`;
  apList.querySelectorAll('.ap-join').forEach((b) => b.addEventListener('click', () => {
    const id = b.closest('.ap-row').dataset.p;
    const p = POOL.find((x) => x.id === id);
    joined.add(id);
    // 加到右栏执行体列表
    const card = document.createElement('div');
    card.className = 'exec-card';
    card.dataset.mst = id;
    card.innerHTML = `<div class="ex-top"><i class="ag ${p.cls}"></i><span class="ex-n">${p.name}</span><span class="ex-st">待命</span></div>
      <div class="ex-task" data-extask>刚加入，还没有派活</div>
      <div class="ex-foot"><span data-exmodel>—</span><span class="ex-hb">${p.hb} · ${p.loc}</span></div>`;
    addBtn.before(card);
    // tab 上的数字跟着走
    const n = document.querySelector('.ctx-tab[data-tab="run"] .t-n');
    n.textContent = document.querySelectorAll('.exec-card').length;
    // 对话里留一条系统提示
    const note = document.createElement('div');
    note.className = 'sys-note';
    note.textContent = `${p.name} 已加入这个对话 · 现在可以 @ 它派活`;
    chatBody.appendChild(note);
    chatBody.scrollTop = chatBody.scrollHeight;
    renderPool();
  }));
}
addBtn.addEventListener('click', () => {
  const open = addPanel.classList.toggle('hidden');
  addBtn.classList.toggle('on', !open);
  if (!open) renderPool();
});
document.getElementById('apClose').addEventListener('click', () => {
  addPanel.classList.add('hidden');
  addBtn.classList.remove('on');
});

/* ============ 执行图：两幕 + 反馈回路 ============ */
const NODES = {
  goal: { x: 100, y: 6, w: 70, h: 28, t: '目标', s: '选题清单' },
  a: { x: 4, y: 54, w: 78, h: 36, t: '抓取', s: 'codex_fly' },
  b: { x: 96, y: 54, w: 78, h: 36, t: '归类', s: 'claps-agent' },
  c: { x: 188, y: 54, w: 78, h: 36, t: '成稿', s: 'claude-code' },
  g1: { x: 96, y: 110, w: 78, h: 36, t: '人工审查', s: '你 · 第 1 次' },
  v1: { x: 100, y: 166, w: 70, h: 28, t: 'v1', s: '12 条选题' },
  fb: { x: 88, y: 214, w: 94, h: 36, t: '你的反馈', s: '要更具体 + 钩子' },
  d: { x: 30, y: 270, w: 78, h: 36, t: '复核', s: 'claps-agent' },
  e: { x: 152, y: 270, w: 78, h: 36, t: '改写', s: 'claude-code' },
  g2: { x: 96, y: 326, w: 78, h: 36, t: '人工审查', s: '你 · 第 2 次' },
  v2: { x: 96, y: 382, w: 78, h: 32, t: 'v2 · 交付', s: '可以发布' },
};
const EDGES = [['goal','a'],['goal','b'],['goal','c'],['a','g1'],['b','g1'],['c','g1'],
  ['g1','v1'],['v1','fb'],['fb','d'],['fb','e'],['d','g2'],['e','g2'],['g2','v2']];
let gstate = {};
function elbow(f, t) {
  const fx = f.x + f.w / 2, fy = f.y + f.h, tx = t.x + t.w / 2, ty = t.y;
  const my = fy + (ty - fy) / 2;
  return fx === tx ? `M${fx} ${fy} V${ty - 2}` : `M${fx} ${fy} V${my} H${tx} V${ty - 2}`;
}
function renderGraph() {
  const live = Object.keys(gstate);
  const es = EDGES.filter(([a, b]) => live.includes(a) && live.includes(b))
    .map(([a, b]) => `<path d="${elbow(NODES[a], NODES[b])}"/>`).join('');
  const ns = live.map((k) => {
    const n = NODES[k], st = gstate[k];
    return `<g class="gnode ${st}"><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="9"/>
      <text x="${n.x + n.w / 2}" y="${n.y + n.h / 2 - 2}" class="n-t">${n.t}</text>
      <text x="${n.x + n.w / 2}" y="${n.y + n.h / 2 + 10}" class="n-s">${n.s}</text></g>`;
  }).join('');
  const maxY = live.length ? Math.max(...live.map((k) => NODES[k].y + NODES[k].h)) + 10 : 60;
  graphWrap.innerHTML = `<svg viewBox="0 0 270 ${maxY}">
    <defs><marker id="a2" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="#d8cec4"/></marker></defs>
    <g stroke="#d8cec4" stroke-width="1.3" fill="none" marker-end="url(#a2)">${es}</g>${ns}</svg>`;
}
const gset = (k, st) => { gstate[k] = st; renderGraph(); };

/* ============ 聊天构件 ============ */
function addRow(html, cls = '') {
  const el = document.createElement('div');
  el.className = 'row ' + cls; el.innerHTML = html;
  chatBody.appendChild(el); mountFields(el); scroll(); return el;
}
const agentRow = (k, inner) => addRow(
  `<i class="ag ${AG[k].cls}" style="margin-top:2px"></i><div class="col"><div class="who">${AG[k].name}</div>${inner}</div>`);

function addTask(id, title, key, meta) {
  taskEmpty.style.display = 'none';
  const el = document.createElement('div');
  el.className = 'task-card'; el.dataset.tk = id;
  el.innerHTML = `<div class="tk-t">${title}</div>
    <div class="tk-m"><i class="ag ${AG[key].cls}"></i>${AG[key].name}<span class="st wait">排队中</span></div>
    <div class="tk-meta" data-meta>${meta || ''}</div>`;
  taskList.appendChild(el);
  taskCount.textContent = taskList.children.length;
}
function tkStatus(id, cls, label, meta) {
  const card = document.querySelector(`[data-tk="${id}"]`);
  if (!card) return;
  const s = card.querySelector('.st'); s.className = 'st ' + cls; s.textContent = label;
  if (meta) card.querySelector('[data-meta]').innerHTML = meta;
}
// 产出按版本累积
const artState = {};
function addArtifact(key, kind, name, sub, version, note) {
  artEmpty.style.display = 'none';
  if (!artState[key]) {
    const el = document.createElement('div');
    el.className = 'art-card'; el.dataset.art = key;
    const openable = key === 'md';
    el.innerHTML = `<div class="art-head" ${openable ? '' : 'data-doc="no"'}><span class="art-ic">${kind}</span>
        <span><span class="art-n">${name}</span><br><span class="art-s">${sub}</span></span>
        <span class="art-v">${version}</span></div><div data-vers></div>`;
    artList.appendChild(el);
    artState[key] = el;
  }
  const el = artState[key];
  el.querySelector('.art-head').dataset.v = version;
  el.querySelector('.art-v').textContent = version;
  el.querySelector('.art-s').textContent = sub;
  const v = document.createElement('div');
  v.className = 'ver';
  v.innerHTML = `<i>${version}</i><span class="vd">${note}</span><span class="vt">刚刚</span>`;
  el.querySelector('[data-vers]').prepend(v);
}
function addMemory(html) {
  const m = document.createElement('div');
  m.className = 'mem-item'; m.innerHTML = html;
  memList.prepend(m);
}

/* =========================================================
   完整流程：提需求 → 交付 v1 → 你的反馈 → 迭代 v2 → 可以发布
   ========================================================= */
let runToken = 0;

async function runJob(j, alive) {
  setExec(j.key, '执行中', j.task, j.pick.name);
  tkStatus(j.tk, 'doing', '进行中', `模型 ${j.pick.name}`);
  if (j.gid) gset(j.gid, 'run');
  const card = agentRow(j.key, `<div class="work-card">
      <div class="work-top"><div class="work-task">${j.task}</div><span class="work-pct">0%</span></div>
      <div class="prog"><i></i></div>
      <div class="work-log">${j.logs[0]}</div>
      <div class="pick"><i class="sp"></i>${j.pick.auto ? 'Auto 选了' : '使用'} <b>${j.pick.name}</b> · ${j.pick.why}</div>
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
  setExec(j.key, '已完成', j.task);
  tkStatus(j.tk, 'done', '已完成', `模型 ${j.pick.name} · 耗时 ${(j.dur / 1000).toFixed(1)}s`);
  if (j.gid) gset(j.gid, 'done');
}

/* ---------- 追加需求：同阶段加一轮，还是开新阶段 ---------- */
const REVISE_RE = /改|换|调整|优化|再加|多加|补|删|不要|太|不够|重写|润色|细化|扩展|再来|继续/;
let tkSeq = 10;

async function followUp(text) {
  const my = ++runToken;
  const alive = () => my === runToken;
  addRow(`<div class="bub">${text}</div>`, 'you');
  await sleep(650); if (!alive()) return;
  setStage('判断中', [COL.olive, COL.ink]); bgSet('think');
  await sleep(950); if (!alive()) return;

  const isRevise = sIdx >= 0 && REVISE_RE.test(text) && !/另外|再做一版|新做|顺便做/.test(text);

  if (isRevise) {
    // 只是加需求 —— 阶段不变，进入下一轮，之前的进度不作废
    nextRound();
    const s = stages[sIdx];
    addRow(`<div class="route-note"><i></i>判断：<b>在原有基础上增加</b> · 还是「${s.name}」这个阶段，进入第 ${s.rounds} 轮</div>`);
    await sleep(500); if (!alive()) return;
    agentRow('lead', `<div class="bub">不用重来，在 v2 基础上补就行。<b>claude-code</b> 去加 5 条备选，标准照旧带钩子。</div>`);
    const tk = 't' + (++tkSeq);
    addTask(tk, '补 5 条备选选题', 'claude');
    setStage('执行中', [COL.acc, COL.olive]); bgSet('exec', 0);
    const job = { key: 'claude', tk, task: '补 5 条备选选题', dur: 3400,
      pick: pickModel('sonnet', '同一份稿子上续写，保持风格一致'),
      logs: ['读取 v2 定稿…', '按 6 种结构补题…', '给新增的补钩子…', '完成 · 新增 5 条'] };
    setTimeout(() => alive() && runJob(job, alive), 200);
    await trackProgress(3700, 10, 86, alive); if (!alive()) return;
    await sleep(300); if (!alive()) return;
    addArtifact('md', 'MD', 'weekly-content-angles.md', '17 条选题 · 全部带钩子', 'v3', '在 v2 上新增 5 条备选');
    agentRow('lead', `<div class="bub">加好了，现在一共 17 条。
        <div class="art-chip" data-v="v2"><span class="art-ic">MD</span>
          <span><span class="art-n">weekly-content-angles.md</span><br>
          <span class="art-s">v3 · 新增 5 条备选</span></span><span class="art-open">点开看 →</span></div>
      </div>`);
    setHero(100, '这一轮完成了'); setStage('可以发布', [COL.ok, COL.olive]); finishStage(); bgSet('idle');
    return;
  }

  // 换了一件事 —— 开新阶段，上一个阶段的成果留着
  const name = /对比|竞品/.test(text) ? '竞品对比表' : '新的一件事';
  addRow(`<div class="stage-note"><span class="sn-tag">新阶段</span>
    这跟刚才不是一件事，我开一个新阶段：<b>${name}</b>。上一个阶段的进度和产出都留着，不会被冲掉。</div>`);
  await sleep(700); if (!alive()) return;
  startStage(name);
  agentRow('lead', `<div class="bub">这次两个人就够：<b>codex_fly</b> 抓竞品账号的公开数据，<b>claps-agent</b> 做维度对齐出表。</div>`);
  const tkA = 't' + (++tkSeq), tkB = 't' + (++tkSeq);
  addTask(tkA, '抓取 12 个竞品账号数据', 'codex');
  addTask(tkB, '维度对齐 · 出对比表', 'claps');
  setStage('执行中', [COL.acc, COL.olive]); bgSet('exec', 0);
  const jobs = [
    { key: 'codex', tk: tkA, task: '抓取 12 个竞品账号数据', dur: 3200, delay: 0,
      pick: pickModel('haiku', '又是结构化抓取，用快的'),
      logs: ['锁定 12 个对标账号…', '已抓取 5 / 12', '已抓取 12 / 12', '清洗完成'] },
    { key: 'claps', tk: tkB, task: '维度对齐 · 出对比表', dur: 3400, delay: 1400,
      pick: pickModel('sonnet', '要定维度、做取舍'),
      logs: ['确定对比维度…', '发布频率 / 结构 / 完播 / 涨粉', '逐个账号填表…', '对比表完成'] },
  ];
  jobs.forEach((j) => setTimeout(() => alive() && runJob(j, alive), j.delay));
  await trackProgress(4800, 8, 88, alive); if (!alive()) return;
  await sleep(300); if (!alive()) return;
  addArtifact('cmp', 'CSV', 'competitor-matrix.csv', '12 个账号 · 5 个维度', 'v1', '首版竞品对比表');
  agentRow('lead', `<div class="bub">对比表好了，12 个竞品账号 × 5 个维度。要我把它和上周选题清单放一起归档吗？</div>`);
  setHero(96, '等待你的确认'); setStage('等你拍板', [COL.acc, COL.acc]); bgSet('idle');
}

const GOAL = '帮我把 TikTok 宠物赛道的爆款账号整理一下，出一份下周能用的选题清单。';
const execList = document.getElementById('execList');
const execEmpty = document.getElementById('execEmpty');
const emptyChat = document.getElementById('emptyChat');
const ecInput = document.getElementById('ecInput');

function resetAll() {
  chatBody.innerHTML = ''; taskList.innerHTML = ''; artList.innerHTML = '';
  Object.keys(artState).forEach((k) => delete artState[k]);
  memList.innerHTML = '<div class="mem-item">宠物赛道只看 <b>北美与东南亚</b> 市场</div>';
  taskEmpty.style.display = ''; artEmpty.style.display = '';
  taskCount.textContent = '0'; gstate = {}; renderGraph();
  stages.length = 0; sIdx = -1; renderStages();
  setHero(0, '发一条消息就开始'); setStage('待命', [COL.faint, COL.faint]); bgSet('idle');
  ['codex', 'claps', 'claude'].forEach((k) => setExec(k, '待命', '还没有派活', '—'));
  addPanel.classList.add('hidden'); addBtn.classList.remove('on');
}
// 有没有组队，右栏直接看得出来
function showTeam(on) {
  execList.classList.toggle('hidden', !on);
  execEmpty.classList.toggle('hidden', on);
  document.querySelector('.ctx-tab[data-tab="run"] .t-n').textContent =
    on ? document.querySelectorAll('#execList .exec-card').length : 0;
}

/* ---------- 判断：随便聊聊，还是要动手的活 ---------- */
const TEAM_RE = /整理|清单|报告|分析|调研|抓取|方案|对比|竞品|批量|做一个|搭一个|写一份|排期|重构|上线|测试|脚本|策划|优化/;
function classify(t) {
  const s = t.trim();
  if (/^(你好|您好|hi|hello|hey|在吗|谢谢|嗨|哈喽)/i.test(s)) return { kind: 'simple', why: '打个招呼，直接答就行' };
  if (TEAM_RE.test(s) || s.length > 26) return { kind: 'team', why: '要好几步、跨角色，值得组队' };
  return { kind: 'simple', why: '一句话能答完，不用叫人' };
}

function newChat() {
  ++runToken;
  resetAll(); showTeam(false);
  emptyChat.classList.remove('hidden');
  ecInput.value = '';
  document.querySelector('.ch-title h1').innerHTML = '新对话<span class="dotp">.</span>';
  document.querySelector('.ch-meta').textContent = '还没有执行体';
  setTimeout(() => ecInput.focus(), 120);
}

async function start(text) {
  const my = ++runToken;
  const alive = () => my === runToken;
  resetAll(); showTeam(false);
  emptyChat.classList.add('hidden');
  const short = text.length > 15 ? text.slice(0, 15) + '…' : text;
  document.querySelector('.ch-title h1').innerHTML = short + '<span class="dotp">.</span>';
  document.querySelector('.ch-meta').textContent = '内容运营';

  addRow(`<div class="bub">${text}</div>`, 'you');
  await sleep(700); if (!alive()) return;

  // 先判断，再决定要不要叫人
  setStage('判断中', [COL.olive, COL.ink]); bgSet('think');
  await sleep(950); if (!alive()) return;
  const c = classify(text);

  if (c.kind === 'simple') return runSimple(text, c, alive);
  addRow(`<div class="route-note team"><i></i>判断：<b>需要动手的活</b> · ${c.why}</div>`);
  await sleep(500); if (!alive()) return;
  return runTeam(alive);
}

/* ---------- 分支 A：简单聊天，不叫人 ---------- */
async function runSimple(text, c, alive) {
  addRow(`<div class="route-note"><i></i>判断：<b>简单问答</b> · ${c.why}，没有叫执行体</div>`);
  await sleep(600); if (!alive()) return;
  const greet = /^(你好|您好|hi|hello|hey|在吗|谢谢|嗨|哈喽)/i.test(text.trim());
  const reply = greet
    ? `我是这个工作台的助手。小事我直接答；碰上要动手的活——比如「整理一批账号出选题清单」——我会自动叫上合适的执行体去做，你只管在关键处点头。<br><br>试试直接说个目标？`
    : `简单说：<b>萌宠日常</b>（真实感、无剧本）和 <b>拟人剧情</b> 这两类最近涨得最快，前 3 秒有冲突或反差的完播率明显更高。知识科普类涨粉慢但粉丝更精准。<br><br>要把这个做成能直接拍的选题清单，我就得叫上几位了——说一声就行。`;
  await sleep(300); if (!alive()) return;
  agentRow('lead', `<div class="bub">${reply}</div>`);
  setStage('待命', [COL.faint, COL.faint]); setHero(0, '这次没有派活'); bgSet('idle');
}

/* ---------- 分支 B：需要组队 ---------- */
async function runTeam(alive) {
  setStage('思考中', [COL.olive, COL.ink]); setHero(4, '正在理解目标'); bgSet('think');
  const think = agentRow('lead', `<div class="bub">
      <b>正在拆解目标</b><span class="ell"><i></i><i></i><i></i></span>
      <div class="think-note" id="tn1">读取项目记忆…</div>
      <div class="think-note" id="tn2">memory: 宠物赛道 → 北美 / 东南亚</div>
    </div>`);
  const notes = [
    ['判断这活分几步…', 'plan: 抓取 → 归类 → 成稿'],
    ['给每一步挑模型…', currentModel === 'auto'
      ? 'auto: 抓取=Haiku · 归类=Sonnet · 成稿=Sonnet'
      : `manual: 全程使用 ${MODELS.find((m) => m.id === currentModel).name}`],
    ['挑选执行体…', 'assign: codex_fly / claps-agent / claude-code'],
  ];
  for (const [a, b] of notes) {
    await sleep(1000); if (!alive()) return;
    think.querySelector('#tn1').textContent = a;
    think.querySelector('#tn2').textContent = b;
    setHero(Number(heroNum.textContent) + 3, '正在拆解目标');
  }
  await sleep(700); if (!alive()) return;
  think.remove();

  // 组队：谁被叫进来、为什么，都摆出来
  const team = [
    ['codex', 'codex_fly', '抓数据', '要批量取 50 个账号，它跑得快'],
    ['claps', 'claps-agent', '归类分析', '要做判断和取舍'],
    ['claude', 'claude-code', '出清单', '要写成能直接用的东西'],
  ];
  agentRow('lead', `<div class="team-card">
      <div class="team-h">这活要 <b>3 步</b>，我从团队里叫了 <b>3 位</b>：</div>
      ${team.map(([k, n, job, why]) => `<div class="team-row">
        <i class="ag ${AG[k].cls}"></i><span class="team-n">${n}</span>
        <span class="team-job">${job}<br><span class="team-why">${why}</span></span></div>`).join('')}
    </div>`);
  showTeam(true);
  startStage('选题清单');
  await sleep(900); if (!alive()) return;

  agentRow('lead', `<div class="bub">开始了。${currentModel === 'auto' ? '模型我按每步的活自动挑了，右边「执行体」里能看到谁在用什么。' : ''}</div>`);
  addTask('t1', '抓取 50 个宠物账号数据', 'codex');
  addTask('t2', '归类爆款内容结构', 'claps');
  addTask('t3', '产出下周选题清单', 'claude');
  gset('goal', 'done');
  setStage('执行中', [COL.acc, COL.olive]); bgSet('exec', 0);
  await sleep(700); if (!alive()) return;

  const act1 = [
    { key: 'codex', tk: 't1', gid: 'a', task: '抓取 50 个宠物账号数据', dur: 4200, delay: 0,
      pick: pickModel('haiku', '结构化提取，够用且快'),
      logs: ['连接 TikTok 开放数据…', '已抓取 12 / 50 个账号', '已抓取 31 / 50 个账号', '已抓取 50 / 50 · 清洗字段'] },
    { key: 'claps', tk: 't2', gid: 'b', task: '归类爆款内容结构', dur: 4200, delay: 1500,
      pick: pickModel('sonnet', '要做判断和取舍，用强一点的'),
      logs: ['载入 50 条样本…', '聚类：萌宠日常 / 剧情 / 知识科普', '提取共性钩子与完播特征', '归类完成 · 6 种结构'] },
    { key: 'claude', tk: 't3', gid: 'c', task: '产出下周选题清单', dur: 4000, delay: 3200,
      pick: pickModel('sonnet', '要写得像人话，写作交给它'),
      logs: ['读取归类结果…', '生成 12 条选题…', '补完播率与涨粉预估', '成稿 · 12 条选题'] },
  ];
  act1.forEach((j) => setTimeout(() => alive() && runJob(j, alive), j.delay));

  await trackProgress(7200, 12, 76, alive); if (!alive()) return;
  await sleep(400); if (!alive()) return;

  addArtifact('csv', 'CSV', 'tiktok-pet-accounts.csv', '50 个账号 · 6 种结构', 'v1', '首次抓取 · 50 个账号');
  addArtifact('md', 'MD', 'weekly-content-angles.md', '12 条选题', 'v1', '首版 12 条选题');
  agentRow('lead', `<div class="bub">三步都完成了，v1 清单在这里 —— 12 条选题，带完播率与涨粉预估。
      <div class="art-chip" data-v="v1"><span class="art-ic">MD</span>
        <span><span class="art-n">weekly-content-angles.md</span><br>
        <span class="art-s">v1 · 12 条选题 · 已存入任务 #131</span></span>
        <span class="art-open">点开看 →</span></div>
    </div>`);
  gset('g1', 'gate'); gset('v1', 'wait');
  tkStatus('t3', 'review', '待审查');
  setStage('等你拍板', [COL.acc, COL.acc]); setHero(88, '等待你的确认'); bgSet('idle');
  await sleep(600); if (!alive()) return;

  /* ---------- 第二幕：你的反馈 → 迭代到 v2 ---------- */
  const fbRow = addRow(`<div class="col" style="max-width:520px"><div class="bub">
      v1 看着怎么样？说一句就能改，说完他们自己去返工。
      <div class="fb-chips">
        <button class="fb-chip" data-fb="a">第 3、7 条太泛了，换成更具体的</button>
        <button class="fb-chip" data-fb="b">每条都要加开头 3 秒的钩子</button>
        <button class="fb-chip go" data-fb="ok">就这样，通过 ✓</button>
      </div></div></div>`);

  const revise = async (text) => {
    fbRow.querySelectorAll('.fb-chip').forEach((b) => (b.disabled = true));
    gset('v1', 'done');
    addRow(`<div class="bub">${text}</div>`, 'you');
    await sleep(700); if (!alive()) return;
    // 只是修改：还在同一个阶段，进入第 2 轮，不是从头再来
    nextRound();
    addRow(`<div class="route-note"><i></i>判断：<b>在原有基础上修改</b> · 还是「选题清单」这个阶段，进入第 2 轮</div>`);
    await sleep(600); if (!alive()) return;

    gset('fb', 'gate');
    setStage('思考中', [COL.olive, COL.ink]); setHero(90, '正在消化你的反馈'); bgSet('think');
    const t2 = agentRow('lead', `<div class="bub">
        <b>正在消化反馈</b><span class="ell"><i></i><i></i><i></i></span>
        <div class="think-note" id="tn3">定位要改的部分…</div>
        <div class="think-note" id="tn4">只返工受影响的两步，不重跑抓取</div>
      </div>`);
    await sleep(1600); if (!alive()) return;
    t2.remove();

    agentRow('lead', `<div class="bub">明白。抓取的数据还能用，不重跑；让 <b>claps-agent</b> 复核这两条的对标账号，<b>claude-code</b> 重写并给每条补钩子。</div>`);
    addTask('t4', '复核第 3 / 7 条的对标账号', 'claps');
    addTask('t5', '重写 + 每条补 3 秒钩子', 'claude');
    setStage('执行中', [COL.acc, COL.olive]); bgSet('exec', 0);
    await sleep(600); if (!alive()) return;

    const act2 = [
      { key: 'claps', tk: 't4', gid: 'd', task: '复核第 3 / 7 条的对标账号', dur: 3200, delay: 0,
        pick: pickModel('sonnet', '要重新判断选题够不够具体'),
        logs: ['回到 50 个账号样本…', '定位相似题材的 8 个账号', '提炼可执行的角度', '复核完成 · 2 条已重定位'] },
      { key: 'claude', tk: 't5', gid: 'e', task: '重写 + 每条补 3 秒钩子', dur: 3600, delay: 1300,
        pick: pickModel('opus', '钩子是创意活，这次用最强的'),
        logs: ['改写第 3 条…', '改写第 7 条…', '为 12 条补开头钩子…', '成稿 · v2 就绪'] },
    ];
    act2.forEach((j) => setTimeout(() => alive() && runJob(j, alive), j.delay));
    await trackProgress(4900, 90, 8, alive); if (!alive()) return;
    await sleep(400); if (!alive()) return;

    addArtifact('md', 'MD', 'weekly-content-angles.md', '12 条选题 · 全部带钩子', 'v2', '改写 2 条 + 补 12 个开头钩子');
    agentRow('lead', `<div class="bub">v2 好了：第 3、7 条换成了可直接拍的角度，12 条每条都带 3 秒钩子。
        <div class="art-chip" data-v="v2"><span class="art-ic">MD</span>
          <span><span class="art-n">weekly-content-angles.md</span><br>
          <span class="art-s">v2 · 对比 v1：改写 2 条 · 新增 12 个钩子</span></span>
          <span class="art-open">点开看 →</span></div>
      </div>`);
    gset('g2', 'gate');
    tkStatus('t5', 'review', '待审查');
    setStage('等你拍板', [COL.acc, COL.acc]); setHero(96, '等待最终确认'); bgSet('idle');
    await sleep(500); if (!alive()) return;

    const bar = document.createElement('div');
    bar.className = 'approve';
    bar.innerHTML = `<span>这版可以发布了吗？</span>
      <button class="btn-ok">通过并归档 ✓</button><button class="btn-no">再改一版</button>`;
    chatBody.appendChild(bar); scroll();
    bar.querySelector('.btn-ok').addEventListener('click', () => finish(bar));
    bar.querySelector('.btn-no').addEventListener('click', () => finish(bar));
  };

  const finish = async (bar) => {
    if (!alive()) return;
    bar.remove();
    addRow(`<div class="bub">通过并归档 ✓</div>`, 'you');
    tkStatus('t5', 'done', '已完成');
    gset('g2', 'done'); gset('v2', 'done');
    setHero(100, '这个阶段完成了'); setStage('可以发布', [COL.ok, COL.olive]);
    finishStage();
    addMemory('选题要 <b>具体到能直接拍</b>，每条自带 3 秒钩子');
    addMemory('选题清单要带 <b>完播率与涨粉数据</b>');
    await sleep(600); if (!alive()) return;
    addRow(`<div class="col"><div class="ready">
        <h4>可以发布了。</h4>
        <p>12 条选题已定稿并归档到任务 #131，产出留了 v1 / v2 两个版本可回溯。你的两条偏好也记住了，下次直接按这个标准出。</p>
        <div class="next-row">
          <button class="next-btn primary" data-open="v2">打开定稿看看 →</button>
          <button class="next-btn" data-follow="再加 5 条备选选题">再加 5 条备选选题</button>
          <button class="next-btn" data-follow="另外帮我做一版竞品账号的对比表">做一版竞品对比表</button>
        </div>
      </div></div>`);
  };

  fbRow.querySelectorAll('.fb-chip').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.fb === 'ok') {
      fbRow.querySelectorAll('.fb-chip').forEach((x) => (x.disabled = true));
      gset('v1', 'done');
      addRow(`<div class="bub">就这样，通过 ✓</div>`, 'you');
      tkStatus('t3', 'done', '已完成');
      setHero(100, '本次运行已完成'); setStage('可以发布', [COL.ok, COL.olive]);
      addMemory('选题清单要带 <b>完播率与涨粉数据</b>');
      setTimeout(() => alive() && addRow(`<div class="col"><div class="ready">
          <h4>可以发布了。</h4>
          <p>12 条选题已定稿并归档。想再打磨的话，随时说一句就能让他们返工。</p>
          <div class="next-row"><button class="next-btn primary">排进内容日历 →</button>
          <button class="next-btn">生成拍摄脚本</button></div>
        </div></div>`), 600);
    } else {
      revise(b.textContent.trim());
    }
  }));
}

function trackProgress(total, from, span, alive) {
  const t0 = performance.now();
  return new Promise((done) => {
    const step = () => {
      if (!alive()) return done();
      const p = Math.min(1, (performance.now() - t0) / total);
      setHero(from + p * span, p < 1 ? '执行体正在并行工作' : '等待你的确认');
      bgSet('exec', p);
      if (p < 1) requestAnimationFrame(step); else done();
    };
    step();
  });
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
  setTimeout(() => { mountFields(); fields.forEach((f) => f.size()); bgSize(); }, 40);
}
chatBtn.addEventListener('click', () => showView('chat'));
document.querySelectorAll('.mm-item').forEach((i) => i.addEventListener('click', () => showView(i.dataset.view)));
moreBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const closed = moreMenu.classList.toggle('hidden');
  moreBtn.classList.toggle('open', !closed);
});
document.addEventListener('click', (e) => { if (!e.target.closest('.more-wrap')) closeMore(); });
document.querySelectorAll('.ctx-tab').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('.ctx-tab').forEach((t) => t.classList.remove('active'));
  document.querySelectorAll('.pane').forEach((p) => p.classList.remove('active'));
  tab.classList.add('active');
  document.querySelector(`[data-pane="${tab.dataset.tab}"]`).classList.add('active');
}));
// 任务 tab 内的 列表 / 执行图 切换
document.querySelectorAll('.vs-btn').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.vs-btn').forEach((x) => x.classList.toggle('active', x === b));
  document.querySelectorAll('.tview').forEach((v) => v.classList.toggle('active', v.dataset.v === b.dataset.v));
}));
/* ---------- 新对话 / 空状态输入 ---------- */
document.querySelector('.new-chat').addEventListener('click', newChat);
document.getElementById('ecSend').addEventListener('click', () => {
  const v = ecInput.value.trim();
  if (v) start(v);
});
ecInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const v = ecInput.value.trim();
    if (v) start(v);
  }
});
document.querySelectorAll('.ec-chip').forEach((c) => c.addEventListener('click', () => start(c.dataset.t)));
// 已有对话里的输入框
document.querySelector('.ch-input .send').addEventListener('click', () => {
  const ta = document.querySelector('.ch-input textarea');
  const v = ta.value.trim();
  if (v) { start(v); ta.value = ''; }
});
document.querySelector('.ch-input textarea').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const v = e.target.value.trim();
    if (v) { start(v); e.target.value = ''; }
  }
});

document.getElementById('replayBtn').addEventListener('click', () => start(GOAL));
window.addEventListener('resize', () => { fields.forEach((f) => f.size()); bgSize(); });

mountFields(); renderGraph(); bgSize();
requestAnimationFrame(tick);
requestAnimationFrame(drawBlob);
requestAnimationFrame(bgDraw);
start(GOAL);
