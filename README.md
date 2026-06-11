# 安心育儿 - AI 智能育儿小程序

> 面向 0-1 岁婴儿新手父母的微信小程序，通过科学的月龄知识 + 个性化成长记录 + AI 智能问答，帮助新手宝妈缓解育儿焦虑。

---

## 项目简介

「安心育儿」是一款微信小程序，核心解决新手父母的三大痛点：

- **不知道**：每个月宝宝会经历什么？提前了解发育特征，不再手忙脚乱
- **不会记**：宝宝的每一步成长都值得被记录，提供多维度成长追踪
- **不安心**：AI 助手 24 小时在线，随时解答育儿困惑

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | 微信原生小程序 (WXML/WXSS/JS) | 原生开发，性能最优 |
| **后端框架** | Node.js + Express | JS 全栈，前后端语言统一 |
| **ORM** | Prisma | 类型安全的数据模型管理 |
| **数据库** | MySQL 8.0 | 自建实例，自主可控 |
| **缓存** | Redis 7 | 会话管理、热点知识缓存 |
| **AI 大模型** | DeepSeek API | 流式对话（SSE），中文能力强 |
| **文件存储** | 腾讯云 COS | 图片/视频等非结构化数据 |
| **容器化** | Docker Compose | MySQL + Redis 本地开发环境 |
| **进程管理** | PM2 | 生产环境进程守护 |

---

## 项目结构

```
AI-parenting/
├── miniprogram/                  # 微信小程序前端
│   ├── app.js                    # 应用入口（登录、全局状态）
│   ├── app.json                  # 页面注册 + tabBar 配置
│   ├── app.wxss                  # 全局样式 + CSS 变量
│   ├── assets/icons/             # tabBar 图标（PNG）
│   ├── utils/
│   │   ├── request.js            # HTTP 请求封装（JWT 鉴权）
│   │   └── ageCalculator.js      # 月龄/日龄计算工具
│   └── pages/
│       ├── home/index            # 首页（日龄卡片 + 快捷功能）
│       ├── knowledge/
│       │   ├── timeline          # 月龄百科时间轴（0-12月）
│       │   └── month-detail      # 月龄详情（6大板块）
│       ├── baby/
│       │   ├── growth-record     # 成长记录时间线（TabBar页）
│       │   ├── growth-chart      # 生长曲线（Canvas 2D 图表）
│       │   ├── add-record        # 添加记录（6种记录类型）
│       │   ├── monthly-report    # 月度成长报告
│       │   └── profile           # 宝宝档案
│       ├── chat/
│       │   ├── index             # AI 助手对话页（流式输出）
│       │   └── history           # 历史对话列表
│       ├── mine/
│       │   ├── index             # 个人中心
│       │   ├── settings          # 设置
│       │   └── favorites         # 我的收藏
│       └── onboarding/index      # 首次引导（录入宝宝信息）
│
├── server/                       # Node.js 后端 API
│   ├── src/
│   │   ├── app.js                # Express 应用入口
│   │   ├── config/               # 数据库/Redis 配置
│   │   ├── middleware/            # 鉴权 + 错误处理
│   │   ├── routes/               # 路由（auth/baby/growth/knowledge/chat）
│   │   ├── services/             # 业务逻辑（AI/宝宝/COS/Redis）
│   │   └── utils/                # 工具函数
│   ├── prisma/
│   │   ├── schema.prisma         # Prisma 数据模型定义
│   │   └── init.sql              # MySQL 建表语句
│   ├── seeders/                  # 种子数据（月龄知识库）
│   ├── scripts/                  # 运维脚本
│   ├── docker-compose.yml        # 本地开发环境（MySQL + Redis）
│   └── package.json
│
├── docs/
│   └── PRD.md                    # 产品需求文档
│
└── project.config.json           # 微信开发者工具配置
```

---

## 核心功能

### 首页
- 宝宝日龄卡片（头像 + 身高体重 + 天数）
- 8 个快捷功能入口（成长记录、喂养、睡眠、疫苗、里程碑、照片、报告、个人中心）
- AI 助手入口卡片

### 月龄百科
- 0-12 月龄时间轴概览，当前月龄高亮
- 每个月龄包含 6 大板块：生理发育、能力发展、喂养指南、睡眠指南、常见问题、早教互动

### 宝宝成长
- **成长记录时间线**：按日期分组展示，支持 6 种记录类型筛选（身高体重/喂养/睡眠/里程碑/健康/照片）
- **生长曲线**：Canvas 2D 折线图，支持身高/体重切换，含数据统计和历史数据列表
- **添加记录**：统一表单页，3 列类型选择 + 动态表单字段
- **月度报告**：按月汇总成长数据

