// 模块：内容表格库（content-library + title-library + script-library + data-library + review）
Pages['content-library'] = function(view) {
  const titleCount = Utils.storage.get('titles', []).length;
  const scriptCount = Utils.storage.get('scripts', []).length;
  const dataCount = Utils.storage.get('datas', []).length;
  const reviewCount = Utils.storage.get('reviews', []).length;

  const libs = [
    { icon: '📝', label: '标题库', desc: '爆款标题生成与管理', count: titleCount, route: 'title-library', bg: 'rgba(123,108,246,0.1)' },
    { icon: '📄', label: '内容库', desc: '脚本/文案/拍摄大纲', count: scriptCount, route: 'script-library', bg: 'rgba(255,123,169,0.1)' },
    { icon: '📊', label: '数据库', desc: '行业数据/报价/合同', count: dataCount, route: 'data-library', bg: 'rgba(52,199,89,0.1)' },
    { icon: '📈', label: '复盘分析', desc: '数据复盘+AI优化建议', count: reviewCount, route: 'review', bg: 'rgba(255,159,10,0.1)' },
  ];

  view.innerHTML = `
    <div class="gradient-header">
      <div class="flex-between">
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.navigate('media')">‹ 返回</button>
        <div style="font-size:16px;font-weight:600;color:#fff;">内容表格库</div>
        <div style="width:40px;"></div>
      </div>
    </div>
    <div class="container">
      <div class="card" style="margin-top:-20px;position:relative;z-index:10;">
        <p style="font-size:12px;color:var(--text-hint);margin-bottom:12px;">AI持续更新的内容管理体系，所有表格支持AI定期补充</p>
      </div>
      ${libs.map(l => `
        <div class="card" style="cursor:pointer;" onclick="App.navigate('${l.route}')">
          <div class="flex-row">
            <div style="width:48px;height:48px;border-radius:12px;background:${l.bg};display:flex;align-items:center;justify-content:center;font-size:24px;margin-right:12px;">${l.icon}</div>
            <div class="flex-1">
              <div style="font-weight:600;">${l.label} <span style="font-size:11px;color:var(--text-hint);font-weight:400">(${l.count})</span></div>
              <div style="font-size:12px;color:var(--text-sub);">${l.desc}</div>
            </div>
            <div style="color:var(--text-hint);font-size:18px;">›</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

// ===== 标题库 =====
Pages['title-library'] = function(view) {
  const titles = Utils.storage.get('titles', []);
  const cats = ['全部','穿搭','美妆','日常'];

  view.innerHTML = `
    <div class="gradient-header">
      <div class="flex-between">
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.navigate('content-library')">‹ 返回</button>
        <div style="font-size:16px;font-weight:600;color:#fff;">标题库</div>
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.generateTitles()">AI生成</button>
      </div>
    </div>
    <div class="container">
      <div class="card" style="margin-top:-20px;position:relative;z-index:10;">
        <div class="filter-bar" id="title-filter">
          ${cats.map((c,i) => `<div class="filter-tag ${i===0?'active':''}" data-cat="${c}" onclick="App.filterTitles(this)">${c}</div>`).join('')}
        </div>
      </div>
      <div class="flex-row" style="gap:8px;margin-bottom:12px;">
        <input class="input flex-1" id="new-title-input" placeholder="输入标题手动添加">
        <select class="input" id="new-title-cat" style="width:80px;">
          ${cats.slice(1).map(c=>`<option value="${c}">${c}</option>`).join('')}
        </select>
        <button class="btn btn-primary btn-sm" onclick="App.addTitle()">+ 添加</button>
      </div>
      <div id="title-list">
        ${titles.length === 0 ? '<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-text">暂无标题</div></div>' :
          titles.map(t => `
            <div class="card" style="margin-bottom:8px;">
              <div class="flex-between">
                <div style="flex:1;">
                  <div style="font-weight:500;">${t.title}</div>
                  <div style="margin-top:4px;">
                    <span class="tag tag-primary">${t.category}</span>
                    <span class="tag ${t.source==='ai'?'tag-accent':'tag-default'}">${t.source==='ai'?'AI':'手动'}</span>
                    ${t.heat?`<span class="tag tag-warning">🔥${t.heat}</span>`:''}
                  </div>
                </div>
                <div class="flex-row" style="gap:4px;">
                  <button class="btn btn-secondary btn-sm" onclick="App.copyText('${t.title.replace(/'/g,"\\'")}')">复制</button>
                  <button class="todo-delete" onclick="App.deleteTitle('${t.id}')">✕</button>
                </div>
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
};

