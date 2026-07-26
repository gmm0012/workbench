// 模块：设置页
Pages.settings = function(view) {
  const role = App.role;
  view.innerHTML = `
    <div class="gradient-header">
      <div class="flex-between">
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.back()">‹ 返回</button>
        <div style="font-size:16px;font-weight:600;color:#fff;">设置</div>
        <div style="width:40px;"></div>
      </div>
    </div>
    <div class="container">
      <div class="card" style="margin-top:-20px;position:relative;z-index:10;">
        <div class="card-title">角色切换</div>
        <p style="font-size:12px;color:var(--text-sub);margin-bottom:12px;">切换模特/经纪人视角，两套数据独立管理</p>
        <div class="role-switch">
          <button class="role-btn ${role==='model'?'active':''}" onclick="App.switchRole('model')">模特</button>
          <button class="role-btn ${role==='agent'?'active':''}" onclick="App.switchRole('agent')">经纪人</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">数据管理</div>
        <div class="list-item" style="cursor:pointer;" onclick="App.exportData()">
          <div style="flex:1;">
            <div style="font-weight:500;">📤 导出数据</div>
            <div style="font-size:12px;color:var(--text-hint);">复制所有本地数据</div>
          </div>
          <div style="color:var(--text-hint);">›</div>
        </div>
        <div class="list-item" style="cursor:pointer;" onclick="App.clearAllData()">
          <div style="flex:1;">
            <div style="font-weight:500;color:var(--danger);">🗑️ 清空数据</div>
            <div style="font-size:12px;color:var(--text-hint);">清空所有本地数据（不可恢复）</div>
          </div>
          <div style="color:var(--text-hint);">›</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">关于</div>
        <div class="list-item">
          <div style="flex:1;">
            <div style="font-weight:500;">应用名称</div>
          </div>
          <div style="font-size:13px;color:var(--text-hint);">OO的工作台</div>
        </div>
        <div class="list-item">
          <div style="flex:1;">
            <div style="font-weight:500;">版本号</div>
          </div>
          <div style="font-size:13px;color:var(--text-hint);">v1.0.0</div>
        </div>
      </div>

      <div style="text-align:center;padding:24px 0;font-size:12px;color:var(--text-hint);">
        OO的工作台 · 模特经纪人一站式工作台
      </div>
    </div>
  `;
};

App.exportData = function() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    data[key] = JSON.parse(localStorage.getItem(key));
  }
  const text = JSON.stringify(data, null, 2);
  navigator.clipboard.writeText(text).then(() => {
    Utils.toast('数据已复制到剪贴板');
  }).catch(() => {
    prompt('复制以下数据：', text);
  });
};

App.clearAllData = function() {
  if (!Utils.confirm('确定清空所有本地数据？此操作不可恢复！')) return;
  localStorage.clear();
  Utils.toast('数据已清空');
  App.route('workbench');
};
