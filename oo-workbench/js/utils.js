// OO的工作台 — 工具库
const Utils = {
  // ===== ID 生成 =====
  genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 9); },

  // ===== 日期 =====
  formatDate(d) {
    if (typeof d === 'string') d = new Date(d);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  },
  formatMonth(d) {
    if (typeof d === 'string') d = new Date(d);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  },
  parseDate(str) {
    if (!str) return new Date();
    const p = str.split('-');
    return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
  },
  getWeekday(d) {
    if (typeof d === 'string') d = new Date(d);
    return ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()];
  },
  friendlyDate(str) {
    const d = this.parseDate(str);
    const today = new Date();
    const diff = Math.floor((today - d) / 86400000);
    if (diff === 0) return '今天';
    if (diff === 1) return '昨天';
    if (diff === -1) return '明天';
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  },
  getMonthMatrix(year, month) {
    const firstDay = new Date(year, month, 1);
    const firstDayWeek = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const matrix = [];
    let row = [];
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      row.push({ day: daysInPrev - i, currentMonth: false, date: this.formatDate(new Date(year, month - 1, daysInPrev - i)) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = this.formatDate(new Date(year, month, d));
      row.push({ day: d, currentMonth: true, date: dateStr, isToday: dateStr === this.formatDate(new Date()) });
      if (row.length === 7) { matrix.push(row); row = []; }
    }
    let nextDay = 1;
    while (row.length > 0 && row.length < 7) { row.push({ day: nextDay++, currentMonth: false, date: this.formatDate(new Date(year, month + 1, nextDay - 1)) }); }
    if (row.length === 7) matrix.push(row);
    while (matrix.length < 6) {
      const r = [];
      for (let i = 0; i < 7; i++) { r.push({ day: nextDay++, currentMonth: false, date: this.formatDate(new Date(year, month + 1, nextDay - 1)) }); }
      matrix.push(r);
    }
    return matrix;
  },

  // ===== 金额 =====
  money(n) {
    if (n === null || n === undefined || n === '') return '0.00';
    n = Number(n);
    return isNaN(n) ? '0.00' : n.toFixed(2);
  },
  yuan(n) { return '¥' + this.money(n); },

  // ===== 存储 =====
  storage: {
    get(key, defaultVal) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : (defaultVal !== undefined ? defaultVal : null); }
      catch(e) { return defaultVal !== undefined ? defaultVal : null; }
    },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) { console.error(e); } },
    remove(key) { localStorage.removeItem(key); },
    getMonthly(prefix, date) {
      const key = `${prefix}_${Utils.formatMonth(date)}`;
      return this.get(key, []);
    },
    setMonthly(prefix, date, data) {
      const key = `${prefix}_${Utils.formatMonth(date)}`;
      this.set(key, data);
    },
    getRoleKey(key) {
      const role = this.get('role', 'model');
      const shared = ['finance_records_', 'savings_goal', 'clothings', 'outfit_combos', 'titles', 'scripts', 'datas', 'reviews'];
      for (const sk of shared) { if (key.startsWith(sk)) return key; }
      return `${role}_${key}`;
    }
  },

  // ===== UI =====
  toast(msg) {
    let el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 2000);
  },
  showLoading(text) {
    let el = document.getElementById('loading');
    if (!el) {
      el = document.createElement('div');
      el.id = 'loading';
      el.className = 'loading';
      el.innerHTML = `<div class="spinner"></div><div id="loading-text">加载中...</div>`;
      document.body.appendChild(el);
    }
    document.getElementById('loading-text').textContent = text || '加载中...';
    el.style.display = 'block';
  },
  hideLoading() {
    const el = document.getElementById('loading');
    if (el) el.style.display = 'none';
  },
  confirm(msg) {
    return window.confirm(msg);
  }
};
