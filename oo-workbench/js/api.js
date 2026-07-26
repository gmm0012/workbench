// OO的工作台 — API 层
// MOCK=true 使用模拟数据；填入真实 Key 改为 false 即可
const API = {
  MOCK: true,

  // ===== 抠图 =====
  // 推荐服务：remove.bg / 火山引擎人像分割 / 阿里云视觉智能
  matting: {
    baseUrl: 'https://api.remove.bg/v1.0/removebg',
    apiKey: '', // 填入你的 API Key 即可启用真实抠图
  },

  // ===== 大模型（爆款拆解/选题推荐/标题生成/二创改写/数据摘要/复盘建议）=====
  // 推荐：DeepSeek / Kimi / 智谱GLM / OpenAI
  llm: {
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: '', // 填入你的 API Key 即可启用
    model: 'deepseek-chat',
  },

  // ===== 热点数据 =====
  // 推荐服务：新抖/婒数据/蝉妈妈等第三方聚合
  hotspot: {
    baseUrl: '',
    apiKey: '',
  },

  // ===== 抠图方法 =====
  async mattingImage(imageDataUrl) {
    if (this.MOCK || !this.matting.apiKey) {
      // Mock：模拟抠图延迟，返回原图
      await new Promise(r => setTimeout(r, 800));
      return { url: imageDataUrl, mocked: true };
    }
    // 真实调用：POST 到 remove.bg
    // const formData = new FormData();
    // formData.append('image_file', dataURLtoBlob(imageDataUrl));
    // formData.append('size', 'auto');
    // const res = await fetch(this.matting.baseUrl, { method: 'POST', headers: { 'X-Api-Key': this.matting.apiKey }, body: formData });
    // const blob = await res.blob();
    // return { url: URL.createObjectURL(blob) };
    return { url: imageDataUrl };
  },

  // ===== 爆款拆解 =====
  async analyzeVideo(videoInfo) {
    if (this.MOCK || !this.llm.apiKey) return this.mock.analyzeVideo(videoInfo);
    // 真实调用大模型
    // const res = await fetch(this.llm.baseUrl, { method: 'POST', headers: { 'Authorization': 'Bearer ' + this.llm.apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: this.llm.model, messages: [{role:'user', content: prompt}] }) });
    // return res.json();
    return this.mock.analyzeVideo(videoInfo);
  },

  // ===== 灵感推荐 =====
  async recommendInspirations(profile) {
    if (this.MOCK || !this.llm.apiKey) return this.mock.recommendInspirations(profile);
    return this.mock.recommendInspirations(profile);
  },

  // ===== 标题生成 =====
  async generateTitles(category) {
    if (this.MOCK || !this.llm.apiKey) return this.mock.generateTitles(category);
    return this.mock.generateTitles(category);
  },

  // ===== 内容二创 =====
  async rewriteContent(content) {
    if (this.MOCK || !this.llm.apiKey) return this.mock.rewriteContent(content);
    return this.mock.rewriteContent(content);
  },

  // ===== 数据摘要 =====
  async summarizeData(content) {
    if (this.MOCK || !this.llm.apiKey) return this.mock.summarizeData(content);
    return this.mock.summarizeData(content);
  },

  // ===== 复盘建议 =====
  async generateReview(data) {
    if (this.MOCK || !this.llm.apiKey) return this.mock.generateReview(data);
    return this.mock.generateReview(data);
  },

  // ===== 热点抓取 =====
  async fetchHotspot(platform) {
    if (this.MOCK || !this.hotspot.apiKey) return this.mock.fetchHotspot(platform);
    return this.mock.fetchHotspot(platform);
  },

  // ===== Mock 数据 =====
  mock: {
    analyzeVideo(videoInfo) {
      return Promise.resolve({
        title: videoInfo.title || '短发女生的一天｜沉浸式穿搭vlog',
        coverAnalysis: '封面采用居中构图，主体为大头特写，表情俏皮可爱，背景纯色突出人物。文字"短发女生必看"置于顶部，字号大、色彩对比强，3秒内抓住目标用户眼球。',
        scriptStructure: [
          { section: '黄金3秒钩子', content: '开头用"短发女生的烦恼你们懂吗？"制造共鸣，配合夸张表情' },
          { section: '痛点引入', content: '快速展示3个短发穿搭痛点，每个2秒' },
          { section: '解决方案', content: '按场景展示5套穿搭look，每套含前后对比' },
          { section: '互动引导', content: '结尾"你最想看哪套？评论区告诉我"引导互动' }
        ],
        hookPoint: '利用"短发女生"垂直标签精准定位人群，开头共鸣+痛点快速建立信任',
        suggestions: ['可复用"XX人群必看"的开头钩子模板','封面文字建议放大到画面1/4','脚本节奏建议每3秒一个切换点','可加入"你们觉得呢"的互动话术提升评论率']
      });
    },
    recommendInspirations(profile) {
      return Promise.resolve([
        { id:'1', topic:'短发女生夏日清爽穿搭', angle:'从"闷热困扰"切入，展示5套清凉look', scriptOutline:'钩子(2s)→痛点(6s)→5套look(40s)→互动(5s)', referenceHotspot:'夏日穿搭挑战' },
        { id:'2', topic:'可爱风短发造型教程', angle:'教学类，3分钟学会日常出门造型', scriptOutline:'成品展示(3s)→分步教学(120s)→成品对比(10s)', referenceHotspot:'发型教程热门' },
        { id:'3', topic:'短发女生职场穿搭指南', angle:'按周一到周五搭配，职场场景化', scriptOutline:'钩子(3s)→5天look(50s)→单品清单(10s)', referenceHotspot:'职场穿搭' },
        { id:'4', topic:'反差感！短发也能甜美风', angle:'打破"短发=中性"刻板印象', scriptOutline:'反差开场(3s)→3套甜美look(45s)→评论互动(5s)', referenceHotspot:'反差挑战' },
        { id:'5', topic:'短发博主的一衣多穿秘籍', angle:'省钱实用向，1件单品3种搭配', scriptOutline:'钩子(2s)→单品展示(5s)→3种搭配(45s)→总结(5s)', referenceHotspot:'一衣多穿' }
      ]);
    },
    generateTitles(category) {
      const m = {
        '穿搭': ['短发女生必看！这样穿显瘦10斤','夏日清爽穿搭｜短发女生专属搭配指南','一衣多穿秘籍！短发女孩的省钱穿搭法','职场短发穿搭｜简约不简单的5套look','反差感拉满！短发也能穿出甜美风'],
        '美妆': ['短发女生妆容重点｜3分钟出门妆','显脸小的短发+妆容搭配公式','日常通勤妆教程｜短发女生版','夏日清透底妆｜短发女生妆容分享','短发+妆容＝氛围感拉满的秘诀'],
        '日常': ['短发女生的一天｜沉浸式vlog','短发博主日常好物分享','记录短发女孩的快乐日常','短发女生的出门准备流程','今日穿搭日记｜短发可爱风'],
        'default': ['爆款标题模板1','爆款标题模板2','爆款标题模板3']
      };
      return Promise.resolve(m[category] || m['default']);
    },
    rewriteContent(content) {
      return Promise.resolve({ original: content, rewritten: `【二创版】${content}\n\n改写要点：\n1. 开头加入更抓人的钩子\n2. 优化节奏，每3秒一个信息点\n3. 结尾增加互动引导\n4. 加入个人风格化表达`, changes: ['优化开头钩子','调整节奏','增加互动','个性化表达'] });
    },
    summarizeData(content) {
      return Promise.resolve({ summary: `本文档核心要点：\n1. 行业现状与趋势分析\n2. 关键数据指标解读\n3. 实操建议与注意事项\n\n建议重点关注第2部分的数据结论，可作为报价参考依据。` });
    },
    generateReview(data) {
      return Promise.resolve({ aiSuggestion: `本周数据分析：\n\n【优势】播放量环比增长${data.growthRate||15}%，"穿搭"类内容表现最佳，建议持续产出。\n\n【待优化】完播率偏低(${data.completionRate||35}%)，建议：\n1. 缩短视频时长至60秒内\n2. 加强前3秒钩子设计\n3. 增加场景切换频次\n\n【机会点】评论区高频词"教程"，可考虑增加教学类内容。\n\n【行动项】下周建议发布3条穿搭+1条造型教程。` });
    },
    fetchHotspot(platform) {
      if (platform === 'douyin') {
        return Promise.resolve([
          { id:'1', platform:'douyin', title:'夏日穿搭挑战', heat:'985.6w', challenge:'#夏日穿搭' },
          { id:'2', platform:'douyin', title:'短发女生变美记', heat:'762.3w', challenge:'#短发女生' },
          { id:'3', platform:'douyin', title:'一衣多穿挑战', heat:'654.1w', challenge:'#一衣多穿' },
          { id:'4', platform:'douyin', title:'反差感穿搭', heat:'543.8w', challenge:'#反差穿搭' },
          { id:'5', platform:'douyin', title:'职场通勤穿搭', heat:'432.5w', challenge:'#职场穿搭' },
          { id:'6', platform:'douyin', title:'清凉夏日发型', heat:'321.7w', challenge:'#夏日发型' },
          { id:'7', platform:'douyin', title:'甜酷风格混搭', heat:'287.4w', challenge:'#甜酷风' },
          { id:'8', platform:'douyin', title:'显瘦穿搭秘籍', heat:'256.9w', challenge:'#显瘦穿搭' }
        ]);
      }
      return Promise.resolve([
        { id:'1', platform:'xiaohongshu', title:'短发女生穿搭灵感合集', heat:'128.5w', challenge:'穿搭灵感' },
        { id:'2', platform:'xiaohongshu', title:'夏日清爽look分享', heat:'98.3w', challenge:'夏日穿搭' },
        { id:'3', platform:'xiaohongshu', title:'短发造型教程｜日常出门', heat:'76.2w', challenge:'发型教程' },
        { id:'4', platform:'xiaohongshu', title:'通勤穿搭｜简约高级感', heat:'65.8w', challenge:'通勤穿搭' },
        { id:'5', platform:'xiaohongshu', title:'一衣多穿｜省钱又好看', heat:'54.1w', challenge:'一衣多穿' },
        { id:'6', platform:'xiaohongshu', title:'甜美风短发搭配', heat:'43.7w', challenge:'甜美穿搭' },
        { id:'7', platform:'xiaohongshu', title:'夏日发型清凉攻略', heat:'32.5w', challenge:'夏日发型' },
        { id:'8', platform:'xiaohongshu', title:'职场新人穿搭指南', heat:'28.4w', challenge:'职场穿搭' }
      ]);
    }
  }
};
