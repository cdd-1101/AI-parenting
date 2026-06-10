// pages/chat/history.js
const http = require('../../utils/request')
const { friendlyDate } = require('../../utils/ageCalculator')

Page({
  data: {
    conversations: [],
    loading: true
  },

  onShow() {
    this.loadConversations()
  },

  async loadConversations() {
    this.setData({ loading: true })
    try {
      const res = await http.get('/chat/conversations')
      if (res.code === 0) {
        const conversations = res.data.map(c => ({
          ...c,
          timeText: friendlyDate(c.updatedAt || c.createdAt)
        }))
        this.setData({ conversations })
      }
    } catch (err) {
      console.error('加载对话列表失败:', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 打开对话
  openConversation(e) {
    const id = e.currentTarget.dataset.id
    wx.switchTab({ url: '/pages/chat/index' })
    // 由于 switchTab 不支持传参，使用全局变量
    getApp().globalData.pendingConversationId = id
  },

  // 删除对话
  deleteConversation(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定删除这条对话吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await http.delete(`/chat/conversations/${id}`)
            this.setData({
              conversations: this.data.conversations.filter(c => c.id !== id)
            })
            wx.showToast({ title: '已删除', icon: 'success' })
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 跳转聊天页
  goChat() {
    wx.switchTab({ url: '/pages/chat/index' })
  }
})
