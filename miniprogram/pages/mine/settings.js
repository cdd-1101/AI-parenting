// pages/mine/settings.js
const app = getApp()

Page({
  data: {
    cacheSize: '计算中...',
    notification: true
  },

  onLoad() {
    this.calculateCache()
    const notification = wx.getStorageSync('notification')
    this.setData({ notification: notification !== false })
  },

  // 计算缓存大小
  calculateCache() {
    try {
      const info = wx.getStorageInfoSync()
      const size = (info.currentSize / 1024).toFixed(1)
      this.setData({ cacheSize: `${size} KB` })
    } catch (e) {
      this.setData({ cacheSize: '0 KB' })
    }
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '将清除本地缓存数据（不影响服务器数据），确定清除吗？',
      success: (res) => {
        if (res.confirm) {
          // 保留 token 和 babyInfo
          const token = wx.getStorageSync('token')
          const babyInfo = wx.getStorageSync('babyInfo')
          const userInfo = wx.getStorageSync('userInfo')

          wx.clearStorageSync()

          // 恢复关键数据
          if (token) wx.setStorageSync('token', token)
          if (babyInfo) wx.setStorageSync('babyInfo', babyInfo)
          if (userInfo) wx.setStorageSync('userInfo', userInfo)

          this.calculateCache()
          wx.showToast({ title: '缓存已清除', icon: 'success' })
        }
      }
    })
  },

  // 切换通知
  toggleNotification(e) {
    const val = e.detail ? e.detail.value : !this.data.notification
    this.setData({ notification: val })
    wx.setStorageSync('notification', val)
  },

  // 隐私政策
  showPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '安心育儿尊重并保护您的个人隐私。我们仅收集提供育儿服务所必需的信息（宝宝基本资料、成长记录等），不会将您的数据出售或分享给第三方。\n\n您可以随时删除自己的数据。',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  // 免责声明
  showDisclaimer() {
    wx.showModal({
      title: '免责声明',
      content: '本应用提供的所有育儿知识和AI建议仅供参考，不构成医疗诊断或治疗方案。\n\n如果宝宝出现任何健康问题，请及时咨询专业医生。\n\n使用本应用即表示您理解并接受以上声明。',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  // 检查更新
  checkUpdate() {
    wx.showToast({ title: '当前已是最新版本', icon: 'none' })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '退出后需要重新登录，确定退出吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          app.globalData.token = ''
          app.globalData.userInfo = null
          app.globalData.babyInfo = null
          app.globalData.pendingConversationId = null

          wx.showToast({ title: '已退出', icon: 'success', duration: 1000 })
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/home/index' })
          }, 1000)
        }
      }
    })
  }
})
