// pages/knowledge/month-detail.js
const http = require('../../utils/request')

Page({
  data: {
    month: 0,
    monthTitle: '',
    sections: [],
    filteredSections: [],
    activeTab: '', // '' = 全部, 具体 section 值 = 单板块
    loading: true
  },

  onLoad(options) {
    const month = parseInt(options.month) || 0
    const section = options.section || ''

    this.setData({ month, activeTab: section })
    wx.setNavigationBarTitle({ title: `${month}月龄知识` })
    this.loadMonthData(month)
  },

  async loadMonthData(month) {
    this.setData({ loading: true })
    try {
      const res = await http.get(`/knowledge/${month}`)
      if (res.code === 0) {
        this.setData({
          monthTitle: res.data.title,
          sections: res.data.sections
        })
        this.filterSections()
      } else {
        wx.showToast({ title: res.message || '加载失败', icon: 'none' })
      }
    } catch (err) {
      console.error('加载月龄知识失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 根据 activeTab 过滤显示
  filterSections() {
    const { sections, activeTab } = this.data
    if (activeTab) {
      this.setData({
        filteredSections: sections.filter(s => s.section === activeTab)
      })
    }
  },

  // 切换标签
  onTabTap(e) {
    const section = e.currentTarget.dataset.section
    this.setData({ activeTab: section })
    this.filterSections()
  }
})
