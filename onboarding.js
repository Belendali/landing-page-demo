// language: set on the landing page toggle; defaults to Chinese
const lang = localStorage.getItem('claps-lang') === 'en' ? 'en' : 'zh';
document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';

const STR = {
  zh: {
    teamTitle: '你的团队', chTitle: '频道', moreTitle: '更多 ',
    lock: '完成首单后解锁', unlocked: '已解锁',
    sideHint: '云端 agent，已自动为你配好',
    addAgent: '＋ 接入我的 agent', addGroup: '＋ 新建群组',
    chatHeadSub: '你 + 5 个 agents',
    inputPh: '给你的团队一个目标…', send: '发送',
    tasksTitle: '任务',
    tasksEmpty: '还没有任务。<br />聊天里派出的活，会变成卡片出现在这里。',
    agents: { lead: '组长 · lead', res: '调研 · research', wri: '文案 · writer', cod: '工程 · coder', des: '设计 · designer' },
    st: { doing: '进行中', review: '待审查', done: '完成 ✓' },
    wm: { h2: '欢迎来到 CLAPS 👋', sub: '你的 agent 团队已经就位。<br />花 60 秒，和他们一起完成你的第一单？', start: '开始第一单（推荐）', skip: '跳过，直接进工作台' },
    welcome1: '👋 欢迎！我们是你的 agent 团队——我负责拆解和分工，R 管调研，W 管产出。',
    welcome2: '给我们一个目标试试，剩下的交给我们：',
    chips: { research: '调研 3 个竞品 →', landing: '做一个落地页 →', feedback: '整理用户反馈 →' },
    dispatchLead: (n) => `收到 ✊ 这个活需要 ${n} 个人，我来点兵——`,
    lastNote: '👉 右边任务面板已建好任务卡，每一步都在跟踪',
    deliverMsg: '搞定！终稿在这里，等你拍板：',
    artifactSub: '已存入任务 · 全程可追溯',
    approveQ: '满意吗？关键决定永远由你来做——', ok: '通过 ✓', back: '送回修改', approved: '通过 ✓',
    finale: {
      h3: '这就是 CLAPS：你派单，团队执行，你拍板。',
      p: '刚才 60 秒里发生的事——你说了一个目标，几个 agent 自动分工，产出回到你手上，最后一步由你按下。这个循环，就是整个产品。',
      c1: '体验了派单和分工', c2: '完成了第一次拍板', c3: '接入你自己的 Claude Code / Codex', c4: '创建第一个真实项目',
      next: '接入我自己的 agent →',
    },
    skipMsg: '好嘞，工作台是你的了。需要我们的时候在这里说一声就行。<br>想快速了解玩法的话，随时可以：',
    tourChip: '走一遍 60 秒新手引导 →',
    cn: {
      h2: '把你自己的 agent 拉进团队',
      sub: '现有成员不受影响——接进来的会成为新成员，一起出现在群里。',
      plats: {
        claude: ['Claude Code', '跑在你电脑上 · 用你自己的账号，我们碰不到你的 key'],
        codex: ['Codex', '跑在你电脑上 · 同样只需一条命令'],
        cloud: ['Claps Agent（云端）', '官方云上托管 · 无需安装任何东西'],
      },
      cmdHint: '在你电脑的终端里跑这一行（就这一步）：', ran: '我跑好了 ✓',
      where: '你的 Mac',
      done: (n) => `🎉 <b>${n}</b> 已上线！它现在也是团队一员了——群里 @ 它就能派活，和其他成员混着用。`,
    },
    gp: {
      h2: '新建群组', sub: '你的 agents 都已备好，建好群 @ 他们就能开工。',
      ph: '群组名，比如：网站改版', hint: '5 位成员将自动加入', create: '创建群组', fallback: '新群组',
      created: (n) => `群「${n}」建好了，成员都已就位。直接说你的目标，我们来分工。`,
    },
    plans: {
      research: { goal: '帮我调研 3 个竞品，输出一页对比报告', file: 'competitor-report.docx', claims: [
        ['res', '我来搜集资料和数据。', '资料与数据搜集'],
        ['wri', '我负责起草和成稿。', '起草内容成稿'],
        ['lead', '我做最终整合，完成后请你过目。', '整合 · 终稿输出'],
      ]},
      landing: { goal: '给新产品做一个落地页', file: 'landing-preview.link', claims: [
        ['des', '我先出视觉稿和版式。', '视觉稿 · 版式设计'],
        ['cod', '设计稿好了我来搭页面。', '页面开发与部署'],
        ['wri', '文案我来写。', '落地页文案'],
        ['lead', '我盯进度做整合，完成后请你过目。', '整合 · 预览链接'],
      ]},
      feedback: { goal: '把上周的用户反馈整理成摘要', file: 'feedback-summary.docx', claims: [
        ['res', '我来聚类和找共性问题。', '反馈聚类分析'],
        ['wri', '我写成一页摘要。', '摘要成稿'],
        ['lead', '我复核后交给你拍板。', '复核 · 输出'],
      ]},
    },
  },
  en: {
    teamTitle: 'Your team', chTitle: 'Channels', moreTitle: 'More ',
    lock: 'Unlocks after your first task', unlocked: 'Unlocked',
    sideHint: 'Cloud agents, set up for you automatically',
    addAgent: '＋ Connect my agent', addGroup: '＋ New group',
    chatHeadSub: 'you + 5 agents',
    inputPh: 'Give your team a goal…', send: 'Send',
    tasksTitle: 'Tasks',
    tasksEmpty: 'No tasks yet.<br />Work you dispatch in chat shows up here as cards.',
    agents: { lead: 'Lead', res: 'Research', wri: 'Writer', cod: 'Coder', des: 'Designer' },
    st: { doing: 'In progress', review: 'In review', done: 'Done ✓' },
    wm: { h2: 'Welcome to CLAPS 👋', sub: 'Your agent team is ready.<br />Got 60 seconds to ship your first task together?', start: 'Start my first task (recommended)', skip: 'Skip — take me to the workspace' },
    welcome1: "👋 Welcome! We're your agent team — I break down and assign the work, R handles research, W handles writing.",
    welcome2: "Give us a goal — we'll take it from there:",
    chips: { research: 'Research 3 competitors →', landing: 'Build a landing page →', feedback: 'Summarize user feedback →' },
    dispatchLead: (n) => `Got it ✊ This needs ${n} of us — assigning now.`,
    lastNote: '👉 Task cards are up in the panel on the right — every step is tracked',
    deliverMsg: "Done! The final version is here — your call:",
    artifactSub: 'Saved to the task · fully traceable',
    approveQ: 'Happy with it? The key calls are always yours —', ok: 'Approve ✓', back: 'Send back', approved: 'Approved ✓',
    finale: {
      h3: "That's CLAPS: you dispatch, the team executes, you make the call.",
      p: 'In the last 60 seconds you stated a goal, a few agents split the work, the output came back to you, and you pressed the final button. That loop is the whole product.',
      c1: 'Experienced dispatch & division of work', c2: 'Made your first call', c3: 'Connect your own Claude Code / Codex', c4: 'Create your first real project',
      next: 'Connect my own agent →',
    },
    skipMsg: "All yours. Just say the word whenever you need us.<br>Want the quick version of how this works? Any time:",
    tourChip: 'Take the 60-second tour →',
    cn: {
      h2: 'Bring your own agent into the team',
      sub: "Current members aren't affected — new ones join the same group.",
      plats: {
        claude: ['Claude Code', 'Runs on your machine · your own account, we never touch your key'],
        codex: ['Codex', 'Runs on your machine · one command, same as above'],
        cloud: ['Claps Agent (cloud)', 'Hosted on our cloud · nothing to install'],
      },
      cmdHint: "Run this one line in your terminal (that's the only step):", ran: 'Done, I ran it ✓',
      where: 'your Mac',
      done: (n) => `🎉 <b>${n}</b> is online! It's part of the team now — @ it in the group to give it work, alongside everyone else.`,
    },
    gp: {
      h2: 'New group', sub: 'Your agents are ready — create the group and @ them to start.',
      ph: 'Group name, e.g. website-revamp', hint: '5 members will join automatically', create: 'Create group', fallback: 'New group',
      created: (n) => `Group “${n}” is ready and everyone's here. Tell us the goal and we'll split the work.`,
    },
    plans: {
      research: { goal: 'Research 3 competitors and produce a one-page comparison', file: 'competitor-report.docx', claims: [
        ['res', "I'll gather the data and sources.", 'Data & source gathering'],
        ['wri', "I'll draft and polish the write-up.", 'Draft & final copy'],
        ['lead', "I'll do the final assembly — you review when it's done.", 'Assembly · final output'],
      ]},
      landing: { goal: 'Build a landing page for the new product', file: 'landing-preview.link', claims: [
        ['des', "I'll start with the visual design and layout.", 'Visual & layout design'],
        ['cod', "I'll build the page once the design lands.", 'Page build & deploy'],
        ['wri', "Copy's on me.", 'Landing page copy'],
        ['lead', "I'll track progress and assemble — you review at the end.", 'Assembly · preview link'],
      ]},
      feedback: { goal: "Summarize last week's user feedback", file: 'feedback-summary.docx', claims: [
        ['res', "I'll cluster it and find the common threads.", 'Feedback clustering'],
        ['wri', "I'll write the one-page summary.", 'Summary write-up'],
        ['lead', "I'll double-check and hand it to you for the call.", 'Review · output'],
      ]},
    },
  },
}[lang];

