# 安心育儿微信小程序 MVP 开发计划

## 技术栈确认

| 层级 | 选型 |
|------|------|
| 前端 | 微信原生小程序 (WXML/WXSS/JS) |
| 后端 | Node.js + Express + Prisma (ORM) |
| 数据库 | MySQL 8.0 (Docker) |
| 缓存 | Redis 7 (Docker) |
| AI | DeepSeek API (SSE 流式) |
| 向量库 | Milvus (Docker) |
| 存储 | 腾讯云 COS |
| 部署 | 腾讯云 CVM + Docker Compose + Nginx |

---

## Sprint 0: 项目初始化与基础搭建（第 1-2 天）

### Task 0.1: 初始化小程序前端项目
- 使用微信开发者工具创建小程序项目
- 目录结构：
```
miniprogram/
├── app.js / app.json / app.wxss    # 全局配置
├── pages/                           # 页面目录
├── components/                      # 公共组件
├── utils/                           # 工具函数（request封装、ageCalculator等）
├── assets/                          # 图标、图片资源
└── styles/                          # 公共样式变量
```
- 配置 `app.json`（tabBar、窗口样式、页面路径）
- 编写全局样式 `app.wxss`（CSS 变量、基础类名，对齐 Skill 设计系统）
- 封装网络请求工具 `utils/request.js`（统一 baseUrl、token 注入、错误处理）

### Task 0.2: 初始化后端项目
- `npm init` 创建 Node.js 项目
- 安装核心依赖：express, prisma, jsonwebtoken, cors, dotenv, multer, cos-nodejs-sdk-v5, openai
- 目录结构（按 PRD 5.2 节）：
```
server/
├── src/
│   ├── app.js
│   ├── config/
│   ├── routes/
│   ├── services/
│   ├── models/ (Prisma schema)
│   ├── middleware/
│   └── utils/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── seeders/
├── docker-compose.yml
├── Dockerfile
└── package.json
```
- 配置 ESLint + Prettier
- 配置 `.env` 环境变量文件

### Task 0.3: 搭建本地开发环境（Docker）
- 编写 `docker-compose.yml`（MySQL + Redis + Milvus）
- 配置 Prisma schema（对齐 PRD 5.3 节的 6 张表）
- 执行首次迁移 `npx prisma migrate dev`
- 验证数据库连接

### Task 0.4: 后端基础框架
- Express 应用入口 `app.js`（中间件注册、路由挂载、错误处理）
- JWT 鉴权中间件 `middleware/auth.js`
- 全局错误处理 `middleware/errorHandler.js`
- 参数校验中间件 `middleware/validator.js`
- 请求限流 `middleware/rateLimit.js`

---

## Sprint 1: 用户体系与宝宝档案（第 3-5 天）

### Task 1.1: 微信登录接口（后端）
- `POST /api/auth/login`：接收小程序 wx.login() 的 code
- 调用微信 code2session 接口获取 openid
- 生成 JWT token 返回
- 首次登录自动创建用户记录

### Task 1.2: 小程序登录流程（前端）
- `app.js` onLaunch 时调用登录
- Token 存储到 Storage，注入到 request header
- 登录态过期自动刷新机制

### Task 1.3: 首次引导页（前端 onboarding/index）
- 步骤引导：欢迎 -> 输入宝宝昵称 -> 选择性别 -> 输入出生日期 -> 选择喂养方式 -> 完成
- 调用 `POST /api/babies` 创建档案
- 完成后跳转首页

### Task 1.4: 宝宝档案接口（后端）
- `POST /api/babies` 创建宝宝
- `GET /api/babies/:id` 获取宝宝信息（含自动计算月龄/日龄）
- `PUT /api/babies/:id` 更新宝宝信息
- 编写 `utils/ageCalculator.js`（出生日期 -> 月龄/日龄计算）

### Task 1.5: 个人中心页（前端 mine/index）
- 展示用户头像/昵称
- 展示宝宝卡片信息
- 编辑宝宝信息入口
- 设置入口

---

## Sprint 2: 月龄百科模块（第 6-9 天）

### Task 2.1: 月龄知识内容准备
- 编写 0-6 月月龄知识种子数据（JSON 格式）
- 每个月包含 6 大板块：physiology、abilities、feeding、sleep、common_issues、early_education
- 编写 `seeders/seed-knowledge.js` 导入脚本
- 执行种子数据填充

