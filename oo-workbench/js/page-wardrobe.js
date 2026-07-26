// 模块：服装管理（衣橱 + 上传 + 穿搭模拟器）
Pages.wardrobe = function(view) {
  const clothings = Utils.storage.get('clothings', []).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const styles = ['学院','甜美','成熟','职场','休闲','酷飒'];
  const types = ['裙子','吊带','上衣','裤子','外套','配饰'];

  view.innerHTML = `
    <div class="gradient-header">
      <div class="flex-between">
        <div>
          <div style="font-size:18px;font-weight:600;color:#fff;">我的衣橱</div>
          <div style="font-size:12px;opacity:0.8;margin-top:2px;">共 ${clothings.length} 件服装</div>
        </div>
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.navigate('clothing-upload')">+ 上传</button>
      </div>
    </div>
    <div class="container">
      <div class="card" style="margin-top:-20px;position:relative;z-index:10;">
        <div class="filter-bar" id="style-filter">
          <div class="filter-tag active" data-kind="style" data-val="" onclick="App.filterClothing(this)">全部</div>
          ${styles.map(s => `<div class="filter-tag" data-kind="style" data-val="${s}" onclick="App.filterClothing(this)">${s}</div>`).join('')}
        </div>
        <div class="filter-bar" style="margin-top:6px;" id="type-filter">
          <div class="filter-tag active" data-kind="type" data-val="" onclick="App.filterClothing(this)">全部</div>
          ${types.map(t => `<div class="filter-tag" data-kind="type" data-val="${t}" onclick="App.filterClothing(this)">${t}</div>`).join('')}
        </div>
      </div>

      <div id="clothing-list">
        ${clothings.length === 0 ? '<div class="empty-state"><div class="empty-icon">👗</div><div class="empty-text">衣橱还是空的，快上传第一件吧</div></div>' :
          '<div class="clothing-grid">' + clothings.map(c => `
            <div class="clothing-card" onclick="App.showClothingDetail('${c.id}')">
              <img class="clothing-img" src="${c.image || c.thumb || ''}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23F7F7FB%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 font-size=%2220%22>👗</text></svg>'">
              <div class="clothing-tags">
                ${(c.styles||[]).map(s => `<span class="tag tag-primary">${s}</span>`).join('')}
                ${(c.types||[]).map(t => `<span class="tag tag-accent">${t}</span>`).join('')}
              </div>
            </div>
          `).join('') + '</div>'
        }
      </div>
    </div>
  `;
};

App._clothingFilters = { style: '', type: '' };
App.filterClothing = function(el) {
  const kind = el.dataset.kind;
  const val = el.dataset.val;
  App._clothingFilters[kind] = val;
  el.parentElement.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  const clothings = Utils.storage.get('clothings', []);
  const filtered = clothings.filter(c => {
    if (App._clothingFilters.style && !(c.styles || []).includes(App._clothingFilters.style)) return false;
    if (App._clothingFilters.type && !(c.types || []).includes(App._clothingFilters.type)) return false;
    return true;
  });

  const list = document.getElementById('clothing-list');
  list.innerHTML = filtered.length === 0 ? '<div class="empty-state"><div class="empty-text">没有匹配的服装</div></div>' :
    '<div class="clothing-grid">' + filtered.map(c => `
      <div class="clothing-card" onclick="App.showClothingDetail('${c.id}')">
        <img class="clothing-img" src="${c.image || c.thumb || ''}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23F7F7FB%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 font-size=%2220%22>👗</text></svg>'">
        <div class="clothing-tags">${(c.styles||[]).map(s=>`<span class="tag tag-primary">${s}</span>`).join('')}${(c.types||[]).map(t=>`<span class="tag tag-accent">${t}</span>`).join('')}</div>
      </div>
    `).join('') + '</div>';
};

