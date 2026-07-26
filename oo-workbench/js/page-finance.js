// 模块：财务管理
Pages.finance = function(view) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = new Date(year, month - 1, 1);
  const records = Utils.storage.getMonthly('finance_records', date);
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  const income = records.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount || 0), 0);
  const expense = records.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount || 0), 0);
  const balance = income - expense;

  const goal = Utils.storage.get('savings_goal', { targetAmount: 0 });
  const savingsPercent = goal.targetAmount > 0 ? Math.min(100, Math.round(balance / Number(goal.targetAmount) * 100)) : 0;

  const categories = {
    income: ['工资', '佣金', '红包', '其他收入'],
    expense: ['化妆', '交通', '餐饮', '服装', '道具', '其他支出']
  };

  view.innerHTML = `
    <div class="gradient-header">
      <div class="flex-between">
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.back()">‹ 返回</button>
        <div style="font-size:16px;font-weight:600;color:#fff;">财务管理</div>
        <div style="width:40px;"></div>
      </div>
    </div>
    <div class="container">
      <div class="card" style="margin-top:-20px;position:relative;z-index:10;">
        <div class="flex-between" style="margin-bottom:8px;">
          <div style="font-size:16px;font-weight:600;">${year}年${month}月</div>
        </div>
        <div class="stats-row">
          <div class="stats-item"><div class="stats-num text-income">+¥${Utils.money(income)}</div><div class="stats-label">收入</div></div>
          <div class="stats-item"><div class="stats-num text-expense">-¥${Utils.money(expense)}</div><div class="stats-label">支出</div></div>
          <div class="stats-item"><div class="stats-num text-primary">¥${Utils.money(balance)}</div><div class="stats-label">结余</div></div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">储蓄目标</div>
        <div class="flex-between">
          <div><span style="font-size:24px;font-weight:700;color:var(--primary)">¥${Utils.money(balance)}</span></div>
          <div style="font-size:12px;color:var(--text-hint)">目标 ¥${Utils.money(goal.targetAmount)}</div>
        </div>
        <div class="progress-bar" style="margin-top:8px;"><div class="progress-bar-fill" style="width:${savingsPercent}%"></div></div>
        <div style="text-align:right;font-size:11px;color:var(--primary);margin-top:4px">${savingsPercent}%</div>
        <button class="btn btn-secondary btn-sm" style="margin-top:8px;" onclick="App.setSavingsGoal()">设置目标</button>
      </div>

      <div class="card">
        <div class="flex-between">
          <div class="card-title" style="margin:0;">收支记录</div>
          <button class="btn btn-primary btn-sm" onclick="App.editFinance()">+ 新增</button>
        </div>
        <div class="divider"></div>
        ${sorted.length === 0 ? '<div class="empty-state"><div class="empty-icon">💰</div><div class="empty-text">暂无记录</div></div>' :
          sorted.map(r => `
            <div class="list-item" onclick="App.editFinance('${r.id}')">
              <div style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-right:12px;background:${r.type==='income'?'rgba(52,199,89,0.1)':'rgba(255,59,48,0.1)'};font-size:18px;">
                ${r.type === 'income' ? '↓' : '↑'}
              </div>
              <div style="flex:1;">
                <div style="font-weight:500;">${r.category || '未分类'}</div>
                <div style="font-size:12px;color:var(--text-hint)">${r.date} ${r.note ? '· ' + r.note : ''}</div>
              </div>
              <div style="font-weight:600;color:${r.type==='income'?'var(--income)':'var(--expense)'}">
                ${r.type==='income'?'+':'-'}¥${Utils.money(r.amount)}
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>
    <button class="fab" onclick="App.editFinance()">+</button>
  `;
};

App.setSavingsGoal = function() {
  const goal = Utils.storage.get('savings_goal', { targetAmount: 0 });
  const val = prompt('设置储蓄目标金额（元）', goal.targetAmount || '');
  if (val !== null) {
    const num = parseFloat(val) || 0;
    Utils.storage.set('savings_goal', { targetAmount: num });
    Utils.toast('目标已设置');
    App.route('finance');
  }
};

App.editFinance = function(id) {
  const now = new Date();
  let record = { id: '', date: Utils.formatDate(now), type: 'expense', amount: '', category: '', note: '' };
  if (id) {
    const records = Utils.storage.getMonthly('finance_records', now);
    const found = records.find(r => r.id === id);
    if (found) record = found;
  }
  const cats = record.type === 'income' ?
    ['工资','佣金','红包','其他收入'] : ['化妆','交通','餐饮','服装','道具','其他支出'];

  const html = `
    <div class="mask" id="modal-mask" onclick="if(event.target.id==='modal-mask')this.remove()">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">${id?'编辑记录':'新增记录'}</div>
          <button class="modal-close" onclick="document.getElementById('modal-mask').remove()">×</button>
        </div>
        <div class="field-group">
          <label class="label">类型</label>
          <div class="role-switch">
            <button class="role-btn ${record.type==='income'?'active':''}" onclick="App.switchFinanceType('income')">收入</button>
            <button class="role-btn ${record.type==='expense'?'active':''}" onclick="App.switchFinanceType('expense')">支出</button>
          </div>
          <input type="hidden" id="f-type" value="${record.type}">
        </div>
        <div class="field-group"><label class="label">日期</label><input class="input" type="date" id="f-date" value="${record.date}"></div>
        <div class="field-group"><label class="label">金额</label><input class="input" type="number" id="f-amount" value="${record.amount||''}" placeholder="如：100"></div>
        <div class="field-group"><label class="label">类别</label><select class="input" id="f-category">${cats.map(c=>`<option value="${c}" ${record.category===c?'selected':''}>${c}</option>`).join('')}</select></div>
        <div class="field-group"><label class="label">备注</label><input class="input" id="f-note" value="${record.note||''}" placeholder="备注说明"></div>
        <div class="flex-row" style="gap:8px;margin-top:16px;">
          <button class="btn btn-primary btn-block" onclick="App.saveFinance('${id||''}')">保存</button>
          ${id?`<button class="btn btn-danger btn-block" onclick="App.deleteFinance('${id}')">删除</button>`:''}
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
};

