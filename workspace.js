// ============ 顶栏视图切换：对话 ↔ 全局管理台 ============
const VIEWS = {
  chat: 'viewChat',
  tasks: 'viewTasks',
  fleet: 'viewFleet',
  projects: 'viewProjects',
  autos: 'viewAutos',
};
const navBtns = document.querySelectorAll('.nv');

function showView(name) {
  Object.entries(VIEWS).forEach(([key, id]) => {
    document.getElementById(id).classList.toggle('hidden', key !== name);
  });
  navBtns.forEach((b) => b.classList.toggle('active', b.dataset.view === name));
  window.scrollTo(0, 0);
}
navBtns.forEach((btn) => btn.addEventListener('click', () => showView(btn.dataset.view)));

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
