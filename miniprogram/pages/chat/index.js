// pages/chat/index.js
const app = getApp()

const BASE_URL = 'http://localhost:3000/api'

Page({
  data: {
    messages: [],
    inputText: '',
    isLoading: false,
    streamContent: '',
    scrollToMsg: '',
    conversationId: null,
    quickQuestions: [
      '宝宝3个月了，需要添加辅食吗？',
      '宝宝晚上频繁夜醒怎么办？',
      '宝宝什么时候开始长牙？',
      '如何判断宝宝是否吃饱了？'
    ]
  },

  onLoad(options) {
    // 如果从对话历史进入，加载历史消息
    if (options.conversationId) {
      this.setData({ conversationId: parseInt(options.conversationId) })
      this.loadConversation(options.conversationId)
    }
  },

  onShow() {
    // 检查是否有从历史页面跳转过来的对话 ID
    const pendingId = app.globalData.pendingConversationId
    if (pendingId) {
      app.globalData.pendingConversationId = null
      this.setData({
        conversationId: pendingId,
        messages: []
      })
      this.loadConversation(pendingId)
    }
  },

  // 加载历史对话
  async loadConversation(id) {
    try {
      const token = app.globalData.token || wx.getStorageSync('token')
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${BASE_URL}/chat/conversations/${id}`,
          header: { 'Authorization': `Bearer ${token}` },
          success: (r) => resolve(r.data),
          fail: reject
        })
      })
      if (res.code === 0) {
        this.setData({ messages: res.data.messages })
        this.scrollToBottom()
      }
    } catch (err) {
      console.error('加载对话失败:', err)
    }
  },

  // 快捷提问
  askQuickQuestion(e) {
    const question = e.currentTarget.dataset.q
    this.setData({ inputText: question })
    this.sendMessage()
  },

  // 输入事件
  onInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  // 发送消息
  async sendMessage() {
    const text = this.data.inputText.trim()
    if (!text || this.data.isLoading) return

    // 添加用户消息
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text
    }

    const messages = [...this.data.messages, userMsg]
    this.setData({
      messages,
      inputText: '',
      isLoading: true,
      streamContent: ''
    })
    this.scrollToBottom()

    try {
      const token = app.globalData.token || wx.getStorageSync('token')

      // 使用非流式模式（更稳定）
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${BASE_URL}/chat/send`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          data: {
            message: text,
            conversationId: this.data.conversationId,
            stream: false
          },
          success: (r) => resolve(r.data),
          fail: reject
        })
      })

      if (res.code === 0) {
        // 添加 AI 回复
        const aiMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: res.data.reply
        }

        this.setData({
          messages: [...this.data.messages, aiMsg],
          conversationId: res.data.conversationId,
          isLoading: false
        })
      } else if (res.code === -1) {
        // AI 未配置
        const aiMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ AI 服务暂未配置。请在服务端 .env 文件中设置 DEEPSEEK_API_KEY 后重启服务。'
        }
        this.setData({
          messages: [...this.data.messages, aiMsg],
          isLoading: false
        })
      } else {
        throw new Error(res.message)
      }
    } catch (err) {
      console.error('发送消息失败:', err)
      const errMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: '抱歉，网络出现了问题，请稍后再试。'
      }
      this.setData({
        messages: [...this.data.messages, errMsg],
        isLoading: false
      })
    }

    this.scrollToBottom()
  },

  // 滚动到底部
  scrollToBottom() {
    const len = this.data.messages.length
    setTimeout(() => {
      this.setData({ scrollToMsg: `msg-${len - 1}` })
    }, 100)
  }
})
