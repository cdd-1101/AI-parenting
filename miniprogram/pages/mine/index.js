// pages/mine/index.js
const http = require('../../utils/request')
const { calculateAge } = require('../../utils/ageCalculator')

const app = getApp()

const feedingTypeMap = {
  breast: '母乳',
  formula: '配方奶',
  mixed: '混合'
}

const roleMap = {
  mother: '妈妈',
  father: '爸爸',
  grandparent: '祖父母',
  other: '其他'
}

Page({
  data: {
    userInfo: {},
    babyInfo: null,
    latestGrowth: null,
    ageText: '',
    feedingTypeText: '',
    roleText: ''
  },

  onShow() {
    this.loadUserInfo()
    this.loadBabyInfo()
  },

  // ============ 数据加载 ============

  loadUserInfo() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo') || {}
    this.setData({
      userInfo,
      roleText: roleMap[userInfo.role] || '用户'
    })
  },

  async loadBabyInfo() {
    let babyInfo = app.globalData.babyInfo || wx.getStorageSync('babyInfo')

    if (!babyInfo) return

    // 计算年龄文本
    if (babyInfo.birthday) {
      const age = calculateAge(babyInfo.birthday)
      this.setData({ ageText: age.ageText })
    }

    this.setData({
      babyInfo,
      feedingTypeText: feedingTypeMap[babyInfo.feedingType] || ''
    })

    // 获取最新的成长记录
    try {
      const res = await http.get(`/babies/${babyInfo.id}/records`, {
        type: 'growth', page: 1, pageSize: 1
      })
      if (res.code === 0 && res.data.records && res.data.records.length > 0) {
        this.setData({ latestGrowth: res.data.records[0].data })
      }
    } catch (err) {
      console.log('获取成长记录失败:', err)
    }
  },

  // ============ 页面导航 ============

  goBabyProfile() {
    wx.navigateTo({ url: '/pages/baby/profile' })
  },

  goGrowthRecord() {
    wx.switchTab({ url: '/pages/baby/growth-record' })
  },

  goMonthlyReport() {
    wx.navigateTo({ url: '/pages/baby/monthly-report' })
  },

  goFavorites() {
    wx.navigateTo({ url: '/pages/mine/favorites' })
  },

  goChatHistory() {
    wx.navigateTo({ url: '/pages/chat/history' })
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/mine/settings' })
  },

  editBaby() {
    wx.navigateTo({ url: '/pages/baby/profile?edit=1' })
  },

  goOnboarding() {
    wx.navigateTo({ url: '/pages/onboarding/index' })
  },

  showAbout() {
    wx.showModal({
      title: '关于安心育儿',
      content: '安心育儿是一款帮助新手爸妈科学育儿的微信小程序。\n\n版本：1.0.0\n\n本应用提供的内容仅供参考，不替代专业医疗建议。',
      showCancel: false,
      confirmText: '知道了'
    })
  }
})