// ===== 上传服装 =====
Pages['clothing-upload'] = function(view) {
  view.innerHTML = `
    <div class="gradient-header">
      <div class="flex-between">
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.navigate('wardrobe')">‹ 返回</button>
        <div style="font-size:16px;font-weight:600;color:#fff;">上传服装</div>
        <div style="width:40px;"></div>
      </div>
    </div>
    <div class="container">
      <div class="card" style="margin-top:-20px;position:relative;z-index:10;">
        <div class="card-title">选择图片</div>
        <p style="font-size:12px;color:var(--text-hint);margin-bottom:12px;">支持拍照或从相册选择，AI自动抠图</p>
        <div class="flex-row" style="gap:12px;">
          <label class="btn btn-secondary btn-block" style="cursor:pointer;">
            📷 拍照
            <input type="file" accept="image/*" capture="camera" style="display:none;" onchange="App.onClothingImage(event)">
          </label>
          <label class="btn btn-secondary btn-block" style="cursor:pointer;">
            🖼️ 相册
            <input type="file" accept="image/*" style="display:none;" onchange="App.onClothingImage(event)">
          </label>
        </div>
        <div id="preview-area" style="margin-top:12px;"></div>
      </div>
    </div>
  `;
};

App.onClothingImage = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const area = document.getElementById('preview-area');
    area.innerHTML = `
      <img class="upload-preview" src="${dataUrl}" id="clothing-preview-img">
      <div id="matting-status" style="text-align:center;padding:12px;">
        <div class="spinner"></div>
        <div style="font-size:13px;color:var(--text-sub);margin-top:4px;">正在抠图...</div>
      </div>
    `;
    API.mattingImage(dataUrl).then(result => {
      document.getElementById('clothing-preview-img').src = result.url;
      document.getElementById('matting-status').innerHTML = `<div style="font-size:12px;color:var(--success);">✓ 抠图完成</div>`;
      area.dataset.image = result.url;
      area.innerHTML += `
        <div class="card-title" style="margin-top:12px;">分类标签</div>
        <div style="margin-bottom:8px;">
          <div style="font-size:12px;color:var(--text-sub);margin-bottom:4px;">风格</div>
          <div id="style-tags">
            ${['学院','甜美','成熟','职场','休闲','酷飒'].map(s => `<span class="filter-tag" data-val="${s}" onclick="this.classList.toggle('active')">${s}</span>`).join('')}
          </div>
        </div>
        <div style="margin-bottom:8px;">
          <div style="font-size:12px;color:var(--text-sub);margin-bottom:4px;">款式</div>
          <div id="type-tags">
            ${['裙子','吊带','上衣','裤子','外套','配饰'].map(t => `<span class="filter-tag" data-val="${t}" onclick="this.classList.toggle('active')">${t}</span>`).join('')}
          </div>
        </div>
        <div class="field-group"><label class="label">备注</label><input class="input" id="clothing-note" placeholder="如：夏季新款"></div>
        <button class="btn btn-primary btn-block" style="margin-top:8px;" onclick="App.saveClothing()">保存</button>
      `;
      area.dataset.image = result.url;
    }).catch(err => {
      console.error(err);
      document.getElementById('matting-status').innerHTML = '<div style="font-size:12px;color:var(--danger)">抠图失败，使用原图</div>';
    });
  };
  reader.readAsDataURL(file);
};

App.saveClothing = function() {
  const area = document.getElementById('preview-area');
  const image = area.dataset.image;
  if (!image) { Utils.toast('请先选择图片'); return; }
  const styles = Array.from(document.querySelectorAll('#style-tags .active')).map(el => el.dataset.val);
  const types = Array.from(document.querySelectorAll('#type-tags .active')).map(el => el.dataset.val);
  const note = document.getElementById('clothing-note').value;

  const clothings = Utils.storage.get('clothings', []);
  clothings.push({
    id: Utils.genId(),
    image: image,
    thumb: image,
    styles: styles,
    types: types,
    note: note,
    createdAt: Date.now()
  });
  Utils.storage.set('clothings', clothings);
  Utils.toast('保存成功');
  App.navigate('wardrobe');
};