const AGENT_META = {
  lead: { cls: 'av-lead', letter: 'L' },
  res:  { cls: 'av-res',  letter: 'R' },
  wri:  { cls: 'av-wri',  letter: 'W' },
  cod:  { cls: 'av-cod',  letter: 'C' },
  des:  { cls: 'av-des',  letter: 'D' },
};

// ---------- apply language to static chrome ----------
(function applyStatic() {
  const titles = document.querySelectorAll('.side-title');
  titles[0].textContent = STR.teamTitle;
  titles[1].textContent = STR.chTitle;
  titles[2].innerHTML = `${STR.moreTitle}<span class="lock">${STR.lock}</span>`;
  document.querySelector('.side-hint').textContent = STR.sideHint;
  document.getElementById('addAgentBtn').textContent = STR.addAgent;
  document.getElementById('addGroupBtn').textContent = STR.addGroup;
  const names = document.querySelectorAll('.side-section .member .m-name');
  ['lead','res','wri','cod','des'].forEach((k, i) => { names[i].textContent = STR.agents[k]; });
  document.querySelector('.chat-head').innerHTML = `# first-mission <span class="chat-sub">${STR.chatHeadSub}</span>`;
  document.getElementById('input').placeholder = STR.inputPh;
  document.querySelector('.send').textContent = STR.send;
  document.querySelector('.tasks-title').textContent = STR.tasksTitle;
  document.getElementById('tasksEmpty').innerHTML = STR.tasksEmpty;

  const wm = document.getElementById('welcomeOverlay');
  wm.querySelector('h2').textContent = STR.wm.h2;
  wm.querySelector('.modal-sub').innerHTML = STR.wm.sub;
  document.getElementById('startBtn').textContent = STR.wm.start;
  document.getElementById('skipBtn').textContent = STR.wm.skip;

  const cn = document.getElementById('connectOverlay');
  cn.querySelector('h2').textContent = STR.cn.h2;
  cn.querySelector('.modal-sub').textContent = STR.cn.sub;
  cn.querySelectorAll('.plat').forEach((p) => {
    const [n, d] = STR.cn.plats[p.dataset.plat];
    p.querySelector('.plat-name').textContent = n;
    p.querySelector('.plat-desc').textContent = d;
  });
  cn.querySelector('.cmd-hint').textContent = STR.cn.cmdHint;
  document.getElementById('ranBtn').textContent = STR.cn.ran;

  const gp = document.getElementById('groupOverlay');
  gp.querySelector('h2').textContent = STR.gp.h2;
  gp.querySelector('.modal-sub').textContent = STR.gp.sub;
  document.getElementById('groupName').placeholder = STR.gp.ph;
  gp.querySelector('.gm-hint').textContent = STR.gp.hint;
  document.getElementById('createGroupBtn').textContent = STR.gp.create;
})();

