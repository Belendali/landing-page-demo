// 右栏上下文 tab 切换
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

// 底部「管理」折叠 —— 低频配置默认收起
const mgToggle = document.getElementById('mgToggle');
const mgList = document.getElementById('mgList');
const mgTw = document.getElementById('mgTw');
mgToggle.addEventListener('click', () => {
  const open = mgList.classList.toggle('hidden');
  mgTw.textContent = open ? '▸' : '▾';
});

// 对话切换 —— 标题与未读跟着走
const convs = document.querySelectorAll('.conv');
convs.forEach((conv) => {
  conv.addEventListener('click', () => {
    convs.forEach((c) => c.classList.remove('active'));
    conv.classList.add('active');
    const name = conv.querySelector('.c-name').textContent;
    const sub = conv.querySelector('.c-sub').textContent.trim();
    document.querySelector('.ch-title h1').textContent = name;
    const proj = conv.closest('.proj').querySelector('.proj-head').textContent.trim().replace(/^.\s*/, '').replace(/\s*\d+$/, '');
    const agentCls = conv.querySelector('.ag').className;
    document.querySelector('.ch-meta').innerHTML =
      `<i class="${agentCls}"></i>${sub.split('·')[0].trim()} · 私聊 · ${proj}`;
    const unread = conv.querySelector('.unread');
    if (unread) unread.remove();
  });
});
