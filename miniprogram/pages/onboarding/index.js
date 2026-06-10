// pages/onboarding/index.js
const http = require('../../utils/request')
const { formatDate } = require('../../utils/ageCalculator')

const app = getApp()

Page({
  data: {
    currentStep: 1,
    totalSteps: 6,
    today: '', // 日期选择器的最大日期
    formData: {
      nickname: '',
      gender: '',
      birthday: '',
      feedingType: ''
    },
    feedingTypeText: '',
    submitting: false
  },

  feedingTypeMap: {
    breast: '母乳喂养 🤱',
    formula: '配方奶喂养 🍼',
    mixed: '混合喂养 🥛'
  },

  onLoad() {
    this.setData({ today: formatDate(new Date()) })
  },

  // ============ 表单事件 ============

  onNicknameInput(e) {
    this.setData({ 'formData.nickname': e.detail.value })
  },

  selectGender(e) {
    const gender = e.currentTarget.dataset.gender
    this.setData({ 'formData.gender': gender })
  },

  onBirthdayChange(e) {
    this.setData({ 'formData.birthday': e.detail.value })
  },

  selectFeeding(e) {
    const feedingType = e.currentTarget.dataset.type
    this.setData({
      'formData.feedingType': feedingType,
      feedingTypeText: this.feedingTypeMap[feedingType]
    })
  },

  // ============ 导航逻辑 ============

  /**
   * 校验当前步骤是否满足前进条件
   */
  validateStep() {
    const { currentStep, formData } = this.data

    switch (currentStep) {
      case 2:
        if (!formData.nickname.trim()) {
          wx.showToast({ title: '请输入宝宝昵称', icon: 'none' })
          return false
        }
        break
      case 3:
        if (!formData.gender) {
          wx.showToast({ title: '请选择宝宝性别', icon: 'none' })
          return false
        }
        break
      case 4:
        if (!formData.birthday) {
          wx.showToast({ title: '请选择出生日期', icon: 'none' })
          return false
        }
        break
      // Step 5 喂养方式可以跳过，不做校验
    }
    return true
  },

  goNext() {
    if (!this.validateStep()) return

    const { currentStep, totalSteps } = this.data
    if (currentStep < totalSteps) {
      this.setData({ currentStep: currentStep + 1 })
    }
  },

  goBack() {
    const { currentStep } = this.data
    if (currentStep > 1) {
      this.setData({ currentStep: currentStep - 1 })
    }
  },

  skipStep() {
    this.goNext()
  },

  // ============ 提交 & 进入首页 ============

  async goToHome() {
    if (this.data.submitting) return
    this.setData({ submitting: true })

    const { formData } = this.data

    try {
      // 调用后端创建宝宝档案
      const res = await http.post('/babies', {
        nickname: formData.nickname,
        gender: formData.gender,
        birthday: formData.birthday,
        feedingType: formData.feedingType || 'breast'
      })

      if (res.code === 0) {
        const baby = res.data

        // 保存到全局和本地
        app.globalData.babyInfo = baby
        wx.setStorageSync('babyInfo', baby)

        wx.showToast({ title: '创建成功！', icon: 'success', duration: 1000 })

        // 延迟跳转首页（让 Toast 显示）
        setTimeout(() => {
          wx.switchTab({ url: '/pages/home/index' })
        }, 1000)
      }
    } catch (err) {
      console.error('创建宝宝档案失败:', err)
      wx.showToast({ title: '创建失败，请重试', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