App._titleFilter = '全部';
App.filterTitles = function(el) {
  App._titleFilter = el.dataset.cat;
  el.parentElement.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const titles = Utils.storage.get('titles', []);
  const filtered = App._titleFilter === '全部' ? titles : titles.filter(t => t.category === App._titleFilter);
  const list = document.getElementById('title-list');
  list.innerHTML = filtered.length === 0 ? '<div class="empty-state"><div class="empty-text">没有匹配的标题</div></div>' :
    filtered.map(t => `
      <div class="card" style="margin-bottom:8px;">
        <div class="flex-between">
          <div style="flex:1;">
            <div style="font-weight:500;">${t.title}</div>
            <div style="margin-top:4px;">
              <span class="tag tag-primary">${t.category}</span>
              <span class="tag ${t.source==='ai'?'tag-accent':'tag-default'}">${t.source==='ai'?'AI':'手动'}</span>
              ${t.heat?`<span class="tag tag-warning">🔥${t.heat}</span>`:''}
            </div>
          </div>
          <div class="flex-row" style="gap:4px;">
            <button class="btn btn-secondary btn-sm" onclick="App.copyText('${t.title.replace(/'/g,"\\'")}')">复制</button>
            <button class="todo-delete" onclick="App.deleteTitle('${t.id}')">✕</button>
          </div>
        </div>
      </div>
    `).join('');
};

App.addTitle = function() {
  const title = document.getElementById('new-title-input').value.trim();
  if (!title) { Utils.toast('请输入标题'); return; }
  const cat = document.getElementById('new-title-cat').value;
  const titles = Utils.storage.get('titles', []);
  titles.unshift({ id: Utils.genId(), category: cat, title, heat: '', source: 'manual' });
  Utils.storage.set('titles', titles);
  document.getElementById('new-title-input').value = '';
  Utils.toast('添加成功');
  App.route('title-library');
};

App.generateTitles = async function() {
  const cats = ['穿搭','美妆','日常'];
  const cat = prompt('选择品类生成标题', '穿搭');
  if (!cat || !cats.includes(cat)) { Utils.toast('请输入：穿搭/美妆/日常'); return; }
  Utils.showLoading('AI生成中...');
  const newTitles = await API.generateTitles(cat);
  Utils.hideLoading();
  const titles = Utils.storage.get('titles', []);
  newTitles.forEach(t => titles.unshift({ id: Utils.genId(), category: cat, title: t, heat: 'AI推荐', source: 'ai' }));
  Utils.storage.set('titles', titles);
  Utils.toast(`生成了${newTitles.length}条标题`);
  App.route('title-library');
};

App.copyText = function(text) {
  navigator.clipboard.writeText(text).then(() => Utils.toast('已复制'));
};

App.deleteTitle = function(id) {
  let titles = Utils.storage.get('titles', []);
  titles = titles.filter(t => t.id !== id);
  Utils.storage.set('titles', titles);
  App.route('title-library');
};

// ===== 脚本库 =====
Pages['script-library'] = function(view) {
  const scripts = Utils.storage.get('scripts', []);
  const types = ['全部','脚本','文案','拍摄大纲','拆解报告'];

  view.innerHTML = `
    <div class="gradient-header">
      <div class="flex-between">
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.navigate('content-library')">‹ 返回</button>
        <div style="font-size:16px;font-weight:600;color:#fff;">内容库</div>
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.addScript()">+ 新增</button>
      </div>
    </div>
    <div class="container">
      <div class="card" style="margin-top:-20px;position:relative;z-index:10;">
        <div class="filter-bar" id="script-filter">
          ${types.map((t,i) => `<div class="filter-tag ${i===0?'active':''}" data-type="${t}" onclick="App.filterScripts(this)">${t}</div>`).join('')}
        </div>
      </div>
      <div id="script-list">
        ${scripts.length === 0 ? '<div class="empty-state"><div class="empty-icon">📄</div><div class="empty-text">暂无内容</div></div>' :
          scripts.map(s => `
            <div class="card" style="margin-bottom:8px;">
              <div class="flex-between">
                <div style="flex:1;">
                  <div style="font-weight:600;">${s.title}</div>
                  <div style="margin:4px 0;">
                    <span class="tag tag-primary">${s.type}</span>
                    ${(s.tags||[]).map(t=>`<span class="tag tag-default">${t}</span>`).join('')}
                  </div>
                  <div style="font-size:12px;color:var(--text-hint);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${s.content}</div>
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;">
                  <button class="btn btn-secondary btn-sm" onclick="App.rewriteScript('${s.id}')">AI二创</button>
                  <button class="todo-delete" onclick="App.deleteScript('${s.id}')">✕</button>
                </div>
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
};

