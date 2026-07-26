// 模块：自媒体（media + hotspot + video-analysis + inspiration）
Pages.media = function(view) {
  const titleCount = Utils.storage.get('titles', []).length;
  const scriptCount = Utils.storage.get('scripts', []).length;
  const dataCount = Utils.storage.get('datas', []).length;
  const reviewCount = Utils.storage.get('reviews', []).length;

  const funcs = [
    { icon: '🔥', label: '热点抓取', desc: '实时热点追踪', route: 'hotspot', bg: 'rgba(255,159,10,0.1)' },
    { icon: '🎬', label: '爆款拆解', desc: 'AI拆解视频', route: 'video-analysis', bg: 'rgba(123,108,246,0.1)' },
    { icon: '💡', label: '灵感推荐', desc: 'AI选题推荐', route: 'inspiration', bg: 'rgba(255,123,169,0.1)' },
    { icon: '📚', label: '内容库', desc: '标题/脚本/数据', route: 'content-library', bg: 'rgba(52,199,89,0.1)' },
  ];

  view.innerHTML = `
    <div class="gradient-header">
      <div style="font-size:20px;font-weight:700;color:#fff;">自媒体中心</div>
    </div>
    <div class="container">
      <div class="card" style="margin-top:-20px;position:relative;z-index:10;">
        <div class="flex-row" style="gap:12px;">
          <div style="width:56px;height:56px;border-radius:50%;background:rgba(123,108,246,0.1);display:flex;align-items:center;justify-content:center;font-size:28px;">👧</div>
          <div class="flex-1">
            <div style="font-weight:600;font-size:16px;">短发·可爱风女博主</div>
            <div style="font-size:12px;color:var(--text-sub)">专注穿搭 | 美妆 | 日常分享</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">功能入口</div>
        <div class="func-grid" style="grid-template-columns:repeat(2,1fr);gap:12px;">
          ${funcs.map(f => `
            <div class="card" style="margin:0;cursor:pointer;padding:16px;text-align:center;" onclick="App.navigate('${f.route}')">
              <div class="func-icon" style="background:${f.bg};margin:0 auto 8px;width:48px;height:48px;font-size:24px;border-radius:12px;">${f.icon}</div>
              <div style="font-weight:600;font-size:14px;">${f.label}</div>
              <div style="font-size:11px;color:var(--text-hint)">${f.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-title">快捷入口</div>
        <div class="flex-row" style="gap:12px;">
          <button class="btn btn-secondary btn-block" onclick="App.navigate('finance')">💰 财务管理</button>
          <button class="btn btn-secondary btn-block" onclick="App.navigate('wardrobe')">👗 衣橱管理</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">内容数据概览</div>
        <div class="stats-row">
          <div class="stats-item"><div class="stats-num text-primary">${titleCount}</div><div class="stats-label">标题库</div></div>
          <div class="stats-item"><div class="stats-num text-primary">${scriptCount}</div><div class="stats-label">脚本库</div></div>
          <div class="stats-item"><div class="stats-num text-primary">${dataCount}</div><div class="stats-label">数据库</div></div>
          <div class="stats-item"><div class="stats-num text-primary">${reviewCount}</div><div class="stats-label">复盘</div></div>
        </div>
      </div>
    </div>
  `;
};

// ===== 热点抓取 =====
Pages.hotspot = function(view) {
  view.innerHTML = `
    <div class="gradient-header">
      <div class="flex-between">
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.navigate('media')">‹ 返回</button>
        <div style="font-size:16px;font-weight:600;color:#fff;">热点抓取</div>
        <div style="width:40px;"></div>
      </div>
    </div>
    <div class="container">
      <div class="card" style="margin-top:-20px;position:relative;z-index:10;">
        <div class="role-switch">
          <button class="role-btn active" id="tab-douyin" onclick="App.switchHotspotPlatform('douyin')">抖音</button>
          <button class="role-btn" id="tab-xiaohongshu" onclick="App.switchHotspotPlatform('xiaohongshu')">小红书</button>
        </div>
      </div>
      <div id="hotspot-list"><div class="loading"><div class="spinner"></div>加载中...</div></div>
    </div>
  `;
  App._hotspotPlatform = 'douyin';
  App.loadHotspot();
};

App.switchHotspotPlatform = function(platform) {
  App._hotspotPlatform = platform;
  document.getElementById('tab-douyin').classList.toggle('active', platform === 'douyin');
  document.getElementById('tab-xiaohongshu').classList.toggle('active', platform === 'xiaohongshu');
  App.loadHotspot();
};

App.loadHotspot = function() {
  const list = document.getElementById('hotspot-list');
  list.innerHTML = '<div class="loading"><div class="spinner"></div>加载中...</div>';
  API.fetchHotspot(App._hotspotPlatform).then(items => {
    list.innerHTML = items.length === 0 ? '<div class="empty-state"><div class="empty-text">暂无热点</div></div>' :
      items.map(h => `
        <div class="card" style="margin-bottom:8px;">
          <div class="flex-between">
            <div style="flex:1;">
              <div style="font-weight:600;">${h.title}</div>
              <div style="font-size:12px;color:var(--text-hint);margin-top:4px;">
                <span class="tag tag-warning">🔥 ${h.heat}</span>
                <span class="tag tag-primary">${h.challenge}</span>
              </div>
            </div>
          </div>
        </div>
      `).join('');
  });
};

// ===== 爆款拆解 =====
Pages['video-analysis'] = function(view) {
  view.innerHTML = `
    <div class="gradient-header">
      <div class="flex-between">
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.navigate('media')">‹ 返回</button>
        <div style="font-size:16px;font-weight:600;color:#fff;">爆款拆解</div>
        <div style="width:40px;"></div>
      </div>
    </div>
    <div class="container">
      <div class="card" style="margin-top:-20px;position:relative;z-index:10;">
        <div class="card-title">输入视频信息</div>
        <input class="input" id="video-input" placeholder="输入爆款视频标题或链接" style="margin-bottom:12px;">
        <button class="btn btn-primary btn-block" onclick="App.startAnalysis()">🤖 开始AI拆解</button>
      </div>
      <div id="analysis-result"></div>
    </div>
  `;
};

App.startAnalysis = function() {
  const input = document.getElementById('video-input').value.trim();
  if (!input) { Utils.toast('请输入视频标题或链接'); return; }
  const result = document.getElementById('analysis-result');
  result.innerHTML = '<div class="loading"><div class="spinner"></div>AI分析中...</div>';
  API.analyzeVideo({ title: input }).then(res => {
    result.innerHTML = `
      <div class="card">
        <div class="card-title">📝 封面分析</div>
        <p style="font-size:13px;">${res.coverAnalysis}</p>
      </div>
      <div class="card">
        <div class="card-title">🎬 脚本结构</div>
        ${res.scriptStructure.map(s => `
          <div style="margin-bottom:10px;">
            <div style="font-weight:600;font-size:13px;color:var(--primary);">${s.section}</div>
            <div style="font-size:13px;color:var(--text-sub);margin-top:2px;">${s.content}</div>
          </div>
        `).join('')}
      </div>
      <div class="card">
        <div class="card-title">🎯 钩子点分析</div>
        <p style="font-size:13px;">${res.hookPoint}</p>
      </div>
      <div class="card">
        <div class="card-title">✅ 可复用建议</div>
        ${res.suggestions.map((s, i) => `<div style="margin-bottom:6px;font-size:13px;">${i+1}. ${s}</div>`).join('')}
      </div>
      <button class="btn btn-secondary btn-block" onclick="App.saveAnalysisToScripts()">💾 保存到脚本库</button>
    `;
    App._lastAnalysis = { input, res };
  }).catch(() => {
    result.innerHTML = '<div class="empty-state"><div class="empty-text">分析失败，请重试</div></div>';
  });
};

App.saveAnalysisToScripts = function() {
  if (!App._lastAnalysis) return;
  const scripts = Utils.storage.get('scripts', []);
  scripts.unshift({
    id: Utils.genId(),
    type: '拆解报告',
    title: App._lastAnalysis.input,
    content: App._lastAnalysis.res.coverAnalysis + '\n\n' + App._lastAnalysis.res.scriptStructure.map(s => `${s.section}: ${s.content}`).join('\n'),
    tags: ['爆款拆解'],
    updatedAt: Date.now()
  });
  Utils.storage.set('scripts', scripts);
  Utils.toast('已保存到脚本库');
};

// ===== 灵感推荐 =====
Pages.inspiration = function(view) {
  view.innerHTML = `
    <div class="gradient-header">
      <div class="flex-between">
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.navigate('media')">‹ 返回</button>
        <div style="font-size:16px;font-weight:600;color:#fff;">灵感推荐</div>
        <div style="width:40px;"></div>
      </div>
    </div>
    <div class="container">
      <div class="card" style="margin-top:-20px;position:relative;z-index:10;">
        <p style="font-size:12px;color:var(--text-hint);margin-bottom:12px;">结合当前热点+短发可爱风格人设，AI每周推荐3-5条选题</p>
        <button class="btn btn-primary btn-block" onclick="App.loadInspirations()">💡 生成本周选题</button>
      </div>
      <div id="inspiration-list"></div>
    </div>
  `;
};

App.loadInspirations = function() {
  const list = document.getElementById('inspiration-list');
  list.innerHTML = '<div class="loading"><div class="spinner"></div>AI生成中...</div>';
  API.recommendInspirations('短发可爱风格女博主').then(items => {
    list.innerHTML = items.map((ins, i) => `
      <div class="card">
        <div class="flex-between" style="margin-bottom:8px;">
          <div style="font-weight:600;font-size:15px;color:var(--primary);">${i+1}. ${ins.topic}</div>
        </div>
        <div style="font-size:13px;color:var(--text-sub);margin-bottom:6px;">📐 ${ins.angle}</div>
        <div style="font-size:12px;color:var(--text-hint);margin-bottom:6px;">📝 ${ins.scriptOutline}</div>
        <div><span class="tag tag-accent">参考热点: ${ins.referenceHotspot}</span></div>
        <div class="flex-row" style="gap:8px;margin-top:10px;">
          <button class="btn btn-secondary btn-sm" onclick="App.inspirationToTitle('${ins.topic}')">加入标题库</button>
          <button class="btn btn-secondary btn-sm" onclick="App.inspirationToScript('${ins.topic}','${ins.scriptOutline}')">开始创作</button>
        </div>
      </div>
    `).join('');
  });
};

App.inspirationToTitle = function(topic) {
  const titles = Utils.storage.get('titles', []);
  titles.unshift({ id: Utils.genId(), category: '日常', title: topic, heat: 'AI推荐', source: 'ai' });
  Utils.storage.set('titles', titles);
  Utils.toast('已加入标题库');
};

App.inspirationToScript = function(topic, outline) {
  const scripts = Utils.storage.get('scripts', []);
  scripts.unshift({ id: Utils.genId(), type: '拍摄大纲', title: topic, content: outline, tags: ['灵感'], updatedAt: Date.now() });
  Utils.storage.set('scripts', scripts);
  Utils.toast('已加入脚本库');
};
