---
name: wechat-parenting-ui
description: Design and build WeChat Mini Program pages for parenting/childcare applications. Covers WXML/WXSS component patterns, rpx responsive layout, warm color schemes, rounded card designs, and common parenting app pages (home feed, baby growth tracker, parenting tips, community forum, milestone timeline). Use when creating Mini Program pages, designing parenting UI components, or building childcare-related WeChat features.
---

# 育儿微信小程序 UI 设计与开发

## 设计理念

育儿类小程序应传递 **温暖、安心、专业** 的感受。设计方向：
- **温暖柔和**：圆角、暖色调、柔和阴影，避免尖锐棱角和刺眼色彩
- **亲和可爱**：适当使用插画风图标、萌系元素，但不过度幼稚
- **信息清晰**：新手父母常处于疲惫状态，信息层级必须清晰易读
- **操作简便**：单手操作友好（抱娃场景），关键按钮足够大

## 设计系统

### 配色方案

```css
/* 主色 - 温暖珊瑚粉 */
--color-primary: #FF8A80;
--color-primary-light: #FFBCB5;
--color-primary-dark: #E56B62;

/* 辅助色 - 柔和薄荷绿 */
--color-secondary: #81C784;
--color-secondary-light: #B2DFDB;

/* 点缀色 - 阳光暖黄 */
--color-accent: #FFD54F;
--color-accent-light: #FFF3E0;

/* 中性色 */
--color-text-primary: #3E3E3E;
--color-text-secondary: #7A7A7A;
--color-text-hint: #B0B0B0;
--color-bg: #FFF9F5;
--color-bg-card: #FFFFFF;
--color-border: #F0E6E0;

/* 功能色 */
--color-success: #81C784;
--color-warning: #FFB74D;
--color-error: #E57373;
--color-info: #90CAF9;
```

支持根据场景切换配色：
- **妈妈版**：珊瑚粉 + 薄荷绿（默认）
- **爸爸版**：雾霾蓝 `#7BA7CC` + 暖灰 `#A89F91`
- **夜间模式**：深暖灰底 `#2D2A26` + 柔和文字 `#E0D8CF`

### 字体规范

```css
page {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  font-size: 28rpx;
  color: var(--color-text-primary);
  background: var(--color-bg);
}
```

| 用途 | 字号 | 字重 |
|------|------|------|
| 页面大标题 | 40rpx | 700 |
| 卡片标题 | 32rpx | 600 |
| 正文内容 | 28rpx | 400 |
| 辅助文字 | 24rpx | 400 |
| 小标签 | 20rpx | 500 |

### 间距与圆角

```css
/* 间距系统 (基于 8rpx) */
--space-xs: 8rpx;
--space-sm: 16rpx;
--space-md: 24rpx;
--space-lg: 32rpx;
--space-xl: 48rpx;

/* 圆角 */
--radius-sm: 12rpx;
--radius-md: 20rpx;
--radius-lg: 32rpx;
--radius-full: 999rpx;
```

### 通用卡片组件

```html
<!-- 基础卡片 -->
<view class="card">
  <view class="card-header">
    <image class="card-icon" src="{{icon}}" mode="aspectFit" />
    <text class="card-title">{{title}}</text>
  </view>
  <view class="card-body">
    <slot />
  </view>
</view>
```

```css
.card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin: var(--space-sm) var(--space-lg);
  box-shadow: 0 4rpx 20rpx rgba(255, 138, 128, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-md);
}

.card-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: var(--space-sm);
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-text-primary);
}
```

## 页面模板

### 1. 首页（信息流 + 功能入口）