App.showClothingDetail = function(id) {
  const clothings = Utils.storage.get('clothings', []);
  const c = clothings.find(item => item.id === id);
  if (!c) return;

  const html = `
    <div class="mask" id="modal-mask" onclick="if(event.target.id==='modal-mask')this.remove()">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">服装详情</div>
          <button class="modal-close" onclick="document.getElementById('modal-mask').remove()">×</button>
        </div>
        <img src="${c.image||c.thumb}" style="width:100%;border-radius:12px;margin-bottom:12px;" onerror="this.style.display='none'">
        <div style="margin-bottom:8px;">
          ${(c.styles||[]).map(s=>`<span class="tag tag-primary">${s}</span>`).join('')}
          ${(c.types||[]).map(t=>`<span class="tag tag-accent">${t}</span>`).join('')}
        </div>
        ${c.note ? `<p style="font-size:13px;color:var(--text-sub);margin-bottom:12px;">${c.note}</p>` : ''}
        <div class="flex-row" style="gap:8px;">
          <button class="btn btn-primary btn-block" onclick="App.navigate('outfit-simulator');App._addClothingToBoard('${c.id}');document.getElementById('modal-mask').remove()">加入穿搭</button>
          <button class="btn btn-danger btn-block" onclick="App.deleteClothing('${c.id}')">删除</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
};

App.deleteClothing = function(id) {
  if (!Utils.confirm('确认删除该服装？')) return;
  let clothings = Utils.storage.get('clothings', []);
  clothings = clothings.filter(c => c.id !== id);
  Utils.storage.set('clothings', clothings);
  document.getElementById('modal-mask').remove();
  Utils.toast('已删除');
  App.navigate('wardrobe');
};

// ===== 穿搭模拟器 =====
Pages['outfit-simulator'] = function(view) {
  const clothings = Utils.storage.get('clothings', []);
  const combos = Utils.storage.get('outfit_combos', []);

  view.innerHTML = `
    <div class="gradient-header">
      <div class="flex-between">
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.back()">‹ 返回</button>
        <div style="font-size:16px;font-weight:600;color:#fff;">穿搭模拟</div>
        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#fff;" onclick="App.saveOutfit()">💾 保存</button>
      </div>
    </div>
    <div class="container">
      <div class="card" style="margin-top:-20px;position:relative;z-index:10;">
        <input class="input" id="combo-name" placeholder="输入搭配名称" style="margin-bottom:12px;">
        <div class="outfit-canvas" id="outfit-canvas">
          <div class="empty-state" id="canvas-empty">
            <div class="empty-icon">👗</div>
            <div class="empty-text">从下方选择单品开始搭配</div>
          </div>
        </div>
        <div style="font-size:11px;color:var(--text-hint);text-align:center;margin:8px 0;">💡 拖拽移动 · 双指/滚轮缩放 · 点击选中后可删除</div>
      </div>

      <div class="card">
        <div class="card-title">服装单品</div>
        <div class="outfit-bar" id="clothing-bar">
          ${clothings.length === 0 ? '<div style="font-size:13px;color:var(--text-hint);padding:12px;">暂无服装，请先上传</div>' :
            clothings.map(c => `<div class="outfit-bar-item" onclick="App.addOutfitItem('${c.id}')"><img src="${c.thumb||c.image}" onerror="this.style.display='none'"></div>`).join('')
          }
        </div>
      </div>

      ${combos.length > 0 ? `
        <div class="card">
          <div class="card-title">已保存组合</div>
          ${combos.map(combo => `
            <div class="list-item">
              <img src="${combo.items[0]?.image||''}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;margin-right:12px;" onerror="this.style.display='none'">
              <div style="flex:1;font-weight:500;">${combo.name}</div>
              <button class="btn btn-secondary btn-sm" onclick="App.loadOutfit('${combo.id}')">加载</button>
              <button class="todo-delete" onclick="App.deleteOutfit('${combo.id}')">✕</button>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  // 初始化画板拖拽
  App._outfitItems = [];
  App._initOutfitCanvas();

  // 如果有预设添加的服装
  if (App._pendingClothingId) {
    setTimeout(() => { App.addOutfitItem(App._pendingClothingId); App._pendingClothingId = null; }, 100);
  }
};

App._addClothingToBoard = function(id) {
  App._pendingClothingId = id;
};

App._initOutfitCanvas = function() {
  const canvas = document.getElementById('outfit-canvas');
  if (!canvas) return;
};

App._outfitZCounter = 0;

App.addOutfitItem = function(clothingId) {
  const clothings = Utils.storage.get('clothings', []);
  const c = clothings.find(item => item.id === clothingId);
  if (!c) return;

  const canvas = document.getElementById('outfit-canvas');
  const empty = document.getElementById('canvas-empty');
  if (empty) empty.style.display = 'none';

  App._outfitZCounter++;
  const itemId = 'outfit-' + Utils.genId();
  const item = {
    id: itemId,
    image: c.thumb || c.image,
    sourceId: c.id,
    x: 80 + Math.random() * 60,
    y: 80 + Math.random() * 80,
    scale: 1,
    rotate: 0,
    z: App._outfitZCounter
  };
  App._outfitItems = App._outfitItems || [];
  App._outfitItems.push(item);

  const el = document.createElement('div');
  el.className = 'outfit-item';
  el.id = itemId;
  el.style.left = item.x + 'px';
  el.style.top = item.y + 'px';
  el.style.zIndex = item.z;
  el.style.transform = `scale(${item.scale}) rotate(${item.rotate}deg)`;
  el.innerHTML = `<img src="${item.image}" onerror="this.style.display='none'">`;

  // 拖拽
  let dragging = false;
  let startX, startY, startLeft, startTop;
  el.addEventListener('mousedown', (e) => {
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    startLeft = parseFloat(el.style.left);
    startTop = parseFloat(el.style.top);
    App._selectOutfitItem(itemId);
    e.preventDefault();
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    el.style.left = (startLeft + dx) + 'px';
    el.style.top = (startTop + dy) + 'px';
  });
  document.addEventListener('mouseup', () => { dragging = false; });

  // 触摸拖拽
  el.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      dragging = true;
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY;
      startLeft = parseFloat(el.style.left);
      startTop = parseFloat(el.style.top);
      App._selectOutfitItem(itemId);
    }
  });
  el.addEventListener('touchmove', (e) => {
    if (!dragging || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    el.style.left = (startLeft + dx) + 'px';
    el.style.top = (startTop + dy) + 'px';
    e.preventDefault();
  });
  el.addEventListener('touchend', () => { dragging = false; });

  // 滚轮缩放
  el.addEventListener('wheel', (e) => {
    e.preventDefault();
    const itemData = App._outfitItems.find(i => i.id === itemId);
    if (!itemData) return;
    itemData.scale = Math.max(0.3, Math.min(3, itemData.scale + (e.deltaY > 0 ? -0.1 : 0.1)));
    el.style.transform = `scale(${itemData.scale}) rotate(${itemData.rotate}deg)`;
  });

  canvas.appendChild(el);
  App._selectOutfitItem(itemId);
};

