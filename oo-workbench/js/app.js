// OO的工作台 — 应用核心
const App = {
  role: 'model',
  currentRoute: 'workbench',
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  selectedDate: '',

  init() {
    this.role = Utils.storage.get('role', 'model');
    this.selectedDate = Utils.formatDate(new Date());
    this.bindTabbar();
    this.route('workbench');
  },

  switchRole(role) {
    this.role = role;
    Utils.storage.set('role', role);
    Utils.toast(role === 'model' ? '已切换到模特视角' : '已切换到经纪人视角');
    this.route(this.currentRoute);
  },

  bindTabbar() {
    document.querySelectorAll('.tabbar-item').forEach(item => {
      item.addEventListener('click', () => {
        const route = item.dataset.route;
        this.route(route);
      });
    });
  },

  updateTabbar() {
    document.querySelectorAll('.tabbar-item').forEach(item => {
      item.classList.toggle('active', item.dataset.route === this.currentRoute);
    });
  },

  route(name) {
    this.currentRoute = name;
    this.updateTabbar();
    const view = document.getElementById('view');
    view.innerHTML = '';
    const renderer = Pages[name] || Pages.workbench;
    renderer(view);
  },

  navigate(name) {
    // 子页面导航（非tabbar）
    this.route(name);
    // 隐藏tabbar
    if (!['workbench','plan','wardrobe','media'].includes(name)) {
      document.getElementById('tabbar').style.display = 'none';
    } else {
      document.getElementById('tabbar').style.display = 'flex';
    }
  },

  back() {
    document.getElementById('tabbar').style.display = 'flex';
    this.route('workbench');
  }
};

// 页面渲染器集合
const Pages = {};