App._scriptFilter = '全部';
App.filterScripts = function(el) {
  App._scriptFilter = el.dataset.type;
  el.parentElement.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const scripts = Utils.storage.get('scripts', []);
  const filtered = App._scriptFilter === '全部' ? scripts : scripts.filter(s => s.type === App._scriptFilter);
  const list = document.getElementById('script-list');
  list.innerHTML = filtered.length === 0 ? '<div class="empty-state"><div class="empty-text">没有匹配的内容</div></div>' :
    filtered.map(s => `
      <div class="card" style="margin-bottom:8px;">
        <div class="flex-between">
          <div style="flex:1;">
            <div style="font-weight:600;">${s.title}</div>
            <div style="margin:4px 0;">
              <span class="tag tag-primary">${s.type}</span>
              ${(s.tags||[]).map(t=>`<span class="tag tag-default">${t}</span>`).join('')}
            </div>
            <div style="font-size:12px;color:var(--text-hint);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${s.content}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <button class="btn btn-secondary btn-sm" onclick="App.rewriteScript('${s.id}')">AI二创</button>
            <button class="todo-delete" onclick="App.deleteScript('${s.id}')">✕</button>
          </div>
        </div>
      </div>
    `).join('');
};

App.addScript = function() {
  const types = ['脚本','文案','拍摄大纲','拆解报告'];
  const html = `
    <div class="mask" id="modal-mask" onclick="if(event.target.id==='modal-mask')this.remove()">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">新增内容</div>
          <button class="modal-close" onclick="document.getElementById('modal-mask').remove()">×</button>
        </div>
        <div class="field-group"><label class="label">标题</label><input class="input" id="f-title" placeholder="内容标题"></div>
        <div class="field-group"><label class="label">类型</label><select class="input" id="f-type">${types.map(t=>`<option value="${t}">${t}</option>`).join('')}</select></div>
        <div class="field-group"><label class="label">内容</label><textarea class="textarea" id="f-content" placeholder="输入脚本/文案/大纲内容"></textarea></div>
        <button class="btn btn-primary btn-block" onclick="App.saveScript()">保存</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
};

App.saveScript = function() {
  const title = document.getElementById('f-title').value.trim();
  const type = document.getElementById('f-type').value;
  const content = document.getElementById('f-content').value.trim();
  if (!title || !content) { Utils.toast('请填写标题和内容'); return; }
  const scripts = Utils.storage.get('scripts', []);
  scripts.unshift({ id: Utils.genId(), type, title, content, tags: [], updatedAt: Date.now() });
  Utils.storage.set('scripts', scripts);
  document.getElementById('modal-mask').remove();
  Utils.toast('保存成功');
  App.route('script-library');
};

App.rewriteScript = async function(id) {
  const scripts = Utils.storage.get('scripts', []);
  const s = scripts.find(item => item.id === id);
  if (!s) return;
  Utils.showLoading('AI二创中...');
  const result = await API.rewriteContent(s.content);
  Utils.hideLoading();
  scripts.unshift({
    id: Utils.genId(),
    type: s.type,
    title: '【二创】' + s.title,
    content: result.rewritten,
    tags: ['二创'],
    updatedAt: Date.now()
  });
  Utils.storage.set('scripts', scripts);
  Utils.toast('二创完成，已保存');
  App.route('script-library');
};

App.deleteScript = function(id) {
  if (!Utils.confirm('确认删除？')) return;
  let scripts = Utils.storage.get('scripts', []);
  scripts = scripts.filter(s => s.id !== id);
  Utils.storage.set('scripts', scripts);
  App.route('script-library');
};

// ===== 数据库 =====
Pages['data-library'] = function(view) {
  const datas = Utils.storage.get('datas', []);
  const cats = ['全部','行业数据','报价参考','合同模板'];

  view.innerHTML = `
    <div class="gradient-header">
      <div class="flex-between">
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.navigate('content-library')">‹ 返回</button>
        <div style="font-size:16px;font-weight:600;color:#fff;">数据库</div>
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.addData()">+ 新增</button>
      </div>
    </div>
    <div class="container">
      <div class="card" style="margin-top:-20px;position:relative;z-index:10;">
        <div class="filter-bar" id="data-filter">
          ${cats.map((c,i) => `<div class="filter-tag ${i===0?'active':''}" data-cat="${c}" onclick="App.filterDatas(this)">${c}</div>`).join('')}
        </div>
      </div>
      <div id="data-list">
        ${datas.length === 0 ? '<div class="empty-state"><div class="empty-icon">📊</div><div class="empty-text">暂无数据</div></div>' :
          datas.map(d => `
            <div class="card" style="margin-bottom:8px;">
              <div class="flex-between">
                <div style="flex:1;">
                  <div style="font-weight:600;">${d.title}</div>
                  <div style="margin:4px 0;"><span class="tag tag-primary">${d.category}</span></div>
                  <div style="font-size:12px;color:var(--text-hint);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${d.content}</div>
                  ${d.summary ? `<div style="font-size:11px;color:var(--primary);margin-top:4px;">📋 ${d.summary.substring(0,50)}...</div>` : ''}
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;">
                  <button class="btn btn-secondary btn-sm" onclick="App.summarizeData('${d.id}')">AI摘要</button>
                  <button class="todo-delete" onclick="App.deleteData('${d.id}')">✕</button>
                </div>
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
};

App._dataFilter = '全部';
App.filterDatas = function(el) {
  App._dataFilter = el.dataset.cat;
  el.parentElement.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const datas = Utils.storage.get('datas', []);
  const filtered = App._dataFilter === '全部' ? datas : datas.filter(d => d.category === App._dataFilter);
  const list = document.getElementById('data-list');
  list.innerHTML = filtered.length === 0 ? '<div class="empty-state"><div class="empty-text">没有匹配的数据</div></div>' :
    filtered.map(d => `
      <div class="card" style="margin-bottom:8px;">
        <div class="flex-between">
          <div style="flex:1;">
            <div style="font-weight:600;">${d.title}</div>
            <div style="margin:4px 0;"><span class="tag tag-primary">${d.category}</span></div>
            <div style="font-size:12px;color:var(--text-hint);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${d.content}</div>
            ${d.summary ? `<div style="font-size:11px;color:var(--primary);margin-top:4px;">📋 ${d.summary.substring(0,50)}...</div>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <button class="btn btn-secondary btn-sm" onclick="App.summarizeData('${d.id}')">AI摘要</button>
            <button class="todo-delete" onclick="App.deleteData('${d.id}')">✕</button>
          </div>
        </div>
      </div>
    `).join('');
};

App.addData = function() {
  const cats = ['行业数据','报价参考','合同模板'];
  const html = `
    <div class="mask" id="modal-mask" onclick="if(event.target.id==='modal-mask')this.remove()">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">新增数据</div>
          <button class="modal-close" onclick="document.getElementById('modal-mask').remove()">×</button>
        </div>
        <div class="field-group"><label class="label">标题</label><input class="input" id="f-title" placeholder="数据标题"></div>
        <div class="field-group"><label class="label">分类</label><select class="input" id="f-category">${cats.map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div>
        <div class="field-group"><label class="label">内容</label><textarea class="textarea" id="f-content" placeholder="输入数据内容"></textarea></div>
        <button class="btn btn-primary btn-block" onclick="App.saveData()">保存</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
};

App.saveData = function() {
  const title = document.getElementById('f-title').value.trim();
  const category = document.getElementById('f-category').value;
  const content = document.getElementById('f-content').value.trim();
  if (!title || !content) { Utils.toast('请填写标题和内容'); return; }
  const datas = Utils.storage.get('datas', []);
  datas.unshift({ id: Utils.genId(), category, title, content, summary: '', fileUrl: '' });
  Utils.storage.set('datas', datas);
  document.getElementById('modal-mask').remove();
  Utils.toast('保存成功');
  App.route('data-library');
};

App.summarizeData = async function(id) {
  const datas = Utils.storage.get('datas', []);
  const d = datas.find(item => item.id === id);
  if (!d) return;
  Utils.showLoading('AI生成摘要...');
  const result = await API.summarizeData(d.content);
  Utils.hideLoading();
  d.summary = result.summary;
  Utils.storage.set('datas', datas);
  Utils.toast('摘要生成完成');
  App.route('data-library');
};

App.deleteData = function(id) {
  if (!Utils.confirm('确认删除？')) return;
  let datas = Utils.storage.get('datas', []);
  datas = datas.filter(d => d.id !== id);
  Utils.storage.set('datas', datas);
  App.route('data-library');
};

// ===== 复盘分析 =====
Pages.review = function(view) {
  const reviews = Utils.storage.get('reviews', []);

  view.innerHTML = `
    <div class="gradient-header">
      <div class="flex-between">
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.navigate('content-library')">‹ 返回</button>
        <div style="font-size:16px;font-weight:600;color:#fff;">复盘分析</div>
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.addReview()">+ 新增</button>
      </div>
    </div>
    <div class="container">
      <div class="card" style="margin-top:-20px;position:relative;z-index:10;">
        <p style="font-size:12px;color:var(--text-hint);">录入播放量/涨粉/互动数据，AI自动生成优化建议</p>
      </div>
      <div id="review-list">
        ${reviews.length === 0 ? '<div class="empty-state"><div class="empty-icon">📈</div><div class="empty-text">暂无复盘数据</div></div>' :
          reviews.map(r => `
            <div class="card" style="margin-bottom:8px;">
              <div style="font-weight:600;margin-bottom:8px;">${r.period}</div>
              <div class="stats-row" style="margin-bottom:8px;">
                <div class="stats-item"><div class="stats-num">${r.views||0}</div><div class="stats-label">播放量</div></div>
                <div class="stats-item"><div class="stats-num text-success">+${r.followers||0}</div><div class="stats-label">涨粉</div></div>
                <div class="stats-item"><div class="stats-num">${r.interactions||0}</div><div class="stats-label">互动</div></div>
              </div>
              ${r.aiSuggestion ? `
                <div class="card" style="background:var(--bg);margin:8px 0;padding:12px;border-radius:8px;">
                  <div style="font-size:12px;color:var(--primary);font-weight:600;margin-bottom:4px;">🤖 AI优化建议</div>
                  <div style="font-size:12px;color:var(--text-sub);white-space:pre-wrap;">${r.aiSuggestion}</div>
                </div>
              ` : ''}
              <div class="flex-row" style="gap:8px;">
                ${!r.aiSuggestion ? `<button class="btn btn-primary btn-sm" onclick="App.generateReview('${r.id}')">生成AI建议</button>` : ''}
                <button class="todo-delete" onclick="App.deleteReview('${r.id}')">✕</button>
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
};

App.addReview = function() {
  const html = `
    <div class="mask" id="modal-mask" onclick="if(event.target.id==='modal-mask')this.remove()">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">新增复盘</div>
          <button class="modal-close" onclick="document.getElementById('modal-mask').remove()">×</button>
        </div>
        <div class="field-group"><label class="label">周期</label><input class="input" id="f-period" placeholder="如：2026年7月第1周"></div>
        <div class="field-group"><label class="label">播放量</label><input class="input" type="number" id="f-views" placeholder="如：50000"></div>
        <div class="field-group"><label class="label">涨粉数</label><input class="input" type="number" id="f-followers" placeholder="如：200"></div>
        <div class="field-group"><label class="label">互动量</label><input class="input" type="number" id="f-interactions" placeholder="如：1500"></div>
        <button class="btn btn-primary btn-block" onclick="App.saveReview()">保存</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
};

App.saveReview = function() {
  const period = document.getElementById('f-period').value.trim();
  if (!period) { Utils.toast('请输入周期'); return; }
  const reviews = Utils.storage.get('reviews', []);
  reviews.unshift({
    id: Utils.genId(),
    period,
    views: document.getElementById('f-views').value,
    followers: document.getElementById('f-followers').value,
    interactions: document.getElementById('f-interactions').value,
    aiSuggestion: ''
  });
  Utils.storage.set('reviews', reviews);
  document.getElementById('modal-mask').remove();
  Utils.toast('保存成功');
  App.route('review');
};

App.generateReview = async function(id) {
  const reviews = Utils.storage.get('reviews', []);
  const r = reviews.find(item => item.id === id);
  if (!r) return;
  Utils.showLoading('AI生成建议中...');
  const result = await API.generateReview({
    period: r.period,
    views: r.views,
    followers: r.followers,
    interactions: r.interactions
  });
  Utils.hideLoading();
  r.aiSuggestion = result.aiSuggestion;
  Utils.storage.set('reviews', reviews);
  Utils.toast('建议生成完成');
  App.route('review');
};

App.deleteReview = function(id) {
  if (!Utils.confirm('确认删除？')) return;
  let reviews = Utils.storage.get('reviews', []);
  reviews = reviews.filter(r => r.id !== id);
  Utils.storage.set('reviews', reviews);
  App.route('review');
};
