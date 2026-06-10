// pages/mine/favorites.js
const http = require('../../utils/request')
const { friendlyDate } = require('../../utils/ageCalculator')

Page({
  data: {
    favorites: [],
    filteredFavorites: [],
    activeTab: '',
    loading: true,
    typeLabel: {
      knowledge: '知识',
      conversation: '对话',
      article: '文章'
    }
  },

  onShow() {
    this.loadFavorites()
  },

  async loadFavorites() {
    this.setData({ loading: true })
    try {
      const res = await http.get('/favorites')
      if (res.code === 0) {
        const favorites = res.data.map(f => ({
          ...f,
          timeText: friendlyDate(f.createdAt)
        }))
        this.setData({ favorites })
        this.filterFavorites()
      }
    } catch (err) {
      // 收藏接口可能尚未实现，静默处理
      console.log('加载收藏失败:', err)
      this.setData({ favorites: [] })
      this.filterFavorites()
    } finally {
      this.setData({ loading: false })
    }
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
    this.filterFavorites()
  },

  filterFavorites() {
    const { favorites, activeTab } = this.data
    if (!activeTab) {
      this.setData({ filteredFavorites: favorites })
    } else {
      this.setData({
        filteredFavorites: favorites.filter(f => f.targetType === activeTab)
      })
    }
  },

  openFavorite(e) {
    const item = e.currentTarget.dataset.item
    if (item.targetType === 'knowledge') {
      wx.navigateTo({
        url: `/pages/knowledge/month-detail?month=${item.targetId}`
      })
    } else if (item.targetType === 'conversation') {
      getApp().globalData.pendingConversationId = item.targetId
      wx.switchTab({ url: '/pages/chat/index' })
    }
  },

  removeFavorite(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '取消收藏',
      content: '确定取消收藏吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await http.delete(`/favorites/${id}`)
            const favorites = this.data.favorites.filter(f => f.id !== id)
            this.setData({ favorites })
            this.filterFavorites()
            wx.showToast({ title: '已取消', icon: 'success' })
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      }
    })
  }
})
