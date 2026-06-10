# 图标与视觉资源规范

## 图标风格

采用 **描线 + 局部填充** 风格，线宽 2px，颜色跟随主题色。

### TabBar 图标建议
- 首页：小房子 🏠
- 育儿百科：翻开的书 📖
- 宝宝：婴儿笑脸 👶
- 社区：两个小人 👥

### 功能图标 Emoji 参考

| 功能 | Emoji | 背景色 |
|------|-------|--------|
| 成长记录 | 📏 | #FFF3E0 |
| 喂养提醒 | 🍼 | #E8F5E9 |
| 睡眠追踪 | 😴 | #E3F2FD |
| 疫苗接种 | 💉 | #FCE4EC |
| 早教游戏 | 🎮 | #F3E5F5 |
| 亲子阅读 | 📚 | #FFF8E1 |
| 辅食记录 | 🥣 | #E8F5E9 |
| 体检提醒 | 🏥 | #FFEBEE |
| 尿布记录 | 🧷 | #FFF3E0 |
| 体温记录 | 🌡️ | #FFEBEE |
| 身高体重 | ⚖️ | #E3F2FD |
| 里程碑 | 🌟 | #FFF8E1 |

## 插画风格

- 线条柔和、色彩温暖
- 人物简笔画风格（圆脑袋、小身体）
- 主色调与品牌色一致
- 空状态插画尺寸：400×300px
- 引导页插画尺寸：750×600px

## 图片规范

| 场景 | 比例 | 尺寸(rpx) | 圆角 |
|------|------|-----------|------|
| 文章封面 | 16:9 | 686×386 | 20rpx |
| 文章内图 | 16:9 或 4:3 | 自适应 | 12rpx |
| 社区帖子 | 1:1 或 4:3 | 九宫格 | 12rpx |
| 头像 | 1:1 | 96×96 | 999rpx |
| 宝宝封面 | 3:1 | 686×228 | 32rpx |
| 功能图标 | 1:1 | 88×88 | 20rpx |

## 音频/动画素材

- 按钮点击音效：柔和的 "叮" 声
- 记录成功动画：星星散落 ✨
- 里程碑达成：彩色纸屑 🎉

## 渐变背景参考

```css
/* 主渐变 - 珊瑚粉（默认） */
.gradient-primary {
  background: linear-gradient(135deg, #FF8A80, #FFBCB5);
}

/* 暖黄渐变 - 用于提醒卡片 */
.gradient-warm {
  background: linear-gradient(135deg, #FFD54F, #FFE082);
}

/* 薄荷渐变 - 用于健康数据 */
.gradient-mint {
  background: linear-gradient(135deg, #81C784, #B2DFDB);
}

/* 蓝紫渐变 - 用于睡眠模块 */
.gradient-sleep {
  background: linear-gradient(135deg, #7BA7CC, #B39DDB);
}

/* 柔和橙渐变 - 用于喂养模块 */
.gradient-feeding {
  background: linear-gradient(135deg, #FFB74D, #FFCC80);
}
```

## 阴影规范

```css
/* 轻阴影 - 用于卡片 */
.shadow-sm {
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

/* 中阴影 - 用于浮动元素 */
.shadow-md {
  box-shadow: 0 4rpx 20rpx rgba(255, 138, 128, 0.08);
}

/* 重阴影 - 用于弹窗、操作表 */
.shadow-lg {
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}
```
