// 模块：每日计划（日历入口 + 某日详情 + 排班编辑 + 接单编辑）
Pages.plan = function(view) {
  const role = App.role;
  const dataMap = {};
  let totalCount = 0;
  let unsettledTotal = 0, settledTotal = 0, commissionTotal = 0;

  const date = new Date(App.calYear, App.calMonth, 1);
  const prefix = role === 'model' ? 'schedules' : 'orders';
  const monthData = Utils.storage.getMonthly(prefix, date);

  monthData.forEach(item => {
    if (!dataMap[item.date]) dataMap[item.date] = [];
    dataMap[item.date].push(item);
    totalCount++;
    if (role === 'model') {
      const salary = parseFloat(item.salary) || 0;
      if (item.settled) settledTotal += salary; else unsettledTotal += salary;
    } else {
      commissionTotal += parseFloat(item.commission) || 0;
    }
  });

  const matrix = Utils.getMonthMatrix(App.calYear, App.calMonth);
  const weekdays = ['日','一','二','三','四','五','六'];

  view.innerHTML = `
    <div class="gradient-header">
      <div class="flex-between">
        <button class="cal-nav" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.calMonth--;App.route('plan')">‹</button>
        <div style="font-size:18px;font-weight:600;color:#fff;">${App.calYear}年${App.calMonth+1}月</div>
        <button class="cal-nav" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.calMonth++;App.route('plan')">›</button>
      </div>
    </div>
    <div class="container">
      <div class="card" style="margin-top:-20px;position:relative;z-index:10;">
        <div class="flex-between" style="margin-bottom:10px;">
          <div style="font-size:16px;font-weight:600;">${role==='model'?'我的排班':'接单管理'}</div>
          <span class="tag tag-primary">${role==='model'?'模特模式':'经纪人模式'}</span>
        </div>

        <div class="cal-weekdays">
          ${weekdays.map(w => `<div class="cal-weekday">${w}</div>`).join('')}
        </div>
        <div class="cal-grid">
          ${matrix.flat().map(cell => `
            <div class="cal-cell ${!cell.currentMonth?'muted':''} ${cell.isToday?'today':''} ${cell.date===App.selectedDate?'selected':''}"
                 onclick="App.selectedDate='${cell.date}';App.navigate('plan-detail')">
              ${cell.day}
              ${dataMap[cell.date] && dataMap[cell.date].length ? '<div class="cal-dot"></div>' : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-title">当月概览</div>
        <div class="stats-row">
          <div class="stats-item"><div class="stats-num">${totalCount}</div><div class="stats-label">总条数</div></div>
          ${role === 'model' ? `
            <div class="stats-item"><div class="stats-num text-warning">¥${Utils.money(unsettledTotal)}</div><div class="stats-label">未结算</div></div>
            <div class="stats-item"><div class="stats-num text-success">¥${Utils.money(settledTotal)}</div><div class="stats-label">已结算</div></div>
          ` : `
            <div class="stats-item"><div class="stats-num text-accent">¥${Utils.money(commissionTotal)}</div><div class="stats-label">总佣金</div></div>
          `}
        </div>
      </div>
    </div>
  `;
};

// ===== 某日详情 =====
Pages['plan-detail'] = function(view) {
  const role = App.role;
  const date = App.selectedDate;
  const d = Utils.parseDate(date);

  // 处理月份越界
  if (d.getMonth() !== App.calMonth) {
    App.calYear = d.getFullYear();
    App.calMonth = d.getMonth();
  }

  let content = '';

  if (role === 'model') {
    const schedules = Utils.storage.getMonthly('schedules', d).filter(s => s.date === date);
    const todos = Utils.storage.getMonthly('todos', d).filter(t => t.date === date);

    content = `
      <div class="card">
        <div class="flex-between">
          <div>
            <div style="font-size:16px;font-weight:600;">${Utils.friendlyDate(date)}</div>
            <div style="font-size:12px;color:var(--text-hint)">${Utils.getWeekday(d)}</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="App.editSchedule()">+ 排班</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">排班列表 (${schedules.length})</div>
        ${schedules.length === 0 ? '<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-text">今日暂无排班</div></div>' :
          schedules.map(s => `
            <div class="list-item" onclick="App.editSchedule('${s.id}')">
              <div style="flex:1;">
                <div class="flex-between">
                  <div style="font-weight:600;">${s.projectName || '未命名项目'}</div>
                  <span class="tag ${s.settled?'tag-success':'tag-default'}" onclick="event.stopPropagation();App.toggleSettled('${s.id}')">${s.settled?'已结算':'未结算'}</span>
                </div>
                <div style="font-size:12px;color:var(--text-sub);margin-top:4px;">
                  ⏰ ${s.startTime||''} - ${s.endTime||''}　📍 ${s.location||'未填'}
                </div>
                <div style="font-size:13px;color:var(--primary);margin-top:4px;font-weight:600;">¥${Utils.money(s.salary)}</div>
              </div>
              <button class="todo-delete" onclick="event.stopPropagation();App.deleteSchedule('${s.id}')">✕</button>
            </div>
          `).join('')
        }
      </div>

      <div class="card">
        <div class="card-title">待办事项</div>
        <div id="todo-list">
          ${todos.length === 0 ? '<div class="empty-state"><div class="empty-icon">✏️</div><div class="empty-text">暂无待办</div></div>' :
            todos.map(t => `
              <div class="todo-item">
                <div class="todo-check ${t.done?'done':''}" onclick="App.toggleTodo('${t.id}')">${t.done?'✓':''}</div>
                <div class="todo-text ${t.done?'done':''}">${t.text}</div>
                <button class="todo-delete" onclick="App.deleteTodo('${t.id}')">✕</button>
              </div>
            `).join('')
          }
        </div>
        <div class="flex-row" style="margin-top:12px;gap:8px;">
          <input class="input flex-1" id="todo-input" placeholder="输入待办事项，回车添加" onkeydown="if(event.key==='Enter')App.addTodo()">
          <button class="btn btn-primary btn-sm" onclick="App.addTodo()">添加</button>
        </div>
      </div>
    `;
  } else {
    const orders = Utils.storage.getMonthly('orders', d).filter(o => o.date === date);

    content = `
      <div class="card">
        <div class="flex-between">
          <div>
            <div style="font-size:16px;font-weight:600;">${Utils.friendlyDate(date)}</div>
            <div style="font-size:12px;color:var(--text-hint)">${Utils.getWeekday(d)}</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="App.editOrder()">+ 接单</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">接单列表 (${orders.length})</div>
        ${orders.length === 0 ? '<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">今日暂无接单</div></div>' :
          orders.map(o => `
            <div class="list-item" onclick="App.editOrder('${o.id}')">
              <div style="flex:1;">
                <div class="flex-between">
                  <div style="font-weight:600;">${o.merchant || '未填商家'}</div>
                  <button class="todo-delete" onclick="event.stopPropagation();App.deleteOrder('${o.id}')">✕</button>
                </div>
                <div style="font-size:12px;color:var(--text-sub);margin-top:4px;">
                  ${o.product||''}　${o.styleRequired?'· '+o.styleRequired:''}
                </div>
                <div style="font-size:12px;color:var(--text-sub);margin-top:2px;">
                  ⏰ ${o.shootTime||''}　📍 ${o.location||'未填'}
                </div>
                <div style="font-size:13px;margin-top:4px;">报价: <span style="color:var(--primary);font-weight:600;">¥${Utils.money(o.quote)}</span></div>
                ${o.booked || o.modelName ? `
                  <div class="commission-card" style="margin-top:8px;">
                    <div style="font-size:12px;opacity:0.9">${o.booked?o.booked.modelName:o.modelName} · ${o.booked?o.booked.modelGender:o.modelGender||''}</div>
                    <div class="commission-amount">¥${Utils.money(o.commission)}</div>
                    <div style="font-size:11px;opacity:0.8">我的佣金</div>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')
        }
      </div>
    `;
  }

  view.innerHTML = `
    <div class="gradient-header" style="padding:16px;">
      <div class="flex-between">
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.back()">‹ 返回</button>
        <div style="font-size:14px;opacity:0.9">${role==='model'?'模特':'经纪人'} · ${Utils.friendlyDate(date)}</div>
        <div style="width:40px;"></div>
      </div>
    </div>
    <div class="container">${content}</div>
  `;
};

// ===== 排班编辑 =====
App.editSchedule = function(id) {
  const date = App.selectedDate;
  const d = Utils.parseDate(date);
  let schedule = { id: '', startTime: '', endTime: '', projectName: '', location: '', salary: '', settled: false };

  if (id) {
    const schedules = Utils.storage.getMonthly('schedules', d);
    const found = schedules.find(s => s.id === id);
    if (found) schedule = found;
  }

  const html = `
    <div class="mask" id="modal-mask" onclick="if(event.target.id==='modal-mask')this.remove()">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">${id?'编辑排班':'新增排班'}</div>
          <button class="modal-close" onclick="document.getElementById('modal-mask').remove()">×</button>
        </div>
        <div class="field-group">
          <label class="label">上班时间</label>
          <input class="input" type="time" id="f-startTime" value="${schedule.startTime||''}">
        </div>
        <div class="field-group">
          <label class="label">下班时间</label>
          <input class="input" type="time" id="f-endTime" value="${schedule.endTime||''}">
        </div>
        <div class="field-group">
          <label class="label">拍摄项目名称</label>
          <input class="input" id="f-projectName" value="${schedule.projectName||''}" placeholder="如：夏日女装拍摄">
        </div>
        <div class="field-group">
          <label class="label">拍摄地点</label>
          <input class="input" id="f-location" value="${schedule.location||''}" placeholder="如：杭州摄影基地">
        </div>
        <div class="field-group">
          <label class="label">工资数额</label>
          <input class="input" type="number" id="f-salary" value="${schedule.salary||''}" placeholder="如：500">
        </div>
        <div class="field-group">
          <label class="label">结算状态</label>
          <select class="input" id="f-settled">
            <option value="false" ${!schedule.settled?'selected':''}>未结算</option>
            <option value="true" ${schedule.settled?'selected':''}>已结算</option>
          </select>
        </div>
        <div class="flex-row" style="gap:8px;margin-top:16px;">
          <button class="btn btn-primary btn-block" onclick="App.saveSchedule('${id||''}')">保存</button>
          ${id?`<button class="btn btn-danger btn-block" onclick="App.deleteSchedule('${id}',true)">删除</button>`:''}
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
};

App.saveSchedule = function(id) {
  const date = App.selectedDate;
  const d = Utils.parseDate(date);
  const schedules = Utils.storage.getMonthly('schedules', d);
  const data = {
    id: id || Utils.genId(),
    date: date,
    startTime: document.getElementById('f-startTime').value,
    endTime: document.getElementById('f-endTime').value,
    projectName: document.getElementById('f-projectName').value,
    location: document.getElementById('f-location').value,
    salary: document.getElementById('f-salary').value,
    settled: document.getElementById('f-settled').value === 'true'
  };
  if (!data.projectName) { Utils.toast('请输入项目名称'); return; }
  if (id) {
    const idx = schedules.findIndex(s => s.id === id);
    if (idx >= 0) schedules[idx] = data;
  } else {
    schedules.push(data);
  }
  Utils.storage.setMonthly('schedules', d, schedules);
  document.getElementById('modal-mask').remove();
  Utils.toast('保存成功');
  App.route('plan-detail');
};

App.toggleSettled = function(id) {
  const d = Utils.parseDate(App.selectedDate);
  const schedules = Utils.storage.getMonthly('schedules', d);
  const idx = schedules.findIndex(s => s.id === id);
  if (idx >= 0) { schedules[idx].settled = !schedules[idx].settled; Utils.storage.setMonthly('schedules', d, schedules); App.route('plan-detail'); }
};

App.deleteSchedule = function(id, fromModal) {
  if (!Utils.confirm('确认删除该排班？')) return;
  const d = Utils.parseDate(App.selectedDate);
  let schedules = Utils.storage.getMonthly('schedules', d);
  schedules = schedules.filter(s => s.id !== id);
  Utils.storage.setMonthly('schedules', d, schedules);
  if (fromModal) document.getElementById('modal-mask').remove();
  Utils.toast('已删除');
  App.route('plan-detail');
};

App.addTodo = function() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (!text) return;
  const d = Utils.parseDate(App.selectedDate);
  const todos = Utils.storage.getMonthly('todos', d);
  todos.push({ id: Utils.genId(), text, done: false, date: App.selectedDate });
  Utils.storage.setMonthly('todos', d, todos);
  input.value = '';
  App.route('plan-detail');
};

App.toggleTodo = function(id) {
  const d = Utils.parseDate(App.selectedDate);
  const todos = Utils.storage.getMonthly('todos', d);
  const idx = todos.findIndex(t => t.id === id);
  if (idx >= 0) { todos[idx].done = !todos[idx].done; Utils.storage.setMonthly('todos', d, todos); App.route('plan-detail'); }
};

App.deleteTodo = function(id) {
  const d = Utils.parseDate(App.selectedDate);
  let todos = Utils.storage.getMonthly('todos', d);
  todos = todos.filter(t => t.id !== id);
  Utils.storage.setMonthly('todos', d, todos);
  App.route('plan-detail');
};

// ===== 接单编辑 =====
App.editOrder = function(id) {
  const date = App.selectedDate;
  const d = Utils.parseDate(date);
  let order = { id:'', merchant:'', product:'', quote:'', styleRequired:'', shootTime:'', location:'', modelName:'', modelGender:'', modelPaid:'', commission:'' };
  if (id) {
    const orders = Utils.storage.getMonthly('orders', d);
    const found = orders.find(o => o.id === id);
    if (found) order = found;
  }
  const styles = ['甜美','成熟','学院','酷飒','休闲','职场'];
  const genders = ['女','男'];

  const html = `
    <div class="mask" id="modal-mask" onclick="if(event.target.id==='modal-mask')this.remove()">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">${id?'编辑接单':'新增接单'}</div>
          <button class="modal-close" onclick="document.getElementById('modal-mask').remove()">×</button>
        </div>
        <div class="field-group"><label class="label">商家名称</label><input class="input" id="f-merchant" value="${order.merchant||''}" placeholder="如：XX服装店"></div>
        <div class="field-group"><label class="label">拍摄产品/品类</label><input class="input" id="f-product" value="${order.product||''}" placeholder="如：夏季连衣裙"></div>
        <div class="field-group"><label class="label">报价（给商家的价格）</label><input class="input" type="number" id="f-quote" value="${order.quote||''}" placeholder="如：800" oninput="App.calcCommission()"></div>
        <div class="field-group">
          <label class="label">模特风格要求</label>
          <select class="input" id="f-styleRequired">
            ${styles.map(s => `<option value="${s}" ${order.styleRequired===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="field-group"><label class="label">拍摄时间</label><input class="input" type="time" id="f-shootTime" value="${order.shootTime||''}"></div>
        <div class="field-group"><label class="label">拍摄地点</label><input class="input" id="f-location" value="${order.location||''}" placeholder="如：杭州摄影基地"></div>

        <div style="border-top:1px solid var(--border);margin:16px 0;padding-top:12px;font-weight:600;">已定模特（可选）</div>
        <div class="field-group"><label class="label">模特姓名</label><input class="input" id="f-modelName" value="${order.modelName||''}" placeholder="如：小美"></div>
        <div class="field-group">
          <label class="label">模特性别</label>
          <select class="input" id="f-modelGender">
            ${genders.map(g => `<option value="${g}" ${order.modelGender===g?'selected':''}>${g}</option>`).join('')}
          </select>
        </div>
        <div class="field-group"><label class="label">实付模特报酬</label><input class="input" type="number" id="f-modelPaid" value="${order.modelPaid||''}" placeholder="如：500" oninput="App.calcCommission()"></div>

        <div class="commission-card" id="commission-preview">
          <div style="font-size:12px;opacity:0.9">我的佣金</div>
          <div class="commission-amount" id="commission-amount">¥${Utils.money(order.commission || (order.quote - order.modelPaid))}</div>
        </div>

        <div class="flex-row" style="gap:8px;margin-top:16px;">
          <button class="btn btn-primary btn-block" onclick="App.saveOrder('${id||''}')">保存</button>
          ${id?`<button class="btn btn-danger btn-block" onclick="App.deleteOrder('${id}',true)">删除</button>`:''}
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
};

App.calcCommission = function() {
  const quote = parseFloat(document.getElementById('f-quote').value) || 0;
  const paid = parseFloat(document.getElementById('f-modelPaid').value) || 0;
  const commission = Math.max(0, quote - paid);
  document.getElementById('commission-amount').textContent = '¥' + Utils.money(commission);
};

App.saveOrder = function(id) {
  const d = Utils.parseDate(App.selectedDate);
  const orders = Utils.storage.getMonthly('orders', d);
  const quote = parseFloat(document.getElementById('f-quote').value) || 0;
  const modelPaid = parseFloat(document.getElementById('f-modelPaid').value) || 0;
  const commission = Math.max(0, quote - modelPaid);
  const modelName = document.getElementById('f-modelName').value;
  const data = {
    id: id || Utils.genId(),
    date: App.selectedDate,
    merchant: document.getElementById('f-merchant').value,
    product: document.getElementById('f-product').value,
    quote: document.getElementById('f-quote').value,
    styleRequired: document.getElementById('f-styleRequired').value,
    shootTime: document.getElementById('f-shootTime').value,
    location: document.getElementById('f-location').value,
    modelName: modelName,
    modelGender: document.getElementById('f-modelGender').value,
    modelPaid: document.getElementById('f-modelPaid').value,
    commission: Utils.money(commission),
    booked: modelName ? {
      modelName: modelName,
      modelGender: document.getElementById('f-modelGender').value,
      modelPaid: document.getElementById('f-modelPaid').value
    } : null
  };
  if (!data.merchant) { Utils.toast('请输入商家名称'); return; }
  if (!data.quote) { Utils.toast('请输入报价'); return; }
  if (id) {
    const idx = orders.findIndex(o => o.id === id);
    if (idx >= 0) orders[idx] = data;
  } else {
    orders.push(data);
  }
  Utils.storage.setMonthly('orders', d, orders);
  document.getElementById('modal-mask').remove();
  Utils.toast('保存成功');
  App.route('plan-detail');
};

App.deleteOrder = function(id, fromModal) {
  if (!Utils.confirm('确认删除该接单？')) return;
  const d = Utils.parseDate(App.selectedDate);
  let orders = Utils.storage.getMonthly('orders', d);
  orders = orders.filter(o => o.id !== id);
  Utils.storage.setMonthly('orders', d, orders);
  if (fromModal) document.getElementById('modal-mask').remove();
  Utils.toast('已删除');
  App.route('plan-detail');
};
