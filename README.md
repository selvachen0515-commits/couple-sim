# 情侣沟通模拟器 💑

基于 AI 的「情侣间对话练习」工具，帮助你了解：不同的沟通方式会带来什么结果。

![版本预览](https://img.shields.io/badge/version-1.0.0-rose)

## 核心功能

### 🎛️ 自定义 Ta 的性格
- **依恋类型**：安全型 / 焦虑型 / 回避型 / 混乱型
- **情绪敏感度**：低 / 中 / 高
- **沟通风格**：直给型 / 迂回型 / 沉默型

### 📖 预设场景
- 💬 回消息太慢被质疑不在乎
- 🎂 忘了重要纪念日
- 😶 冷战中，对方一直不开口
- 😤 因为工作太忙被抱怨
- 🌙 深夜突然情绪崩溃
- ✏️ 也可以自定义场景

### 💬 对话模拟
- 与 AI 扮演的「另一半」实时对话
- **关系温度计**：实时显示关系状态（❄️ → 🌡️ → 🌤️ → ☀️）
- **雷区提示**：提示你踩雷的表达方式
- **情绪解读**：查看另一半内心的真实感受
- **快捷选项**：AI 推荐的三种回复策略

### 📊 复盘解析
- **结局判定**：深度冷战 / 暂时压下去了 / 初步和解 / 真正理解
- **对话回顾**：每句话标注 🟢 加分 / 🟡 中性 / 🔴 踩雷
- **AI 分析**：沟通风格总结 + 个性化改进建议
- **改写建议**：选一句踩雷的话，AI 帮你改成更好的表达

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (状态管理)
- OpenAI API (gpt-4o-mini)

## 本地运行

```bash
# 1. 克隆项目
git clone <repo-url>
cd couple-sim

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的 OpenAI API Key

# 4. 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 部署到 Vercel

### 方式零：一键部署 (推荐)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F%3Cyour-username%3E%2Fcouple-sim&env=OPENAI_API_KEY&envDescription=OpenAI%20API%20Key&envLink=https%3A%2F%2Fplatform.openai.com%2Fapi-keys&project-name=couple-sim&repository-name=couple-sim)

1. 先把代码推送到你自己的 GitHub 仓库
2. 修改上方按钮链接里的 `<your-username>` 为你的 GitHub 用户名
3. 点击按钮，按提示配置环境变量即可

### 方式一：Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录并部署 (在项目根目录)
vercel --prod

# 3. 配置环境变量
vercel env add OPENAI_API_KEY
```

### 方式二：GitHub + Vercel 自动部署

1. 把代码推送到 GitHub 仓库
2. 在 [Vercel Dashboard](https://vercel.com/dashboard) 点击 "Add New Project"
3. 导入你的 GitHub 仓库
4. 配置环境变量 `OPENAI_API_KEY`
5. 点击 Deploy

## 配置环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI API Key (sk-...) | ✅ |

## 文件结构

```
couple-sim/
├── app/
│   ├── page.tsx              # 首页/设置页
│   ├── chat/page.tsx         # 对话页
│   ├── review/page.tsx       # 复盘页
│   └── api/
│       ├── chat/route.ts     # AI 对话接口
│       └── rewrite/route.ts  # 改写接口
├── store/
│   └── useSimStore.ts        # Zustand 状态管理
├── lib/
│   └── prompts.ts            # 系统 Prompt 构建
├── types/
│   └── index.ts              # TypeScript 类型定义
└── ...
```

## 使用建议

1. **新手模式**：从「预设场景」开始，选择焦虑型依恋 + 高敏感度，难度适中
2. **进阶练习**：自定义一个真实的场景，测试不同的回应方式
3. **复盘重点**：关注 🔴 踩雷的话，用「改写」功能学习更好的表达

## License

MIT
