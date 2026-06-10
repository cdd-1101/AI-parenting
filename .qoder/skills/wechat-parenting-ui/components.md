# 育儿小程序通用组件库

## 宝宝信息卡片

```html
<view class="baby-info-card">
  <view class="baby-header">
    <image class="baby-avatar" src="{{baby.avatar}}" mode="aspectFill" />
    <view class="baby-detail">
      <text class="baby-name">{{baby.name}}</text>
      <text class="baby-age">{{baby.ageText}}</text>
    </view>
    <view class="baby-stats">
      <view class="stat-item">
        <text class="stat-value">{{baby.height}}</text>
        <text class="stat-label">身高cm</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{baby.weight}}</text>
        <text class="stat-label">体重kg</text>
      </view>
    </view>
  </view>
</view>
```

```css
.baby-info-card {
  background: linear-gradient(135deg, #FF8A80, #FFBCB5);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin: var(--space-md) var(--space-lg);
  color: #FFFFFF;
}

.baby-header {
  display: flex;
  align-items: center;
}

.baby-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: var(--radius-full);
  border: 4rpx solid rgba(255, 255, 255, 0.6);
  margin-right: var(--space-md);
}

.baby-name {
  font-size: 36rpx;
  font-weight: 700;
}

.baby-age {
  font-size: 24rpx;
  opacity: 0.85;
}

.baby-stats {
  margin-left: auto;
  display: flex;
  gap: var(--space-lg);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  display: block;
}

.stat-label {
  font-size: 20rpx;
  opacity: 0.8;
}
```

## 功能宫格组件

```html
<view class="grid-menu">
  <view class="grid-item" wx:for="{{menus}}" wx:key="id"
    bindtap="onMenuTap" data-path="{{item.path}}">
    <view class="grid-icon-wrap" style="background: {{item.bgColor}}">
      <text class="grid-emoji">{{item.icon}}</text>
    </view>
    <text class="grid-label">{{item.label}}</text>
  </view>
</view>
```

```css
.grid-menu {
  display: flex;
  flex-wrap: wrap;
  padding: var(--space-md) var(--space-lg);
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  margin: var(--space-sm) var(--space-lg);
}

.grid-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-md) 0;
}

.grid-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-xs);
}

.grid-emoji {
  font-size: 40rpx;
}

.grid-label {
  font-size: 24rpx;
  color: var(--color-text-primary);
}
```

## 快捷记录浮动按钮

```html
<view class="fab-btn" bindtap="onFabTap">
  <text class="fab-icon">+</text>
</view>
```

```css
.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: 180rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #FF8A80, #E56B62);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 138, 128, 0.4);
  z-index: 100;
}

.fab-icon {
  font-size: 48rpx;
  color: #FFFFFF;
  font-weight: 300;
}
```

## 空状态组件

```html
<view class="empty-state" wx:if="{{isEmpty}}">
  <text class="empty-emoji">🍼</text>
  <text class="empty-title">{{title || '暂无记录'}}</text>
  <text class="empty-desc">{{desc || '快来记录宝宝的成长点滴吧~'}}</text>
  <view class="empty-btn" bindtap="onAddTap">
    <text>立即添加</text>
  </view>
</view>
```

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx var(--space-xl);
}

.empty-emoji {
  font-size: 96rpx;
  margin-bottom: var(--space-lg);
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
}

.empty-desc {
  font-size: 26rpx;
  color: var(--color-text-hint);
  margin-bottom: var(--space-xl);
}

.empty-btn {
  padding: 20rpx 64rpx;
  background: var(--color-primary);
  color: #FFFFFF;
  border-radius: var(--radius-full);
  font-size: 28rpx;
  font-weight: 500;
}
```

## 加载状态 - 骨架屏

```css
.skeleton {
  background: linear-gradient(90deg, #F5F0EB 25%, #EDE5DD 50%, #F5F0EB 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-card {
  height: 240rpx;
  margin: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-lg);
}

.skeleton-title {
  height: 36rpx;
  width: 60%;
  margin-bottom: var(--space-sm);
}

.skeleton-text {
  height: 28rpx;
  width: 100%;
  margin-bottom: var(--space-xs);
}
```

## 帖子图片九宫格

```html
<view class="image-grid image-grid-{{images.length > 9 ? 9 : images.length}}">
  <image wx:for="{{images}}" wx:key="index"
    class="grid-image" src="{{item}}" mode="aspectFill"
    bindtap="previewImage" data-urls="{{images}}" data-current="{{item}}" />
</view>
```

```css
.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin: var(--space-sm) 0;
}

.image-grid-1 .grid-image {
  width: 400rpx;
  height: 400rpx;
}

.image-grid-2 .grid-image,
.image-grid-4 .grid-image {
  width: calc(50% - 4rpx);
  height: 280rpx;
}

.image-grid-3 .grid-image,
.image-grid-5 .grid-image,
.image-grid-6 .grid-image,
.image-grid-7 .grid-image,
.image-grid-8 .grid-image,
.image-grid-9 .grid-image {
  width: calc(33.33% - 6rpx);
  height: 220rpx;
}

.grid-image {
  border-radius: var(--radius-sm);
}
```

## 底部操作栏

```html
<view class="bottom-bar safe-bottom">
  <view class="bar-item {{activeTab === 'home' ? 'active' : ''}}"
    bindtap="switchTab" data-tab="home">
    <text class="bar-icon">🏠</text>
    <text class="bar-text">首页</text>
  </view>
  <view class="bar-item {{activeTab === 'knowledge' ? 'active' : ''}}"
    bindtap="switchTab" data-tab="knowledge">
    <text class="bar-icon">📖</text>
    <text class="bar-text">百科</text>
  </view>
  <view class="bar-item bar-center" bindtap="onAddRecord">
    <view class="bar-add-btn">+</view>
  </view>
  <view class="bar-item {{activeTab === 'baby' ? 'active' : ''}}"
    bindtap="switchTab" data-tab="baby">
    <text class="bar-icon">👶</text>
    <text class="bar-text">宝宝</text>
  </view>
  <view class="bar-item {{activeTab === 'me' ? 'active' : ''}}"
    bindtap="switchTab" data-tab="me">
    <text class="bar-icon">👤</text>
    <text class="bar-text">我的</text>
  </view>
</view>
```

```css
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110rpx;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.04);
  z-index: 99;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.bar-icon {
  font-size: 40rpx;
  margin-bottom: 4rpx;
}

.bar-text {
  font-size: 20rpx;
  color: var(--color-text-hint);
}

.bar-item.active .bar-text {
  color: var(--color-primary);
  font-weight: 500;
}

.bar-center {
  position: relative;
  top: -20rpx;
}

.bar-add-btn {
  width: 88rpx;
  height: 88rpx;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #FF8A80, #E56B62);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-size: 48rpx;
  font-weight: 300;
  box-shadow: 0 6rpx 20rpx rgba(255, 138, 128, 0.35);
}
```

## 提示 Toast

```html
<view class="toast-mask" wx:if="{{showToast}}">
  <view class="toast-box">
    <text class="toast-icon">{{toastIcon}}</text>
    <text class="toast-text">{{toastText}}</text>
  </view>
</view>
```

```css
.toast-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  pointer-events: none;
}

.toast-box {
  background: rgba(62, 62, 62, 0.88);
  border-radius: var(--radius-md);
  padding: var(--space-lg) var(--space-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.toast-icon {
  font-size: 56rpx;
  margin-bottom: var(--space-sm);
}

.toast-text {
  color: #FFFFFF;
  font-size: 28rpx;
}
```
