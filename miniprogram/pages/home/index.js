// pages/home/index.js
const app = getApp()
const http = require('../../utils/request')
const { calculateAge } = require('../../utils/ageCalculator')

Page({
  data: {
    babyInfo: null,
    ageInfo: null,
    latestGrowth: null,
    monthTips: [],
    recommendations: [],
    menuItems: [
      { id: 1, icon: '🌱', label: '成长记录', path: '/pages/baby/add-record?type=growth', bgColor: '#FFF3E0' },
      { id: 2, icon: '🍼', label: '喂养记录', path: '/pages/baby/add-record?type=feeding', bgColor: '#E8F5E9' },
      { id: 3, icon: '🌙', label: '睡眠记录', path: '/pages/baby/add-record?type=sleep', bgColor: '#E3F2FD' },
      { id: 4, icon: '🛡️', label: '疫苗接种', path: '/pages/baby/add-record?type=health', bgColor: '#FCE4EC' },
      { id: 5, icon: '🦋', label: '里程碑', path: '/pages/baby/add-record?type=milestone', bgColor: '#FFF8E1' },
      { id: 6, icon: '📷', label: '照片记录', path: '/pages/baby/add-record?type=photo', bgColor: '#F3E5F5' },
      { id: 7, icon: '📋', label: '成长报告', path: '/pages/baby/monthly-report', bgColor: '#E3F2FD' },
      { id: 8, icon: '🧸', label: '个人中心', path: '/pages/mine/index', bgColor: '#FFF3E0' }
    ]
  },

  onLoad() {
    this.initPage()
  },

  /**
   * 等待登录完成后初始化页面
   */
  async initPage() {
    // 等待 App 登录完成
    if (app.globalData.loginReady) {
      await app.globalData.loginReady
    }
    this.loadDashboard()
  },

  onShow() {
    // 每次显示时刷新宝宝信息
    const babyInfo = wx.getStorageSync('babyInfo')
    if (babyInfo) {
      this.setData({ babyInfo })
      this.calculateBabyAge()
    }
  },

  onPullDownRefresh() {
    this.loadDashboard().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 加载首页聚合数据
   */
  async loadDashboard() {
    try {
      const res = await http.get('/home/dashboard')
      if (res.code === 0) {
        const { baby, latestGrowth, monthTips, recommendations } = res.data
        this.setData({
          babyInfo: baby || this.data.babyInfo,
          latestGrowth,
          monthTips: monthTips || [],
          recommendations: recommendations || []
        })
        if (baby) {
          wx.setStorageSync('babyInfo', baby)
          this.calculateBabyAge()
        }
      }
    } catch (err) {
      console.error('加载首页数据失败:', err)
      // 降级：使用本地缓存数据
      const babyInfo = wx.getStorageSync('babyInfo')
      if (babyInfo) {
        this.setData({ babyInfo })
        this.calculateBabyAge()
      }
    }
  },

  /**
   * 计算宝宝年龄
   */
  calculateBabyAge() {
    const { babyInfo } = this.data
    if (babyInfo && babyInfo.birthday) {
      const ageInfo = calculateAge(babyInfo.birthday)
      this.setData({ ageInfo })
    }
  },

  /**
   * 宫格菜单点击
   */
  onMenuTap(e) {
    const { path } = e.currentTarget.dataset
    // tabBar 页面必须用 switchTab，其他页面用 navigateTo
    const tabBarPages = ['/pages/home/index', '/pages/knowledge/timeline', '/pages/baby/growth-record', '/pages/chat/index']
    if (tabBarPages.includes(path)) {
      wx.switchTab({ url: path })
    } else {
      wx.navigateTo({ url: path })
    }
  },

  /**
   * 跳转 AI 助手
   */
  goToChat() {
    wx.switchTab({ url: '/pages/chat/index' })
  },

  /**
   * 跳转引导页
   */
  goToOnboarding() {
    wx.navigateTo({ url: '/pages/onboarding/index' })
  },

  /**
   * 推荐内容点击
   */
  onRecommendTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/knowledge/month-detail?month=${id}` })
  }
})