```
┌─────────────────────────┐
│  🌟 宝宝今天 128 天啦     │  ← 宝宝日龄卡片
│  [头像]  体重 6.8kg ↑     │
├─────────────────────────┤
│  ○ 成长记录  ○ 喂养提醒   │  ← 快捷功能入口(宫格)
│  ○ 睡眠追踪  ○ 疫苗接种   │
├─────────────────────────┤
│  📖 今日推荐               │  ← 内容推荐卡片
│  ┌───────────────────┐   │
│  │ [图] 6月龄辅食指南  │   │
│  │ 阅读 2.3k · ❤ 186  │   │
│  └───────────────────┘   │
├─────────────────────────┤
│  🏠    📖    👶    👥     │  ← TabBar
└─────────────────────────┘
```

关键设计点：
- 顶部宝宝日龄卡片使用渐变背景 `linear-gradient(135deg, #FF8A80, #FFBCB5)`
- 功能入口使用圆形图标 + 柔和阴影
- 内容卡片图文混排，图片使用 `border-radius: var(--radius-md)`

### 2. 成长记录页（时间线）

```
┌─────────────────────────┐
│  ← 成长记录     [添加+]  │
├─────────────────────────┤
│  2026年6月               │
│  ●─── 6月5日              │  ← 左侧时间线
│  │  📸 第一次翻身          │     用圆点+连线
│  │  [照片墙]              │
│  │                       │
│  ●─── 6月1日              │
│  │  📏 身高 65cm 体重 7kg │
│  │  [生长曲线图表]         │
└─────────────────────────┘
```

时间线实现要点：
```css
.timeline-item {
  display: flex;
  padding-left: var(--space-lg);
  position: relative;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 20rpx;
  top: 60rpx;
  bottom: -20rpx;
  width: 4rpx;
  background: var(--color-primary-light);
}

.timeline-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  border: 6rpx solid var(--color-primary-light);
  position: absolute;
  left: 10rpx;
  top: 10rpx;
}
```

### 3. 育儿知识列表页

```
┌─────────────────────────┐
│  育儿百科                 │
├─────────────────────────┤
│  [全部][喂养][睡眠][早教]  │  ← 横向滚动分类标签
├─────────────────────────┤
│  ┌─────┐                │
│  │ 图片 │ 标题文字        │  ← 左图右文列表
│  │     │ 摘要...         │
│  └─────┘ 2.3k阅读        │
│  ─────────────────────── │
│  ┌─────┐                │
│  │ 图片 │ 标题文字        │
│  └─────┘                │
└─────────────────────────┘
```

分类标签使用 `scroll-view` 横向滚动：
```html
<scroll-view scroll-x class="tag-scroll">
  <view wx:for="{{categories}}" wx:key="id"
    class="tag {{activeTag === item.id ? 'tag-active' : ''}}"
    bindtap="onTagTap" data-id="{{item.id}}">
    {{item.name}}
  </view>
</scroll-view>
```

```css
.tag-scroll {
  white-space: nowrap;
  padding: var(--space-sm) var(--space-lg);
}

.tag {
  display: inline-block;
  padding: 12rpx 32rpx;
  margin-right: var(--space-sm);
  border-radius: var(--radius-full);
  background: var(--color-bg-card);
  font-size: 26rpx;
  color: var(--color-text-secondary);
}

.tag-active {
  background: var(--color-primary);
  color: #FFFFFF;
  font-weight: 500;
}
```

### 4. 宝宝成长记录详情页

表单设计（单手友好）：
```html
<view class="form-card card">
  <view class="form-item">
    <text class="form-label">记录类型</text>
    <view class="type-selector">
      <view class="type-btn {{type === 'height' ? 'active' : ''}}"
        bindtap="selectType" data-type="height">
        <text class="type-icon">📏</text>
        <text>身高</text>
      </view>
      <view class="type-btn {{type === 'weight' ? 'active' : ''}}"
        bindtap="selectType" data-type="weight">
        <text class="type-icon">⚖️</text>
        <text>体重</text>
      </view>
      <view class="type-btn {{type === 'milestone' ? 'active' : ''}}"
        bindtap="selectType" data-type="milestone">
        <text class="type-icon">🌟</text>
        <text>里程碑</text>
      </view>
    </view>
  </view>
</view>
```

