// pages/knowledge/timeline.js
const http = require('../../utils/request')
const { calculateAge } = require('../../utils/ageCalculator')

const app = getApp()

Page({
  data: {
    timeline: [],
    currentMonth: null,
    currentMonthText: '',
    scrollToMonth: 0,
    loading: true
  },

  onShow() {
    this.loadCurrentBaby()
    this.loadTimeline()
  },

  // 加载当前宝宝月龄
  loadCurrentBaby() {
    const babyInfo = app.globalData.babyInfo || wx.getStorageSync('babyInfo')
    if (babyInfo && babyInfo.birthday) {
      const age = calculateAge(babyInfo.birthday)
      this.setData({
        currentMonth: Math.min(age.months, 12),
        currentMonthText: age.ageText,
        scrollToMonth: Math.min(age.months, 12)
      })
    }
  },

  // 加载时间线数据
  async loadTimeline() {
    this.setData({ loading: true })
    try {
      const res = await http.get('/knowledge/timeline')
      if (res.code === 0) {
        this.setData({ timeline: res.data })
      }
    } catch (err) {
      console.error('加载时间线失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 跳转到月龄详情
  goMonthDetail(e) {
    const month = e.currentTarget.dataset.month
    wx.navigateTo({
      url: `/pages/knowledge/month-detail?month=${month}`
    })
  },

  // 跳转到具体板块
  goSectionDetail(e) {
    const { month, section } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/knowledge/month-detail?month=${month}&section=${section}`
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadTimeline().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