### AI 育儿助手
- DeepSeek 流式对话（SSE），实时逐字输出
- 结合宝宝月龄和成长记录的上下文感知
- 历史对话管理

### 个人中心
- 宝宝信息展示与编辑
- 收藏管理、设置

---

## 快速开始

### 环境要求

- Node.js >= 18
- 微信开发者工具
- Docker（用于运行 MySQL + Redis）

### 1. 克隆项目

```bash
git clone <repo-url>
cd AI-parenting
```

### 2. 启动数据库（Docker）

```bash
cd server
docker-compose up -d
```

### 3. 安装后端依赖并启动

```bash
cd server
npm install

# 生成 Prisma Client
npx prisma generate

# 初始化数据库表结构
mysql -u parenting_user -pparenting_pass parenting < prisma/init.sql

# 导入种子数据（月龄知识库）
npm run seed:knowledge

# 启动开发服务器
npm run dev
```

后端默认运行在 `http://localhost:3000`

### 4. 配置环境变量

在 `server/` 下创建 `.env` 文件：

```env
# 微信小程序
WX_APPID=your_wx_appid
WX_SECRET=your_wx_secret

# 数据库
DB_HOST=localhost
DB_PORT=3306
DB_NAME=parenting
DB_USER=parenting_user
DB_PASSWORD=parenting_pass

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# DeepSeek AI
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxx

# JWT
JWT_SECRET=your_jwt_secret_key

# 腾讯云 COS（可选）
COS_SECRET_ID=
COS_SECRET_KEY=
COS_BUCKET=
COS_REGION=
```

### 5. 前端开发

1. 打开**微信开发者工具**
2. 导入项目，选择 `miniprogram/` 目录
3. AppID 可使用测试号或填写正式 AppID
4. 编译运行即可预览

---

## API 接口

| 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|
| **认证** | POST | `/api/auth/login` | 微信登录（code 换 JWT） |
| **宝宝** | POST | `/api/babies` | 创建宝宝档案 |
| | GET | `/api/babies/:id` | 获取宝宝信息 |
| | PUT | `/api/babies/:id` | 更新宝宝信息 |
| **成长记录** | POST | `/api/babies/:babyId/records` | 添加记录 |
| | GET | `/api/babies/:babyId/records` | 查询记录（分页 + 类型筛选） |
| | GET | `/api/babies/:babyId/records/:id` | 记录详情 |
| | PUT | `/api/babies/:babyId/records/:id` | 更新记录 |
| | DELETE | `/api/babies/:babyId/records/:id` | 删除记录 |
| **月龄百科** | GET | `/api/knowledge/timeline` | 0-12 月龄概览 |
| | GET | `/api/knowledge/:month` | 获取某月龄全部知识 |
| **AI 对话** | POST | `/api/chat/send` | 发送消息（SSE 流式） |
| | GET | `/api/chat/conversations` | 对话列表 |
| | GET | `/api/chat/conversations/:id` | 对话详情 |

---

## 数据库设计

5 张核心表：

| 表名 | 说明 |
|------|------|
| `users` | 用户表（微信 openid、昵称、头像） |
| `babies` | 宝宝档案表（昵称、性别、出生日期、喂养方式） |
| `growth_records` | 成长记录表（类型、JSON 数据、月龄、图片） |
| `conversations` | AI 对话会话表 |
| `knowledge_base` | 月龄知识库表（0-12 月，6 个板块） |

---

## 部署

生产环境使用 Docker Compose + Nginx 部署到腾讯云 CVM：

```bash
# 构建并启动所有服务
docker-compose -f docker-compose.prod.yml up -d --build

# 查看日志
pm2 logs
```

详细部署架构参见 [docs/PRD.md](docs/PRD.md) 第五章。

---

## 开发说明

- **前端请求封装**：`miniprogram/utils/request.js` 统一处理 JWT 鉴权、登录竞态、错误提示
- **后端路由**：使用 `express.Router({ mergeParams: true })` 确保嵌套路由参数传递
- **tabBar 页面**：`growth-record`、`home/index`、`knowledge/timeline`、`chat/index` 为 tabBar 页面，跳转需用 `wx.switchTab()`
- **Canvas 图表**：生长曲线使用 `<canvas type="2d">` 独立页面方案，避免与 scroll-view 的浮层冲突

---

## 相关文档

- [产品需求文档 (PRD)](docs/PRD.md) - 完整的功能设计和技术架构文档
