// pages/baby/add-record.js
const http = require('../../utils/request')
const { formatDate } = require('../../utils/ageCalculator')

const app = getApp()

const typeOptions = [
  { type: 'growth', icon: '📏', label: '身高体重' },
  { type: 'feeding', icon: '🍼', label: '喂养' },
  { type: 'sleep', icon: '😴', label: '睡眠' },
  { type: 'milestone', icon: '🌟', label: '里程碑' },
  { type: 'health', icon: '💉', label: '健康' },
  { type: 'photo', icon: '📸', label: '照片' }
]

Page({
  data: {
    recordType: 'growth',
    typeOptions,
    recordDate: '',
    today: '',
    formData: {},
    note: '',
    submitting: false
  },

  onLoad(options) {
    const today = formatDate(new Date())
    this.setData({
      today,
      recordDate: today,
      recordType: options.type || 'growth'
    })
  },

  // ============ 表单事件 ============

  selectType(e) {
    this.setData({
      recordType: e.currentTarget.dataset.type,
      formData: {} // 切换类型时清空表单
    })
  },

  onDateChange(e) {
    this.setData({ recordDate: e.detail.value })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`formData.${field}`]: e.detail.value })
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value })
  },

  selectFeedType(e) {
    this.setData({ 'formData.feedType': e.currentTarget.dataset.type })
  },

  selectQuality(e) {
    this.setData({ 'formData.quality': e.currentTarget.dataset.q })
  },

  // ============ 提交 ============

  async submitRecord() {
    const { recordType, recordDate, formData, note } = this.data
    const baby = app.globalData.babyInfo || wx.getStorageSync('babyInfo')

    if (!baby) {
      wx.showToast({ title: '请先添加宝宝信息', icon: 'none' })
      return
    }

    // 校验
    if (!recordDate) {
      wx.showToast({ title: '请选择日期', icon: 'none' })
      return
    }

    // 构建 data 对象
    let data = {}
    switch (recordType) {
      case 'growth':
        if (!formData.height && !formData.weight) {
          wx.showToast({ title: '请至少填写身高或体重', icon: 'none' })
          return
        }
        data = {
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          head: formData.head ? parseFloat(formData.head) : null
        }
        break
      case 'feeding':
        data = {
          feedType: formData.feedType || '',
          amount: formData.amount ? parseInt(formData.amount) : null
        }
        break
      case 'sleep':
        data = {
          duration: formData.duration ? parseFloat(formData.duration) : null,
          quality: formData.quality || ''
        }
        break
      case 'milestone':
        if (!formData.milestone) {
          wx.showToast({ title: '请填写里程碑内容', icon: 'none' })
          return
        }
        data = { milestone: formData.milestone }
        break
      default:
        data = { description: formData.description || '' }
    }

    if (this.data.submitting) return
    this.setData({ submitting: true })

    try {
      const res = await http.post(`/babies/${baby.id}/records`, {
        type: recordType,
        recordDate,
        data,
        note: note || null
      })

      if (res.code === 0) {
        wx.showToast({ title: '保存成功', icon: 'success', duration: 1000 })
        setTimeout(() => {
          wx.navigateBack()
        }, 1000)
      }
    } catch (err) {
      console.error('保存记录失败:', err)
      wx.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
