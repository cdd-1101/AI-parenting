// pages/baby/monthly-report.js
const http = require('../../utils/request')
const { friendlyDate } = require('../../utils/ageCalculator')

const app = getApp()

Page({
  data: {
    reportYear: 0,
    reportMonth: 0,
    baby: null,
    loading: true,
    totalRecords: 0,
    growthStats: { count: 0, latestHeight: null, latestWeight: null, heightDiff: null, weightDiff: null },
    feedingStats: { count: 0, avgAmount: null },
    sleepStats: { count: 0, avgDuration: null },
    milestones: [],
    aiReview: ''
  },

  onLoad() {
    const now = new Date()
    this.setData({
      reportYear: now.getFullYear(),
      reportMonth: now.getMonth() + 1,
      baby: app.globalData.babyInfo || wx.getStorageSync('babyInfo')
    })
    this.loadReport()
  },

  prevMonth() {
    let { reportYear, reportMonth } = this.data
    reportMonth--
    if (reportMonth < 1) { reportMonth = 12; reportYear-- }
    this.setData({ reportYear, reportMonth, aiReview: '' })
    this.loadReport()
  },

  nextMonth() {
    let { reportYear, reportMonth } = this.data
    const now = new Date()
    if (reportYear >= now.getFullYear() && reportMonth >= now.getMonth() + 1) return
    reportMonth++
    if (reportMonth > 12) { reportMonth = 1; reportYear++ }
    this.setData({ reportYear, reportMonth, aiReview: '' })
    this.loadReport()
  },

  async loadReport() {
    const baby = this.data.baby
    if (!baby) return

    this.setData({ loading: true })

    try {
      // 加载该月的所有记录（分页拉取）
      let allRecords = []
      let page = 1
      let hasMore = true

      while (hasMore) {
        const res = await http.get(`/babies/${baby.id}/records`, {
          page, pageSize: 50
        })
        if (res.code === 0) {
          const records = res.data.records
          // 筛选当月记录
          const monthRecords = records.filter(r => {
            const d = new Date(r.recordDate)
            return d.getFullYear() === this.data.reportYear &&
                   d.getMonth() + 1 === this.data.reportMonth
          })
          allRecords = [...allRecords, ...monthRecords]
          hasMore = records.length === 50 && page < 5
          page++
        } else {
          break
        }
      }

      this.setData({ totalRecords: allRecords.length })

      if (allRecords.length > 0) {
        this.processRecords(allRecords)
      }
    } catch (err) {
      console.error('加载报告失败:', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  processRecords(records) {
    // 按类型分组
    const growthRecords = records.filter(r => r.type === 'growth')
    const feedingRecords = records.filter(r => r.type === 'feeding')
    const sleepRecords = records.filter(r => r.type === 'sleep')
    const milestoneRecords = records.filter(r => r.type === 'milestone')

    // 身高体重统计
    let growthStats = { count: growthRecords.length, latestHeight: null, latestWeight: null, heightDiff: null, weightDiff: null }
    if (growthRecords.length > 0) {
      // 按日期排序
      growthRecords.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate))
      const latest = growthRecords[0].data
      const earliest = growthRecords[growthRecords.length - 1].data
      growthStats.latestHeight = latest.height
      growthStats.latestWeight = latest.weight
      if (growthRecords.length > 1 && earliest.height && latest.height) {
        growthStats.heightDiff = (latest.height - earliest.height).toFixed(1)
      }
      if (growthRecords.length > 1 && earliest.weight && latest.weight) {
        growthStats.weightDiff = (latest.weight - earliest.weight).toFixed(1)
      }
    }

    // 喂养统计
    let feedingStats = { count: feedingRecords.length, avgAmount: null }
    if (feedingRecords.length > 0) {
      const amounts = feedingRecords.map(r => r.data.amount).filter(Boolean)
      if (amounts.length > 0) {
        feedingStats.avgAmount = Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length)
      }
    }

    // 睡眠统计
    let sleepStats = { count: sleepRecords.length, avgDuration: null }
    if (sleepRecords.length > 0) {
      const durations = sleepRecords.map(r => r.data.duration).filter(Boolean)
      if (durations.length > 0) {
        sleepStats.avgDuration = (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1)
      }
    }

    // 里程碑
    const milestones = milestoneRecords.map(m => ({
      ...m,
      recordDateStr: friendlyDate(m.recordDate)
    }))

    this.setData({ growthStats, feedingStats, sleepStats, milestones })
  },

  // AI 成长点评
  async getAIReview() {
    if (this.data.aiReview || this.data.totalRecords === 0) return

    const { growthStats, feedingStats, sleepStats, milestones, reportMonth } = this.data
    const baby = this.data.baby

    let summary = `宝宝${reportMonth}月龄月度数据：`
    if (growthStats.count > 0) {
      summary += `身高体重记录${growthStats.count}次，最新身高${growthStats.latestHeight}cm，体重${growthStats.latestWeight}kg`
      if (growthStats.heightDiff) summary += `，本月身高增长${growthStats.heightDiff}cm，体重增长${growthStats.weightDiff}kg`
    }
    if (feedingStats.count > 0) summary += `。喂养记录${feedingStats.count}次，平均奶量${feedingStats.avgAmount}ml`
    if (sleepStats.count > 0) summary += `。睡眠记录${sleepStats.count}次，平均时长${sleepStats.avgDuration}小时`
    if (milestones.length > 0) {
      summary += `。里程碑：${milestones.map(m => m.data.milestone).join('、')}`
    }
    summary += '。请给出简洁专业的月度成长点评和建议。'

    wx.showLoading({ title: 'AI 分析中...' })

    try {
      const token = app.globalData.token || wx.getStorageSync('token')
      const baseUrl = app.globalData.baseUrl || 'http://localhost:3000/api'

      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${baseUrl}/chat/send`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          data: { message: summary, stream: false },
          success: r => resolve(r.data),
          fail: reject
        })
      })

      wx.hideLoading()

      if (res.code === 0) {
        this.setData({ aiReview: res.data.reply })
      } else {
        this.setData({ aiReview: 'AI 服务暂时不可用，请稍后再试。' })
      }
    } catch (err) {
      wx.hideLoading()
      this.setData({ aiReview: '生成失败，请检查网络后重试。' })
    }
  }
})