### 5. 社区互动页

帖子卡片设计：
```html
<view class="post-card card">
  <view class="post-author">
    <image class="avatar" src="{{post.avatar}}" mode="aspectFill" />
    <view class="author-info">
      <text class="nickname">{{post.nickname}}</text>
      <text class="baby-age">宝宝 {{post.babyAge}}</text>
    </view>
    <view class="post-tag">{{post.tag}}</view>
  </view>
  <text class="post-content">{{post.content}}</text>
  <view class="post-images" wx:if="{{post.images.length}}">
    <image wx:for="{{post.images}}" wx:key="index"
      class="post-img" src="{{item}}" mode="aspectFill"
      bindtap="previewImage" data-url="{{item}}" />
  </view>
  <view class="post-actions">
    <view class="action-btn" bindtap="onLike">
      <text class="action-icon">{{liked ? '❤️' : '🤍'}}</text>
      <text>{{post.likeCount}}</text>
    </view>
    <view class="action-btn" bindtap="onComment">
      <text class="action-icon">💬</text>
      <text>{{post.commentCount}}</text>
    </view>
    <view class="action-btn" bindtap="onShare">
      <text class="action-icon">🔗</text>
      <text>分享</text>
    </view>
  </view>
</view>
```

## WXML/WXSS 开发规范

### rpx 适配原则
- 布局尺寸全部使用 `rpx`（750rpx = 屏幕宽度）
- 字号使用 `rpx`，最小不低于 `20rpx`
- 间距使用 `8rpx` 倍数系统
- 图片容器固定宽高比用 `padding-top` 技巧

### 图片适配
```css
.image-16-9 {
  width: 100%;
  height: 0;
  padding-top: 56.25%;
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.image-16-9 image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

### 安全区域
```css
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-top {
  padding-top: env(safe-area-inset-top);
}
```

### 常用动画

```css
/* 卡片入场动画 */
@keyframes cardSlideUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-animate {
  animation: cardSlideUp 0.4s ease-out forwards;
}

/* 列表交错入场 */
.list-item:nth-child(1) { animation-delay: 0s; }
.list-item:nth-child(2) { animation-delay: 0.06s; }
.list-item:nth-child(3) { animation-delay: 0.12s; }
.list-item:nth-child(4) { animation-delay: 0.18s; }
```

## TabBar 配置参考

```json
{
  "tabBar": {
    "color": "#B0B0B0",
    "selectedColor": "#FF8A80",
    "backgroundColor": "#FFFFFF",
    "borderStyle": "white",
    "list": [
      {
        "pagePath": "pages/home/index",
        "text": "首页",
        "iconPath": "assets/icons/home.png",
        "selectedIconPath": "assets/icons/home-active.png"
      },
      {
        "pagePath": "pages/knowledge/index",
        "text": "育儿百科",
        "iconPath": "assets/icons/book.png",
        "selectedIconPath": "assets/icons/book-active.png"
      },
      {
        "pagePath": "pages/baby/index",
        "text": "宝宝",
        "iconPath": "assets/icons/baby.png",
        "selectedIconPath": "assets/icons/baby-active.png"
      },
      {
        "pagePath": "pages/community/index",
        "text": "社区",
        "iconPath": "assets/icons/community.png",
        "selectedIconPath": "assets/icons/community-active.png"
      }
    ]
  }
}
```

## 性能优化要点

- 长列表使用虚拟列表或分页加载 `onReachBottom`
- 图片使用 `lazy-load` 属性 + CDN 裁剪
- 避免在 `setData` 中传递大对象，使用数据路径局部更新
- `scroll-view` 内避免嵌套过多节点
- 自定义组件使用 `Component` 构造器，启用 `pureDataPattern`

## 其他参考

- 详细的组件模板代码见 [components.md](components.md)
- 图标资源规范和插画风格见 [assets-guide.md](assets-guide.md)