App.switchFinanceType = function(type) {
  document.getElementById('f-type').value = type;
  const cats = type === 'income' ? ['工资','佣金','红包','其他收入'] : ['化妆','交通','餐饮','服装','道具','其他支出'];
  document.getElementById('f-category').innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
  document.querySelectorAll('#modal-mask .role-btn').forEach((btn, i) => {
    btn.classList.toggle('active', (type === 'income' && i === 0) || (type === 'expense' && i === 1));
  });
};

App.saveFinance = function(id) {
  const now = new Date();
  const date = Utils.parseDate(document.getElementById('f-date').value);
  const records = Utils.storage.getMonthly('finance_records', date);
  const data = {
    id: id || Utils.genId(),
    date: document.getElementById('f-date').value,
    type: document.getElementById('f-type').value,
    amount: document.getElementById('f-amount').value,
    category: document.getElementById('f-category').value,
    note: document.getElementById('f-note').value
  };
  if (!data.amount) { Utils.toast('请输入金额'); return; }
  if (id) {
    // 如果日期变了，先从旧月份删掉
    const idx = records.findIndex(r => r.id === id);
    if (idx >= 0) records[idx] = data;
    else records.push(data);
  } else {
    records.push(data);
  }
  Utils.storage.setMonthly('finance_records', date, records);
  document.getElementById('modal-mask').remove();
  Utils.toast('保存成功');
  App.route('finance');
};

App.deleteFinance = function(id) {
  if (!Utils.confirm('确认删除该记录？')) return;
  const now = new Date();
  let records = Utils.storage.getMonthly('finance_records', now);
  records = records.filter(r => r.id !== id);
  Utils.storage.setMonthly('finance_records', now, records);
  document.getElementById('modal-mask').remove();
  Utils.toast('已删除');
  App.route('finance');
};