App._selectOutfitItem = function(id) {
  document.querySelectorAll('.outfit-item').forEach(el => el.classList.remove('selected'));
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('selected');
    // 置顶
    App._outfitZCounter++;
    el.style.zIndex = App._outfitZCounter;
    const item = App._outfitItems.find(i => i.id === id);
    if (item) item.z = App._outfitZCounter;

    // 添加删除按钮
    if (!el.querySelector('.outfit-delete')) {
      const del = document.createElement('button');
      del.className = 'outfit-delete';
      del.textContent = '×';
      del.onclick = (e) => {
        e.stopPropagation();
        el.remove();
        App._outfitItems = App._outfitItems.filter(i => i.id !== id);
        if (App._outfitItems.length === 0) {
          const empty = document.getElementById('canvas-empty');
          if (empty) empty.style.display = 'block';
        }
      };
      el.appendChild(del);
    }
  }
};

App.saveOutfit = function() {
  if (!App._outfitItems || App._outfitItems.length === 0) {
    Utils.toast('画板为空');
    return;
  }
  const name = document.getElementById('combo-name').value || '穿搭组合' + (Utils.storage.get('outfit_combos', []).length + 1);
  const combos = Utils.storage.get('outfit_combos', []);
  const newCombo = {
    id: Utils.genId(),
    name: name,
    items: App._outfitItems.map(it => ({
      clothingId: it.sourceId,
      image: it.image,
      x: parseFloat(document.getElementById(it.id)?.style.left || it.x),
      y: parseFloat(document.getElementById(it.id)?.style.top || it.y),
      scale: it.scale,
      rotate: it.rotate,
      z: it.z
    })),
    createdAt: Date.now()
  };
  combos.unshift(newCombo);
  Utils.storage.set('outfit_combos', combos);
  Utils.toast('保存成功');
  App.route('outfit-simulator');
};