// ---------- chat engine ----------
const chatBody = document.getElementById('chatBody');
const taskList = document.getElementById('taskList');
const tasksEmpty = document.getElementById('tasksEmpty');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const scroll = () => { chatBody.scrollTop = chatBody.scrollHeight; };

function addAgentMsg(key, html) {
  const a = AGENT_META[key];
  const el = document.createElement('div');
  el.className = 'msg';
  el.innerHTML = `<span class="avatar ${a.cls}">${a.letter}</span>
    <div class="msg-col"><span class="msg-name">${STR.agents[key]}</span><div class="bubble">${html}</div></div>`;
  chatBody.appendChild(el); scroll();
  return el;
}
function addUserMsg(text) {
  const el = document.createElement('div');
  el.className = 'msg msg-you';
  el.innerHTML = `<div class="msg-col"><div class="bubble">${text}</div></div>`;
  chatBody.appendChild(el); scroll();
}
async function typing(key, ms) {
  const a = AGENT_META[key];
  const el = document.createElement('div');
  el.className = 'msg';
  el.innerHTML = `<span class="avatar ${a.cls}">${a.letter}</span><span class="typing"><i></i><i></i><i></i></span>`;
  chatBody.appendChild(el); scroll();
  await sleep(ms);
  el.remove();
}
function addTask(id, title, key) {
  tasksEmpty.style.display = 'none';
  const a = AGENT_META[key];
  const el = document.createElement('div');
  el.className = 'task-card'; el.id = id;
  el.innerHTML = `<div class="task-title">${title}</div>
    <div class="task-meta"><span class="avatar ${a.cls}">${a.letter}</span>${STR.agents[key].split(' · ')[0]}
    <span class="status doing">${STR.st.doing}</span></div>`;
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
  addAgentMsg('lead', STR.welcome1);
  await sleep(700);
  await typing('lead', 700);
  const chipsHtml = Object.entries(STR.chips)
    .map(([k, label]) => `<button class="goal-chip" data-plan="${k}">${label}</button>`).join('');
  const el = addAgentMsg('lead', `${STR.welcome2}<div class="goal-chips">${chipsHtml}</div>`);
  el.querySelectorAll('.goal-chip').forEach((btn) =>
    btn.addEventListener('click', () => dispatch(STR.plans[btn.dataset.plan], el))
  );
}

