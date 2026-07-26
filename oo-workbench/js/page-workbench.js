// 模块：工作台首页（立体卡片风格）
Pages.workbench = function(view) {
  const today = new Date();
  const todayStr = Utils.formatDate(today);
  const todayDate = Utils.friendlyDate(todayStr);
  const role = App.role;
  const hour = today.getHours();
  const greeting = hour < 12 ? '早上好 ☀️' : hour < 18 ? '下午好 🌤️' : '晚上好 🌙';
  const motto = '今天的努力，是明天选择的底气';

  // 数据统计
  let stat1 = 0, stat2 = 0, stat3 = 0;
  let stat1Label = '待办事项', stat2Label = '今日收入', stat3Label = '今日支出';

  if (role === 'model') {
    const schedules = Utils.storage.getMonthly('schedules', today).filter(s => s.date === todayStr);
    const todos = Utils.storage.getMonthly('todos', today).filter(t => t.date === todayStr);
    stat1 = todos.filter(t => !t.done).length;
    stat2 = schedules.length;
    stat3 = schedules.filter(s => s.settled).length;
    stat1Label = '待办事项';
    stat2Label = '今日排班';
    stat3Label = '已结算';
  } else {
    const orders = Utils.storage.getMonthly('orders', today).filter(o => o.date === todayStr);
    stat1 = orders.length;
    stat2 = orders.filter(o => o.booked || o.modelName).length;
    stat3 = orders.reduce((s, o) => s + Number(o.commission || 0), 0);
    stat1Label = '今日接单';
    stat2Label = '已定模特';
    stat3Label = '今日佣金';
  }

  const financeRecords = Utils.storage.getMonthly('finance_records', today);
  const todayIncome = financeRecords.filter(r => r.date === todayStr && r.type === 'income').reduce((s, r) => s + Number(r.amount || 0), 0);
  const todayExpense = financeRecords.filter(r => r.date === todayStr && r.type === 'expense').reduce((s, r) => s + Number(r.amount || 0), 0);
  const allIncome = financeRecords.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount || 0), 0);
  const allExpense = financeRecords.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount || 0), 0);
  const savings = allIncome - allExpense;

  const goal = Utils.storage.get('savings_goal', {targetAmount: 0});
  const savingsPercent = Number(goal.targetAmount) > 0 ? Math.min(100, Math.round(savings / Number(goal.targetAmount) * 100)) : 0;

  // 今日待办（模特角色）
  const todos = Utils.storage.getMonthly('todos', today).filter(t => t.date === todayStr);

  // 功能入口 2行3列
  const funcItems = [
    { icon: '📅', label: role==='model'?'每日计划':'接单管理', sub: role==='model'?'查看排班':'管理订单', color: '#7B6CF6', bg: '#F5F3FF', route: 'plan' },
    { icon: '💡', label: '选题灵感', sub: 'AI推荐', color: '#FF7BA9', bg: '#FFF0F5', route: 'inspiration' },
    { icon: '🔥', label: '爆款热点', sub: '抖音/小红书', color: '#FF9F0A', bg: '#FFF8E6', route: 'hotspot' },
    { icon: '👗', label: '服装管理', sub: '我的衣橱', color: '#7B6CF6', bg: '#F5F3FF', route: 'wardrobe' },
    { icon: '✨', label: '穿搭模拟', sub: '拼贴搭配', color: '#FF7BA9', bg: '#FFF0F5', route: 'outfit-simulator' },
    { icon: '💰', label: '财务管理', sub: '记账储蓄', color: '#34C759', bg: '#E8F9EE', route: 'finance' },
  ];

  view.innerHTML = `
    <div style="background:var(--bg);min-height:100vh;padding-bottom:80px;">
      <!-- 顶部导航 -->
      <div class="flex-between" style="padding:16px 16px 8px;">
        <div style="font-size:22px;font-weight:700;color:var(--text-main);">工作台</div>
        <div class="flex-row" style="gap:12px;">
          <button class="btn btn-sm" style="width:34px;height:34px;border-radius:50%;background:#fff;box-shadow:var(--shadow);padding:0;display:flex;align-items:center;justify-content:center;" onclick="App.route('workbench')">↻</button>
          <button class="btn btn-sm" style="width:34px;height:34px;border-radius:50%;background:#fff;box-shadow:var(--shadow);padding:0;display:flex;align-items:center;justify-content:center;color:var(--primary);" onclick="App.navigate('settings')">+</button>
        </div>
      </div>
      <div style="padding:0 16px 12px;font-size:13px;color:var(--text-sub);">
        ${today.getFullYear()}年${today.getMonth()+1}月${today.getDate()}日 ${Utils.getWeekday(today)}
      </div>

      <div class="container" style="padding-top:0;">
        <!-- Hero 渐变卡片 -->
        <div style="background:linear-gradient(135deg,#7B6CF6 0%,#A78BFA 50%,#C4B5FD 100%);border-radius:24px;padding:24px 20px;color:#fff;box-shadow:0 8px 32px rgba(123,108,246,0.35);margin-bottom:16px;position:relative;overflow:hidden;">
          <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;background:rgba(255,255,255,0.12);border-radius:50%;"></div>
          <div style="position:absolute;bottom:-20px;left:20px;width:60px;height:60px;background:rgba(255,255,255,0.08);border-radius:50%;"></div>

          <div style="position:relative;z-index:1;">
            <div style="font-size:14px;opacity:0.9;margin-bottom:6px;">${greeting}</div>
            <div style="font-size:17px;font-weight:600;margin-bottom:20px;letter-spacing:0.5px;">${motto}</div>
            <div style="display:flex;justify-content:space-around;text-align:center;">
              <div style="flex:1;border-right:1px solid rgba(255,255,255,0.25);">
                <div style="font-size:28px;font-weight:700;">${stat1}</div>
                <div style="font-size:11px;opacity:0.85;">${stat1Label}</div>
              </div>
              <div style="flex:1;border-right:1px solid rgba(255,255,255,0.25);">
                <div style="font-size:28px;font-weight:700;">${role==='agent' && stat3Label==='今日佣金' ? '¥'+Utils.money(stat3) : stat3}</div>
                <div style="font-size:11px;opacity:0.85;">${stat3Label}</div>
              </div>
              <div style="flex:1;">
                <div style="font-size:28px;font-weight:700;">${role==='agent' ? stat2 : '¥'+Utils.money(todayIncome)}</div>
                <div style="font-size:11px;opacity:0.85;">${role==='agent' ? stat2Label : '今日收入'}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 角色切换 -->
        <div class="card" style="padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;">
          <div style="width:44px;height:44px;border-radius:14px;background:${role==='model'?'linear-gradient(135deg,#7B6CF6,#A78BFA)':'linear-gradient(135deg,#FF7BA9,#FFB3CD)'};display:flex;align-items:center;justify-content:center;font-size:22px;">
            ${role==='model'?'👗':'📋'}
          </div>
          <div style="flex:1;">
            <div style="font-size:15px;font-weight:600;">${role==='model'?'模特模式':'经纪人模式'}</div>
            <div style="font-size:12px;color:var(--text-hint);">点击切换角色视角</div>
          </div>
          <div class="role-switch" style="flex-shrink:0;">
            <button class="role-btn ${role==='model'?'active':''}" onclick="App.switchRole('model')">模特</button>
            <button class="role-btn ${role==='agent'?'active':''}" onclick="App.switchRole('agent')">经纪人</button>
          </div>
        </div>

        <!-- 功能入口宫格 -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
          ${funcItems.map(f => `
            <div onclick="App.navigate('${f.route}')" style="background:#fff;border-radius:18px;padding:18px 8px;text-align:center;box-shadow:0 4px 16px rgba(123,108,246,0.08);cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
              <div style="width:52px;height:52px;border-radius:16px;background:${f.bg};display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:26px;color:${f.color};">
                ${f.icon}
              </div>
              <div style="font-size:13px;font-weight:600;color:var(--text-main);margin-bottom:3px;">${f.label}</div>
              <div style="font-size:10px;color:var(--text-hint);">${f.sub}</div>
            </div>
          `).join('')}
        </div>

        <!-- 今日待办（模特）/ 今日接单（经纪人） -->
        ${role === 'model' ? `
          <div class="card" style="margin-bottom:16px;">
            <div class="flex-between" style="margin-bottom:12px;">
              <div>
                <div style="font-size:15px;font-weight:600;">今日待办</div>
                <div style="font-size:12px;color:var(--text-hint);">完成一项勾一项</div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="App.navigate('plan')">查看全部</button>
            </div>
            <div style="display:flex;gap:8px;margin-bottom:12px;">
              <input class="input" id="quick-todo" placeholder="添加新的待办事项..." style="flex:1;" onkeydown="if(event.key==='Enter')App.addQuickTodo()">
              <button class="btn btn-primary" style="width:44px;height:44px;border-radius:12px;padding:0;display:flex;align-items:center;justify-content:center;font-size:20px;" onclick="App.addQuickTodo()">+</button>
            </div>
            ${todos.length === 0 ? '<div style="text-align:center;padding:16px;color:var(--text-hint);font-size:13px;">今日暂无待办</div>' :
              todos.slice(0,3).map(t => `
                <div class="todo-item">
                  <div class="todo-check ${t.done?'done':''}" onclick="App.toggleQuickTodo('${t.id}')">${t.done?'✓':''}</div>
                  <div class="todo-text ${t.done?'done':''}">${t.text}</div>
                </div>
              `).join('')
            }
          </div>
        ` : `
          <div class="card" style="margin-bottom:16px;">
            <div class="flex-between" style="margin-bottom:12px;">
              <div>
                <div style="font-size:15px;font-weight:600;">今日接单</div>
                <div style="font-size:12px;color:var(--text-hint);">快速管理今天订单</div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="App.navigate('plan')">查看全部</button>
            </div>
            ${Utils.storage.getMonthly('orders', today).filter(o => o.date === todayStr).length === 0 ? '<div style="text-align:center;padding:16px;color:var(--text-hint);font-size:13px;">今日暂无接单</div>' :
              Utils.storage.getMonthly('orders', today).filter(o => o.date === todayStr).slice(0,3).map(o => `
                <div class="list-item" style="padding:10px 0;" onclick="App.selectedDate='${o.date}';App.editOrder('${o.id}')">
                  <div style="flex:1;">
                    <div style="font-weight:500;">${o.merchant}</div>
                    <div style="font-size:12px;color:var(--text-sub);">${o.product} · ¥${Utils.money(o.quote)}</div>
                  </div>
                  <span class="tag ${o.booked||o.modelName?'tag-success':'tag-default'}">${o.booked||o.modelName?'已定':'未订'}</span>
                </div>
              `).join('')
            }
          </div>
        `}

        <!-- 储蓄进度 -->
        <div class="card" style="margin-bottom:16px;">
          <div class="flex-between" style="margin-bottom:10px;">
            <div style="font-size:15px;font-weight:600;">储蓄进度</div>
            <div style="font-size:12px;color:var(--text-hint);">目标 ¥${Utils.money(goal.targetAmount)}</div>
          </div>
          <div class="flex-between">
            <div><span style="font-size:24px;font-weight:700;color:var(--primary);">¥${Utils.money(savings)}</span></div>
            <div style="font-size:13px;color:var(--primary);font-weight:600;">${savingsPercent}%</div>
          </div>
          <div class="progress-bar" style="margin-top:10px;"><div class="progress-bar-fill" style="width:${savingsPercent}%"></div></div>
        </div>

        <!-- 快捷统计 -->
        <div class="card" style="display:flex;justify-content:space-around;text-align:center;padding:16px 8px;">
          <div>
            <div style="font-size:18px;font-weight:700;color:var(--income);">+¥${Utils.money(todayIncome)}</div>
            <div style="font-size:11px;color:var(--text-hint);margin-top:2px;">今日收入</div>
          </div>
          <div style="width:1px;background:var(--border);"></div>
          <div>
            <div style="font-size:18px;font-weight:700;color:var(--expense);">-¥${Utils.money(todayExpense)}</div>
            <div style="font-size:11px;color:var(--text-hint);margin-top:2px;">今日支出</div>
          </div>
          <div style="width:1px;background:var(--border);"></div>
          <div>
            <div style="font-size:18px;font-weight:700;color:var(--primary);">¥${Utils.money(savings)}</div>
            <div style="font-size:11px;color:var(--text-hint);margin-top:2px;">当前储蓄</div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// 工作台首页快捷操作
App.addQuickTodo = function() {
  const input = document.getElementById('quick-todo');
  const text = input.value.trim();
  if (!text) return;
  const d = new Date();
  const date = Utils.formatDate(d);
  App.selectedDate = date;
  const todos = Utils.storage.getMonthly('todos', d);
  todos.push({ id: Utils.genId(), text, done: false, date });
  Utils.storage.setMonthly('todos', d, todos);
  input.value = '';
  Utils.toast('添加成功');
  App.route('workbench');
};

App.toggleQuickTodo = function(id) {
  const d = new Date();
  App.selectedDate = Utils.formatDate(d);
  const todos = Utils.storage.getMonthly('todos', d);
  const idx = todos.findIndex(t => t.id === id);
  if (idx >= 0) { todos[idx].done = !todos[idx].done; Utils.storage.setMonthly('todos', d, todos); App.route('workbench'); }
};
