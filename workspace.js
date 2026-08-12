// ============ 顶栏视图切换：对话 ↔ 全局管理台 ============
const VIEWS = {
  chat: 'viewChat',
  fleet: 'viewFleet',
  projects: 'viewProjects',
  memory: 'viewMemory',
  launch: 'viewLaunch',
  tasks: 'viewTasks',
  autos: 'viewAutos',
};
const LABELS = {
  fleet: '执行体', projects: '项目', memory: '记忆',
  launch: 'Launch', tasks: 'Neo 任务', autos: '自动化',
};
const chatBtn = document.querySelector('.nv[data-view="chat"]');
const moreBtn = document.getElementById('moreBtn');
const moreMenu = document.getElementById('moreMenu');
const moreLabel = document.getElementById('moreLabel');
const moreBadge = document.getElementById('moreBadge');
const mmItems = document.querySelectorAll('.mm-item[data-view]');

function closeMore() {
  moreMenu.classList.add('hidden');
  moreBtn.classList.remove('open');
}

function showView(name) {
  Object.entries(VIEWS).forEach(([key, id]) => {
    document.getElementById(id).classList.toggle('hidden', key !== name);
  });
  const inChat = name === 'chat';
  chatBtn.classList.toggle('active', inChat);
  // 在全局视图里，「更多」按钮直接显示当前所在的位置
  moreLabel.textContent = inChat ? '更多' : LABELS[name];
  moreBtn.classList.toggle('at-view', !inChat);
  moreBadge.classList.toggle('hidden', !inChat);
  mmItems.forEach((i) => i.classList.toggle('active', i.dataset.view === name));
  closeMore();
  window.scrollTo(0, 0);
}

chatBtn.addEventListener('click', () => showView('chat'));
mmItems.forEach((item) => item.addEventListener('click', () => showView(item.dataset.view)));
document.querySelectorAll('.mm-item.quiet').forEach((i) => i.addEventListener('click', closeMore));

moreBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const open = moreMenu.classList.toggle('hidden');
  moreBtn.classList.toggle('open', !open);
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.more-wrap')) closeMore();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMore();
});

// 右栏的「在全部…里查看」——把局部和全局的关系接起来
document.querySelectorAll('[data-goto]').forEach((link) =>
  link.addEventListener('click', () => showView(link.dataset.goto))
);

// ============ 右栏上下文 tab ============
const tabs = document.querySelectorAll('.ctx-tab');
const panes = document.querySelectorAll('.pane');
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    panes.forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    document.querySelector(`[data-pane="${tab.dataset.tab}"]`).classList.add('active');
  });
});

// 列表 / 执行图 —— 普通用户看列表，开发者切图
const vsBtns = document.querySelectorAll('.vs-btn');
const views = document.querySelectorAll('.view');
vsBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    vsBtns.forEach((b) => b.classList.remove('active'));
    views.forEach((v) => v.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`.view[data-view="${btn.dataset.view}"]`).classList.add('active');
  });
});

// 全局任务：列表 / 看板
const gvBtns = document.querySelectorAll('.gv-btn');
const gviews = document.querySelectorAll('.gview');
gvBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    gvBtns.forEach((b) => b.classList.remove('active'));
    gviews.forEach((v) => v.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`.gview[data-gv="${btn.dataset.gv}"]`).classList.add('active');
  });
});

// 筛选 chip
const chips = document.querySelectorAll('.f-chip');
chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
  });
});

// ============ 对话切换 ============
const convs = document.querySelectorAll('.conv');
convs.forEach((conv) => {
  conv.addEventListener('click', () => {
    convs.forEach((c) => c.classList.remove('active'));
    conv.classList.add('active');
    const name = conv.querySelector('.c-name').textContent;
    const sub = conv.querySelector('.c-sub').textContent.trim();
    const proj = conv.closest('.proj').querySelector('.proj-head').textContent
      .trim().replace(/^.\s*/, '').replace(/\s*\d+$/, '');
    document.querySelector('.ch-title h1').textContent = name;
    document.querySelector('.ch-meta').innerHTML =
      `<i class="${conv.querySelector('.ag').className}"></i>${sub.split('·')[0].trim()} · 私聊 · ${proj}`;
    const unread = conv.querySelector('.unread');
    if (unread) unread.remove();
  });
});
