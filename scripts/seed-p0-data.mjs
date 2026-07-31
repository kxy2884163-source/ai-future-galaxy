// scripts/seed-p0-data.mjs
// 一次性脚本 · 用 service_role key 录 12 条 resources + 18 个 tools 到 Supabase
// 拍板：2026-07-31 P0 · 真实数据录入
// 用法：node scripts/seed-p0-data.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const [k, ...v] = l.split('=');
      return [k.trim(), v.join('=').trim()];
    })
);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 老大 user_id（user_profiles 唯一注册用户）
const OWNER_ID = 'd18099d4-ad89-4552-8640-68625ad463da';

// ==============================
// 12 条 resources（来自 resource.html MOCK_RESOURCES）
// ==============================
const RESOURCES = [
  { id: '01', type: 'prompt',      title: '30+ ChatGPT 提效 Prompt 模板',         desc: '从写作到编程，从学习到规划，直接套用。',       icon: '💬', fav: 1280, dl: 8600,  tags: ['chatgpt','效率','模板'] },
  { id: '02', type: 'prompt',      title: 'Stable Diffusion 摄影 Prompt 大全',     desc: '真实摄影风格关键词组合（人像/风景/街拍）。',   icon: '📸', fav: 950,  dl: 5200,  tags: ['sd','摄影','关键词'] },
  { id: '03', type: 'prompt',      title: 'Midjourney 角色一致性 Prompt 技巧',    desc: '多视图角色设计 · 跨场景一致性。',             icon: '🎭', fav: 730,  dl: 4100,  tags: ['mj','角色','一致性'] },
  { id: '04', type: 'model',       title: 'Llama 3 开源大模型完全指南',           desc: '本地部署 + 微调 + 应用案例。',                 icon: '🦙', fav: 1820, dl: 9800,  tags: ['llama','开源','部署'] },
  { id: '05', type: 'model',       title: 'Mixtral 8x7B 模型对比评测',            desc: '跟 GPT-3.5 / Claude Haiku 全方位对比。',      icon: '🌪️', fav: 670,  dl: 3100,  tags: ['mixtral','评测','对比'] },
  { id: '06', type: 'tool',        title: 'Cursor 实战指南 · 写代码 ×10',         desc: '从入门到精通 · Composing / Debug / Refactor。', icon: '⌨️', fav: 2100, dl: 12500, tags: ['cursor','编程','ide'] },
  { id: '07', type: 'tool',        title: 'Perplexity 深度用法 · 替代 Google',    desc: 'Pro Search · Focus · Spaces 全攻略。',        icon: '🔍', fav: 1340, dl: 7400,  tags: ['perplexity','搜索','引用'] },
  { id: '08', type: 'tool',        title: 'n8n + AI 自动化工作流',                desc: '把多个 AI 工具串起来，每天省 3 小时。',       icon: '⚡', fav: 880,  dl: 4600,  tags: ['n8n','自动化','工作流'] },
  { id: '09', type: 'dataset',     title: 'Alpaca 数据集 · 5 万条指令微调',       desc: '开源指令微调数据集 · LLaMA 训练必备。',       icon: '📦', fav: 540,  dl: 2900,  tags: ['alpaca','微调','数据集'] },
  { id: '10', type: 'dataset',     title: 'ShareGPT 中文翻译版 · 8 万条',         desc: '高质量多轮对话数据集，支持中文微调。',         icon: '💾', fav: 620,  dl: 3400,  tags: ['sharegpt','中文','微调'] },
  { id: '11', type: 'inspiration', title: 'AI 生成艺术 Top 100 案例',              desc: '从 DALL·E 到 Midjourney · 创意灵感。',         icon: '🎨', fav: 1560, dl: 6900,  tags: ['艺术','灵感','案例'] },
  { id: '12', type: 'inspiration', title: 'AI 短剧剧本创作实战 30 篇',            desc: '结构化提示词 + 完整剧本 · 直接复用。',         icon: '🎬', fav: 920,  dl: 4800,  tags: ['短剧','剧本','创作'] },
];

