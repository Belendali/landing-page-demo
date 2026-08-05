// scripted first-run experience: 落地 → 开场 → 派单 → 交付 → 拍板 → 收口
const chatBody = document.getElementById('chatBody');
const taskList = document.getElementById('taskList');
const tasksEmpty = document.getElementById('tasksEmpty');

const AGENTS = {
  lead: { cls: 'av-lead', letter: 'L', name: '组长 · lead' },
  res:  { cls: 'av-res',  letter: 'R', name: '调研 · research' },
  wri:  { cls: 'av-wri',  letter: 'W', name: '文案 · writer' },
  cod:  { cls: 'av-cod',  letter: 'C', name: '工程 · coder' },
  des:  { cls: 'av-des',  letter: 'D', name: '设计 · designer' },
};

// 组长按活儿点兵：不同目标召唤不同阵容
const PLANS = {
  research: {
    goal: '帮我调研 3 个竞品，输出一页对比报告',
    claims: [
      { agent: 'res', msg: '我来搜集资料和数据。', task: '资料与数据搜集' },
      { agent: 'wri', msg: '我负责起草和成稿。', task: '起草内容成稿' },
      { agent: 'lead', msg: '我做最终整合，完成后请你过目。', task: '整合 · 终稿输出' },
    ],
    file: 'competitor-report.docx',
  },
  landing: {
    goal: '给新产品做一个落地页',
    claims: [
      { agent: 'des', msg: '我先出视觉稿和版式。', task: '视觉稿 · 版式设计' },
      { agent: 'cod', msg: '设计稿好了我来搭页面。', task: '页面开发与部署' },
      { agent: 'wri', msg: '文案我来写。', task: '落地页文案' },
      { agent: 'lead', msg: '我盯进度做整合，完成后请你过目。', task: '整合 · 预览链接' },
    ],
    file: 'landing-preview.link',
  },
  feedback: {
    goal: '把上周的用户反馈整理成摘要',
    claims: [
      { agent: 'res', msg: '我来聚类和找共性问题。', task: '反馈聚类分析' },
      { agent: 'wri', msg: '我写成一页摘要。', task: '摘要成稿' },
      { agent: 'lead', msg: '我复核后交给你拍板。', task: '复核 · 输出' },
    ],
    file: 'feedback-summary.docx',
  },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const scroll = () => { chatBody.scrollTop = chatBody.scrollHeight; };

function addAgentMsg(agentKey, html) {
  const a = AGENTS[agentKey];
  const el = document.createElement('div');
  el.className = 'msg';
  el.innerHTML = `<span class="avatar ${a.cls}">${a.letter}</span>
    <div class="msg-col"><span class="msg-name">${a.name}</span><div class="bubble">${html}</div></div>`;
  chatBody.appendChild(el); scroll();
  return el;
}
function addUserMsg(text) {
  const el = document.createElement('div');
  el.className = 'msg msg-you';
  el.innerHTML = `<div class="msg-col"><div class="bubble">${text}</div></div>`;
  chatBody.appendChild(el); scroll();
}
async function typing(agentKey, ms) {
  const a = AGENTS[agentKey];
  const el = document.createElement('div');
  el.className = 'msg';
  el.innerHTML = `<span class="avatar ${a.cls}">${a.letter}</span><span class="typing"><i></i><i></i><i></i></span>`;
  chatBody.appendChild(el); scroll();
  await sleep(ms);
  el.remove();
}
function addTask(id, title, agentKey) {
  tasksEmpty.style.display = 'none';
  const a = AGENTS[agentKey];
  const el = document.createElement('div');
  el.className = 'task-card'; el.id = id;
  el.innerHTML = `<div class="task-title">${title}</div>
    <div class="task-meta"><span class="avatar ${a.cls}">${a.letter}</span>${a.name.split(' · ')[0]}
    <span class="status doing">进行中</span></div>`;
  taskList.appendChild(el);
}
function setStatus(id, cls, label) {
  const s = document.querySelector(`#${id} .status`);
  s.className = 'status ' + cls;
  s.textContent = label;
}

// ---------- phase 0: welcome ----------
async function start() {
  await sleep(600);
  await typing('lead', 900);
  addAgentMsg('lead', '👋 欢迎！我们是你的 agent 团队——我负责拆解和分工，R 管调研，W 管产出。');
  await sleep(700);
  await typing('lead', 700);
  const el = addAgentMsg('lead', `给我们一个目标试试，剩下的交给我们：
    <div class="goal-chips">
      <button class="goal-chip" data-plan="research">调研 3 个竞品 →</button>
      <button class="goal-chip" data-plan="landing">做一个落地页 →</button>
      <button class="goal-chip" data-plan="feedback">整理用户反馈 →</button>
    </div>`);
  el.querySelectorAll('.goal-chip').forEach((btn) =>
    btn.addEventListener('click', () => dispatch(PLANS[btn.dataset.plan], el))
  );
}

// ---------- phase 1-2: dispatch — the first aha ----------
async function dispatch(plan, chipMsg) {
  chipMsg.querySelectorAll('.goal-chip').forEach((b) => (b.disabled = true));
  addUserMsg(plan.goal);
  await sleep(800);
  await typing('lead', 1000);
  addAgentMsg('lead', `收到 ✊ 这个活需要 ${plan.claims.length - 1} 个人，我来点兵——`);
  for (let i = 0; i < plan.claims.length; i++) {
    await sleep(i === 0 ? 900 : 1100);
    const c = plan.claims[i];
    const isLast = i === plan.claims.length - 1;
    addAgentMsg(c.agent, c.msg + (isLast
      ? '<br><span style="color:var(--muted);font-size:12px">👉 右边任务面板已建好任务卡，每一步都在跟踪</span>' : ''));
    addTask('t' + i, c.task, c.agent);
  }
  deliver(plan);
}

// ---------- phase 3: delivery + review gate — the second aha ----------
async function deliver(plan) {
  await sleep(3200);
  for (let i = 0; i < plan.claims.length; i++) {
    setStatus('t' + i, 'review', '待审查');
    await sleep(450);
  }
  await typing('lead', 900);
  addAgentMsg('lead', `搞定！终稿在这里，等你拍板：
    <div class="artifact"><span class="file-ic">${plan.file.endsWith('.link') ? 'URL' : 'DOC'}</span>
      <span><span class="f-name">${plan.file}</span><br><span class="f-sub">已存入任务 · 全程可追溯</span></span>
    </div>`);
  await sleep(600);
  const bar = document.createElement('div');
  bar.className = 'approve-bar';
  bar.innerHTML = `<span>满意吗？关键决定永远由你来做——</span>
    <button class="btn-ok">通过 ✓</button><button class="btn-back">送回修改</button>`;
  chatBody.appendChild(bar); scroll();
  bar.querySelector('.btn-ok').addEventListener('click', () => finale(bar));
  bar.querySelector('.btn-back').addEventListener('click', () => finale(bar));
}

// ---------- phase 4: the point, made explicit ----------
async function finale(bar) {
  bar.remove();
  addUserMsg('通过 ✓');
  document.querySelectorAll('.task-card').forEach((card) => {
    const s = card.querySelector('.status');
    s.className = 'status done';
    s.textContent = '完成 ✓';
  });
  await sleep(700);
  const el = document.createElement('div');
  el.className = 'msg';
  el.innerHTML = `<span class="avatar av-lead">L</span>
    <div class="msg-col" style="max-width:88%"><div class="finale">
      <h3>这就是 CLAPS：你派单，团队执行，你拍板。</h3>
      <p>刚才 60 秒里发生的事——你说了一个目标，3 个 agent 自动分工，产出回到你手上，最后一步由你按下。这个循环，就是整个产品。</p>
      <div class="checklist">
        <div class="check-item"><span class="c-done">✓</span>体验了派单和分工</div>
        <div class="check-item"><span class="c-done">✓</span>完成了第一次拍板</div>
        <div class="check-item"><span class="c-todo">○</span>接入你自己的 Claude Code / Codex</div>
        <div class="check-item"><span class="c-todo">○</span>创建第一个真实项目</div>
      </div>
      <button class="next-btn">接入我自己的 agent →</button>
    </div></div>`;
  chatBody.appendChild(el); scroll();
  // unlock the rest of the sidebar
  document.querySelectorAll('.channel.dim').forEach((c) => (c.style.color = 'var(--ink)'));
  document.querySelector('.lock').textContent = '已解锁';
  // enable input for free play
  document.getElementById('input').disabled = false;
  document.querySelector('.send').disabled = false;
}

// ---------- entry modal: onboarding or skip ----------
const welcomeOverlay = document.getElementById('welcomeOverlay');
document.getElementById('startBtn').addEventListener('click', () => {
  welcomeOverlay.classList.add('hidden');
  start();
});
document.getElementById('skipBtn').addEventListener('click', async () => {
  welcomeOverlay.classList.add('hidden');
  document.getElementById('input').disabled = false;
  document.querySelector('.send').disabled = false;
  await typing('lead', 800);
  const el = addAgentMsg('lead', `好嘞，工作台是你的了。需要我们的时候在这里说一声就行。<br>
    想快速了解玩法的话，随时可以：<div class="goal-chips"><button class="goal-chip" id="laterTour">走一遍 60 秒新手引导 →</button></div>`);
  el.querySelector('#laterTour').addEventListener('click', (e) => {
    e.target.disabled = true;
    start();
  });
});

// ---------- connect your own agent ----------
const connectOverlay = document.getElementById('connectOverlay');
const platStep = document.getElementById('platStep');
const cmdStep = document.getElementById('cmdStep');
const PLATS = {
  claude: { name: 'claude-code', where: '你的 Mac', letter: 'CC',
    cmd: 'npm i -g @triclaps/cli && claps-cli register --runtime claude-code' },
  codex: { name: 'codex', where: '你的 Mac', letter: 'CX',
    cmd: 'npm i -g @triclaps/cli && claps-cli register --runtime codex' },
  cloud: { name: 'claps-agent-2', where: 'cloud', letter: 'CA', cmd: null },
};
let pendingPlat = null;

function openConnect() {
  connectOverlay.classList.remove('hidden');
  platStep.classList.remove('hidden');
  cmdStep.classList.add('hidden');
}
document.getElementById('addAgentBtn').addEventListener('click', openConnect);
document.getElementById('connectClose').addEventListener('click', () => connectOverlay.classList.add('hidden'));
document.addEventListener('click', (e) => {
  if (e.target.closest('.next-btn')) openConnect(); // finale button too
});
platStep.querySelectorAll('.plat').forEach((btn) =>
  btn.addEventListener('click', () => {
    pendingPlat = PLATS[btn.dataset.plat];
    if (!pendingPlat.cmd) return connected(); // cloud: zero setup
    platStep.classList.add('hidden');
    cmdStep.classList.remove('hidden');
    document.getElementById('cmdText').textContent = pendingPlat.cmd;
  })
);
document.getElementById('ranBtn').addEventListener('click', connected);

async function connected() {
  connectOverlay.classList.add('hidden');
  const p = pendingPlat || PLATS.cloud;
  const row = document.createElement('div');
  row.className = 'member';
  row.innerHTML = `<span class="avatar av-real">${p.letter}</span>
    <span class="m-name">${p.name} · ${p.where}</span><i class="dot on"></i>`;
  document.getElementById('addAgentBtn').before(row);
  await typing('lead', 900);
  addAgentMsg('lead', `🎉 <b>${p.name} · ${p.where}</b> 已上线！它现在也是团队一员了——群里 @${p.name} 就能给它派活，和其他成员混着用。`);
}

// ---------- new group ----------
const groupOverlay = document.getElementById('groupOverlay');
document.getElementById('addGroupBtn').addEventListener('click', () => groupOverlay.classList.remove('hidden'));
document.getElementById('groupClose').addEventListener('click', () => groupOverlay.classList.add('hidden'));
document.getElementById('createGroupBtn').addEventListener('click', async () => {
  const name = document.getElementById('groupName').value.trim() || '新群组';
  groupOverlay.classList.add('hidden');
  document.querySelectorAll('#channelList .channel').forEach((c) => c.classList.remove('active'));
  const ch = document.createElement('div');
  ch.className = 'channel active';
  ch.textContent = '# ' + name;
  document.getElementById('channelList').appendChild(ch);
  document.querySelector('.chat-head').innerHTML = `# ${name} <span class="chat-sub">你 + 5 个 agents</span>`;
  await typing('lead', 800);
  addAgentMsg('lead', `群「${name}」建好了，成员都已就位。直接说你的目标，我们来分工。`);
  document.getElementById('input').disabled = false;
  document.querySelector('.send').disabled = false;
});