### Task 2.2: 月龄百科接口（后端）
- `GET /api/knowledge/timeline` 返回 0-12 月龄概览（每月的 title/subtitle/status）
- `GET /api/knowledge/:month` 返回某月全部知识
- `GET /api/knowledge/:month/:section` 返回某月某板块
- Redis 缓存热点知识（TTL 1 小时）

### Task 2.3: 月龄时间轴页面（前端 knowledge/timeline）
- 纵向时间轴展示 0-12 月龄卡片
- 当前月龄高亮，已过月龄标记"已完成"
- 点击卡片跳转月龄详情页

### Task 2.4: 月龄详情页（前端 knowledge/month-detail）
- 顶部月龄标题 + 发育参考值卡片（可折叠）
- 能力发展横向滚动卡片
- 喂养指南、睡眠指南（可折叠展开）
- 常见问题手风琴展开
- 底部"问问 AI 助手"引导入口
- 对齐 wechat-parenting-ui Skill 的 UI 设计规范

---

## Sprint 3: 成长记录模块（第 10-14 天）

### Task 3.1: 成长记录接口（后端）
- `POST /api/babies/:babyId/records` 添加记录
- `GET /api/babies/:babyId/records` 查询记录列表（分页、按类型筛选、按月份分组）
- `GET /api/babies/:babyId/records/:id` 记录详情
- `PUT /api/babies/:babyId/records/:id` 更新记录
- `DELETE /api/babies/:babyId/records/:id` 删除记录
- `GET /api/babies/:babyId/growth-curve` 生长曲线数据（按时间排序的身高体重序列）

### Task 3.2: 腾讯云 COS 图片上传（后端 + 前端）
- 后端：`POST /api/upload/image` 接口（multer 接收 -> COS 上传 -> 返回 URL）
- 前端：封装 `utils/uploadImage.js`（wx.chooseImage -> wx.uploadFile）

### Task 3.3: 添加记录页（前端 baby/add-record）
- 记录类型选择（宫格：身高体重、喂养、睡眠、里程碑、照片、健康、自由记录）
- 各类型对应不同的表单
- 日期选择器、数值输入、图片上传
- 提交后刷新时间线

### Task 3.4: 成长记录时间线页（前端 baby/growth-record）
- 左侧时间线（圆点+连线，对齐 Skill 中的 timeline 样式）
- 按月份分组展示记录
- 记录卡片展示类型图标、关键数据、照片缩略图
- 浮动"+"按钮快速添加记录
- 下拉刷新 + 触底加载更多

### Task 3.5: 宝宝档案页（前端 baby/profile）
- 宝宝头像（可更换）
- 基本信息展示（昵称、性别、出生日期、月龄、喂养方式）
- 编辑入口
- 最新身高体重数据

---

## Sprint 4: AI 育儿助手（第 15-20 天）

### Task 4.1: DeepSeek API 接入（后端）
- `src/services/ai.service.js`：封装 OpenAI SDK 调用 DeepSeek
- 支持流式响应（stream: true）
- 错误处理与重试机制
- Token 用量记录

### Task 4.2: RAG 检索增强（后端）
- `src/services/rag.service.js`：构建 AI 上下文
- 从数据库获取宝宝最新记录摘要
- 根据用户问题 + 宝宝月龄检索相关知识
- `src/utils/promptBuilder.js`：构建完整 system prompt（对齐 PRD 中的人格设定）
- MVP 阶段先用关键词匹配检索，后续接入 Milvus 向量检索

### Task 4.3: 聊天接口（后端）
- `POST /api/chat/send`：SSE 流式响应
- `GET /api/chat/conversations`：对话列表
- `GET /api/chat/conversations/:id`：消息列表
- `DELETE /api/chat/conversations/:id`：删除对话
- 自动创建/管理 conversation 记录
- 保存完整对话历史到 MySQL

### Task 4.4: AI 对话页（前端 chat/index）
- 对话气泡 UI（AI 左/用户右，对齐 Skill 配色）
- 流式文字显示（逐字渲染效果）
- 底部输入框 + 发送按钮
- "猜你还想问"推荐问题标签
- 滚动到底部自动滚动
- 键盘弹起时输入框跟随

### Task 4.5: 历史对话页（前端 chat/history）
- 对话列表（标题 + 时间 + 摘要）
- 左滑删除
- 点击进入对话详情