// ---------- phase 1-2: dispatch ----------
async function dispatch(plan, chipMsg) {
  chipMsg.querySelectorAll('.goal-chip').forEach((b) => (b.disabled = true));
  addUserMsg(plan.goal);
  await sleep(800);
  await typing('lead', 1000);
  addAgentMsg('lead', STR.dispatchLead(plan.claims.length - 1));
  for (let i = 0; i < plan.claims.length; i++) {
    await sleep(i === 0 ? 900 : 1100);
    const [key, msg, task] = plan.claims[i];
    const isLast = i === plan.claims.length - 1;
    addAgentMsg(key, msg + (isLast ? `<br><span style="color:var(--muted);font-size:12px">${STR.lastNote}</span>` : ''));
    addTask('t' + i, task, key);
  }
  deliver(plan);
}

// ---------- phase 3: delivery + review gate ----------
async function deliver(plan) {
  await sleep(3200);
  for (let i = 0; i < plan.claims.length; i++) {
    setStatus('t' + i, 'review', STR.st.review);
    await sleep(450);
  }
  await typing('lead', 900);
  addAgentMsg('lead', `${STR.deliverMsg}
    <div class="artifact"><span class="file-ic">${plan.file.endsWith('.link') ? 'URL' : 'DOC'}</span>
      <span><span class="f-name">${plan.file}</span><br><span class="f-sub">${STR.artifactSub}</span></span>
    </div>`);
  await sleep(600);
  const bar = document.createElement('div');
  bar.className = 'approve-bar';
  bar.innerHTML = `<span>${STR.approveQ}</span>
    <button class="btn-ok">${STR.ok}</button><button class="btn-back">${STR.back}</button>`;
  chatBody.appendChild(bar); scroll();
  bar.querySelector('.btn-ok').addEventListener('click', () => finale(bar));
  bar.querySelector('.btn-back').addEventListener('click', () => finale(bar));
}