// ==============================
// 18 个 tools（来自 tools.html 硬编码 HTML）
// slug = name · 用于 tool_favorites.tool_name 关联
// ==============================
const TOOLS = [
  // 写作类
  { slug: 'Notion AI',          name: 'Notion AI',          description: 'Notion 内置 AI · 写作总结问答',         category: 'writing', icon: '📝', url: 'https://www.notion.so/product/ai',   rating: 4.8, sort_order: 1  },
  { slug: '秘塔写作猫',          name: '秘塔写作猫',          description: '中文 AI 写作 · 改写润色 · 全文生成',   category: 'writing', icon: '🪶', url: 'https://metaso.cn/',                  rating: 4.6, sort_order: 2  },
  { slug: 'Copy.ai',            name: 'Copy.ai',            description: '营销文案 · 邮件 · 社交媒体',           category: 'writing', icon: '✍️', url: 'https://www.copy.ai/',                 rating: 4.5, sort_order: 3  },
  // 图像类
  { slug: 'Midjourney',         name: 'Midjourney',         description: '顶级 AI 绘画 · 艺术风格最强',           category: 'image',   icon: '🎨', url: 'https://www.midjourney.com/',          rating: 4.9, sort_order: 4  },
  { slug: 'Stable Diffusion',   name: 'Stable Diffusion',   description: '开源 · 本地部署 · 完全免费',            category: 'image',   icon: '🌀', url: 'https://stability.ai/',                rating: 4.7, sort_order: 5  },
  { slug: 'DALL·E 3',           name: 'DALL·E 3',           description: 'OpenAI 图像 · 提示词理解最准',          category: 'image',   icon: '🖼️', url: 'https://openai.com/dall-e-3',           rating: 4.6, sort_order: 6  },
  // 编程类
  { slug: 'Cursor',             name: 'Cursor',             description: 'AI-first IDE · 写代码效率 ×10',         category: 'code',    icon: '⌨️', url: 'https://www.cursor.com/',               rating: 4.9, sort_order: 7  },
  { slug: 'GitHub Copilot',     name: 'GitHub Copilot',     description: '行内补全 · 全 IDE 支持',                category: 'code',    icon: '🤖', url: 'https://github.com/features/copilot',  rating: 4.7, sort_order: 8  },
  { slug: 'Continue',           name: 'Continue',           description: '开源 AI 编程助手 · 自托管',              category: 'code',    icon: '↪️', url: 'https://www.continue.dev/',             rating: 4.5, sort_order: 9  },
  // 视频类
  { slug: 'Runway',             name: 'Runway',             description: 'AI 视频生成 · Gen-3 Alpha',             category: 'video',   icon: '🎬', url: 'https://runwayml.com/',                 rating: 4.7, sort_order: 10 },
  { slug: 'Pika',               name: 'Pika',               description: '文生视频 · 创意短片',                   category: 'video',   icon: '⚡', url: 'https://pika.art/',                     rating: 4.5, sort_order: 11 },
  { slug: 'Luma Dream Machine', name: 'Luma Dream Machine', description: '高质量 AI 视频 · 真实感强',             category: 'video',   icon: '🌌', url: 'https://lumalabs.ai/',                  rating: 4.4, sort_order: 12 },
  // 搜索类
  { slug: 'Perplexity',         name: 'Perplexity',         description: 'AI 搜索引擎 · 引用来源',                category: 'search',  icon: '🔍', url: 'https://www.perplexity.ai/',            rating: 4.8, sort_order: 13 },
  { slug: 'Phind',              name: 'Phind',              description: '面向开发者的 AI 搜索',                  category: 'search',  icon: '⚙️', url: 'https://www.phind.com/',                rating: 4.5, sort_order: 14 },
  { slug: 'You.com',            name: 'You.com',            description: 'AI 搜索 + 应用生态',                    category: 'search',  icon: '🌐', url: 'https://you.com/',                      rating: 4.3, sort_order: 15 },
  // 对话类
  { slug: 'ChatGPT',            name: 'ChatGPT',            description: 'OpenAI · GPT-4o · 最普及',              category: 'chat',    icon: '💬', url: 'https://chatgpt.com/',                  rating: 4.8, sort_order: 16 },
  { slug: 'Claude',             name: 'Claude',             description: 'Anthropic · 长文档 · 写作强',           category: 'chat',    icon: '✦', url: 'https://claude.ai/',                    rating: 4.8, sort_order: 17 },
  { slug: 'Gemini',             name: 'Gemini',             description: 'Google · 多模态 · 免费版强',            category: 'chat',    icon: '💎', url: 'https://gemini.google.com/',             rating: 4.6, sort_order: 18 },
];