### Task 4.6: AI 入口集成
- 首页添加 AI 入口卡片
- 月龄详情页底部添加"问问 AI"引导
- tabBar 中 AI tab 图标

---

## Sprint 5: 首页 + 整体联调（第 21-26 天）

### Task 5.1: 首页接口（后端）
- `GET /api/home/dashboard`：聚合接口
  - 宝宝日龄信息 + 最新身高体重
  - 快捷功能入口配置
  - 本月发育提醒（根据当前月龄匹配）
  - 今日推荐内容（从知识库中选取）

### Task 5.2: 首页开发（前端 home/index）
- 顶部宝宝日龄卡片（渐变背景，对齐 Skill 设计）
- 宫格功能入口
- 本月发育提醒卡片（黄色提醒风格）
- 今日推荐内容卡片
- AI 入口卡片（薄荷绿渐变）
- 下拉刷新

### Task 5.3: 全局联调与 Bug 修复
- 全部页面流程走通（引导 -> 首页 -> 百科 -> 记录 -> AI 对话）
- Token 过期处理
- 网络异常/空状态/加载态处理
- 图片上传/显示测试

### Task 5.4: UI 细节打磨
- 骨架屏加载态（对齐 Skill 中的 skeleton 样式）
- 空状态组件（对齐 Skill 中的 empty-state）
- 入场动画（卡片 slideUp）
- Toast 提示组件

### Task 5.5: 个人中心完善
- 设置页（关于我们、隐私协议、清除缓存）
- 收藏功能
- 消息通知（预留）

---

## Sprint 6: 部署上线（第 27-30 天）

### Task 6.1: 服务器环境准备
- 腾讯云 CVM 购买与环境配置
- 安装 Docker + Docker Compose
- 域名购买 + 备案 + SSL 证书
- 配置腾讯云 COS 存储桶

### Task 6.2: Docker 容器化部署
- 编写生产环境 `docker-compose.yml`
- 构建 Node.js Docker 镜像（Dockerfile）
- 配置 Nginx 反向代理 + HTTPS + SSE 支持
- 数据库初始化脚本
- 执行数据库迁移 + 种子数据填充

### Task 6.3: 微信小程序上线配置
- 微信公众平台配置服务器域名（request 合法域名）
- 配置 COS 上传域名到 downloadFile 合法域名
- 小程序审核提交

### Task 6.4: 测试与验收
- 全流程测试（登录 -> 引导 -> 首页 -> 百科 -> 记录 -> AI -> 个人中心）
- 不同机型适配测试（iPhone/Android，不同屏幕尺寸）
- AI 对话质量测试（多场景覆盖）
- 性能测试（首屏加载 < 2s，AI 响应 < 3s）

---

## 开发顺序依赖关系

```
Sprint 0 (项目搭建)
  |
  v
Sprint 1 (用户体系) ---------> Sprint 5 (首页)
  |                              |
  +--> Sprint 2 (月龄百科) ------+
  |                              |
  +--> Sprint 3 (成长记录) ------+
  |                              |
  +--> Sprint 4 (AI助手) -------+
                                 |
                                 v
                          Sprint 6 (部署上线)
```

- Sprint 2/3/4 可并行开发（都依赖 Sprint 1 的用户体系）
- Sprint 5 首页聚合依赖 Sprint 2/3/4 的接口
- Sprint 6 部署可提前准备服务器环境（与 Sprint 5 并行）

---

## 每阶段交付物检查清单

| Sprint | 交付物 | 验收标准 |
|--------|--------|---------|
| 0 | 前后端项目骨架 + Docker 环境 | 后端能启动并返回 health check，小程序能打开空白页 |
| 1 | 登录 + 引导 + 宝宝档案 | 用户能微信登录、完成引导、创建宝宝档案 |
| 2 | 月龄百科（0-6月） | 能浏览时间轴、查看月龄详情 6 大板块 |
| 3 | 成长记录全流程 | 能添加/查看/编辑/删除记录，图片上传正常 |
| 4 | AI 对话功能 | 能发起对话、流式接收回答、回答结合宝宝上下文 |
| 5 | 首页 + 整体体验 | 首页聚合展示、全流程走通无 Bug、UI 完整 |
| 6 | 线上版本 | Docker 部署成功、HTTPS 可用、小程序审核通过 |