App.loadOutfit = function(id) {
  const combos = Utils.storage.get('outfit_combos', []);
  const combo = combos.find(c => c.id === id);
  if (!combo) return;

  document.getElementById('combo-name').value = combo.name;
  const canvas = document.getElementById('outfit-canvas');
  canvas.innerHTML = '<div class="empty-state" id="canvas-empty" style="display:none;"><div class="empty-icon">👗</div><div class="empty-text">从下方选择单品开始搭配</div></div>';
  App._outfitItems = [];
  App._outfitZCounter = 0;

  combo.items.forEach(it => {
    App._outfitZCounter++;
    const itemId = 'outfit-' + Utils.genId();
    const item = { ...it, id: itemId, sourceId: it.clothingId };
    App._outfitItems.push(item);

    const el = document.createElement('div');
    el.className = 'outfit-item';
    el.id = itemId;
    el.style.left = it.x + 'px';
    el.style.top = it.y + 'px';
    el.style.zIndex = it.z;
    el.style.transform = `scale(${it.scale}) rotate(${it.rotate}deg)`;
    el.innerHTML = `<img src="${it.image}" onerror="this.style.display='none'">`;

    // 绑定同样的拖拽事件
    let dragging = false, startX, startY, startLeft, startTop;
    el.addEventListener('mousedown', (e) => {
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      startLeft = parseFloat(el.style.left);
      startTop = parseFloat(el.style.top);
      App._selectOutfitItem(itemId);
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      el.style.left = (startLeft + e.clientX - startX) + 'px';
      el.style.top = (startTop + e.clientY - startY) + 'px';
    });
    document.addEventListener('mouseup', () => { dragging = false; });

    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        dragging = true;
        const t = e.touches[0];
        startX = t.clientX; startY = t.clientY;
        startLeft = parseFloat(el.style.left);
        startTop = parseFloat(el.style.top);
        App._selectOutfitItem(itemId);
      }
    });
    el.addEventListener('touchmove', (e) => {
      if (!dragging || e.touches.length !== 1) return;
      const t = e.touches[0];
      el.style.left = (startLeft + t.clientX - startX) + 'px';
      el.style.top = (startTop + t.clientY - startY) + 'px';
      e.preventDefault();
    });
    el.addEventListener('touchend', () => { dragging = false; });

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const itemData = App._outfitItems.find(i => i.id === itemId);
      if (!itemData) return;
      itemData.scale = Math.max(0.3, Math.min(3, itemData.scale + (e.deltaY > 0 ? -0.1 : 0.1)));
      el.style.transform = `scale(${itemData.scale}) rotate(${itemData.rotate}deg)`;
    });

    canvas.appendChild(el);
  });
};

App.deleteOutfit = function(id) {
  if (!Utils.confirm('确认删除该穿搭组合？')) return;
  let combos = Utils.storage.get('outfit_combos', []);
  combos = combos.filter(c => c.id !== id);
  Utils.storage.set('outfit_combos', combos);
  Utils.toast('已删除');
  App.route('outfit-simulator');
};