// ==============================
// 执行
// ==============================

async function seedResources() {
  console.log(`\n📦 录 ${RESOURCES.length} 条 resources...`);
  // 先查现有 · 避免重复
  const { data: existing } = await supabase
    .from('resources')
    .select('id')
    .eq('is_draft', false);
  console.log(`  现有 resources: ${existing?.length || 0} 条`);

  // 用 type + title 判重（id 是 UUID 不能直接用 mock id 01-12）
  // 简化：删旧的 + 插新的（确保幂等）
  if (existing && existing.length > 0) {
    console.log(`  清空旧 resources...`);
    const { error: delErr } = await supabase
      .from('resources')
      .delete()
      .eq('is_draft', false);
    if (delErr) throw new Error(`清空失败: ${delErr.message}`);
  }

  const rows = RESOURCES.map((r) => ({
    user_id: OWNER_ID,
    type: r.type,
    title: r.title,
    description: r.desc,
    icon: r.icon,
    tags: r.tags,
    is_draft: false,
    likes_count: r.fav,
    favorites_count: Math.floor(r.fav * 0.18),  // 收藏/点赞 ~18%
    downloads_count: r.dl,
    views_count: r.dl * 2.5,                     // 浏览/下载 ~2.5x
  }));

  const { data, error } = await supabase
    .from('resources')
    .insert(rows)
    .select('id, title');

  if (error) throw new Error(`resources insert 失败: ${error.message}`);
  console.log(`  ✅ 录入 ${data.length} 条`);
  return data;
}

async function seedTools() {
  console.log(`\n🛠️ 录 ${TOOLS.length} 个 tools...`);
  const { data: existing } = await supabase
    .from('tools')
    .select('id');
  console.log(`  现有 tools: ${existing?.length || 0} 个`);

  if (existing && existing.length > 0) {
    console.log(`  清空旧 tools...`);
    const { error: delErr } = await supabase
      .from('tools')
      .delete()
      .gte('sort_order', 0);  // 全部
    if (delErr) throw new Error(`清空失败: ${delErr.message}`);
  }

  const rows = TOOLS.map((t) => ({
    slug: t.slug,
    name: t.name,
    description: t.description,
    category: t.category,
    icon: t.icon,
    url: t.url,
    rating: t.rating,
    sort_order: t.sort_order,
  }));

  const { data, error } = await supabase
    .from('tools')
    .insert(rows)
    .select('id, name, category');

  if (error) throw new Error(`tools insert 失败: ${error.message}`);
  console.log(`  ✅ 录入 ${data.length} 个`);
  return data;
}

async function main() {
  console.log('🚀 P0 · 真实数据录入');
  console.log(`   Supabase: ${env.SUPABASE_URL}`);
  console.log(`   Owner: ${OWNER_ID}`);

  try {
    const r = await seedResources();
    const t = await seedTools();
    console.log('\n✅ 全部录入完成');
    console.log(`   resources: ${r.length} 条`);
    console.log(`   tools: ${t.length} 个`);
  } catch (e) {
    console.error('\n❌ 录入失败:', e.message);
    process.exit(1);
  }
}

main();