// ---------- phase 4: the point, made explicit ----------
async function finale(bar) {
  bar.remove();
  addUserMsg(STR.approved);
  document.querySelectorAll('.task-card').forEach((card) => {
    const s = card.querySelector('.status');
    s.className = 'status done';
    s.textContent = STR.st.done;
  });
  await sleep(700);
  const el = document.createElement('div');
  el.className = 'msg';
  el.innerHTML = `<span class="avatar av-lead">L</span>
    <div class="msg-col" style="max-width:88%"><div class="finale">
      <h3>${STR.finale.h3}</h3>
      <p>${STR.finale.p}</p>
      <div class="checklist">
        <div class="check-item"><span class="c-done">✓</span>${STR.finale.c1}</div>
        <div class="check-item"><span class="c-done">✓</span>${STR.finale.c2}</div>
        <div class="check-item"><span class="c-todo">○</span>${STR.finale.c3}</div>
        <div class="check-item"><span class="c-todo">○</span>${STR.finale.c4}</div>
      </div>
      <button class="next-btn">${STR.finale.next}</button>
    </div></div>`;
  chatBody.appendChild(el); scroll();
  document.querySelectorAll('.channel.dim').forEach((c) => (c.style.color = 'var(--ink)'));
  document.querySelector('.lock').textContent = STR.unlocked;
  document.getElementById('input').disabled = false;
  document.querySelector('.send').disabled = false;
}

// ---------- entry modal ----------
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
  const el = addAgentMsg('lead', `${STR.skipMsg}<div class="goal-chips"><button class="goal-chip" id="laterTour">${STR.tourChip}</button></div>`);
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
  claude: { name: 'claude-code', letter: 'CC',
    cmd: 'npm i -g @triclaps/cli && claps-cli register --runtime claude-code' },
  codex: { name: 'codex', letter: 'CX',
    cmd: 'npm i -g @triclaps/cli && claps-cli register --runtime codex' },
  cloud: { name: 'claps-agent-2', letter: 'CA', cmd: null },
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
  if (e.target.closest('.next-btn')) openConnect();
});
platStep.querySelectorAll('.plat').forEach((btn) =>
  btn.addEventListener('click', () => {
    pendingPlat = PLATS[btn.dataset.plat];
    pendingPlat.where = btn.dataset.plat === 'cloud' ? 'cloud' : STR.cn.where;
    if (!pendingPlat.cmd) return connected();
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
    <span class="m-name">${p.name} · ${p.where || 'cloud'}</span><i class="dot on"></i>`;
  document.getElementById('addAgentBtn').before(row);
  await typing('lead', 900);
  addAgentMsg('lead', STR.cn.done(`${p.name} · ${p.where || 'cloud'}`));
}

// ---------- new group ----------
const groupOverlay = document.getElementById('groupOverlay');
document.getElementById('addGroupBtn').addEventListener('click', () => groupOverlay.classList.remove('hidden'));
document.getElementById('groupClose').addEventListener('click', () => groupOverlay.classList.add('hidden'));
document.getElementById('createGroupBtn').addEventListener('click', async () => {
  const name = document.getElementById('groupName').value.trim() || STR.gp.fallback;
  groupOverlay.classList.add('hidden');
  document.querySelectorAll('#channelList .channel').forEach((c) => c.classList.remove('active'));
  const ch = document.createElement('div');
  ch.className = 'channel active';
  ch.textContent = '# ' + name;
  document.getElementById('channelList').appendChild(ch);
  document.querySelector('.chat-head').innerHTML = `# ${name} <span class="chat-sub">${STR.chatHeadSub}</span>`;
  await typing('lead', 800);
  addAgentMsg('lead', STR.gp.created(name));
  document.getElementById('input').disabled = false;
  document.querySelector('.send').disabled = false;
});
