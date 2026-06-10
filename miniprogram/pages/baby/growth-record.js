// pages/baby/growth-record.js
const http = require('../../utils/request')
const { formatDate, friendlyDate } = require('../../utils/ageCalculator')

const app = getApp()

const typeOptions = [
  { type: 'growth', icon: '📏', label: '身高体重' },
  { type: 'feeding', icon: '🍼', label: '喂养' },
  { type: 'sleep', icon: '😴', label: '睡眠' },
  { type: 'milestone', icon: '🌟', label: '里程碑' },
  { type: 'health', icon: '💉', label: '健康' },
  { type: 'photo', icon: '📸', label: '照片' }
]

const typeNameMap = {
  growth: '身高体重', feeding: '喂养', sleep: '睡眠',
  milestone: '里程碑', health: '健康', photo: '照片', note: '笔记'
}

const typeIconMap = {
  growth: '📏', feeding: '🍼', sleep: '😴',
  milestone: '🌟', health: '💉', photo: '📸', note: '📝'
}

Page({
  data: {
    records: [],
    dateGroups: [],
    hasGrowthData: false,
    typeOptions,
    typeNameMap,
    typeIconMap,
    activeType: '',
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: 20
  },

  onShow() {
    this.setData({ records: [], page: 1, hasMore: true, hasGrowthData: false })
    this.loadRecords()
  },

  async loadRecords() {
    const baby = app.globalData.babyInfo || wx.getStorageSync('babyInfo')
    if (!baby) return

    this.setData({ loading: true })

    try {
      const params = {
        page: this.data.page,
        pageSize: this.data.pageSize
      }
      if (this.data.activeType) {
        params.type = this.data.activeType
      }

      const res = await http.get(`/babies/${baby.id}/records`, params)
      if (res.code === 0) {
        const newRecords = res.data.records.map(r => ({
          ...r,
          recordDateStr: friendlyDate(r.recordDate)
        }))

        const allRecords = this.data.page === 1
          ? newRecords
          : [...this.data.records, ...newRecords]

        // 按日期分组
        const dateGroups = this.groupByDate(allRecords)

        // 检查是否有足够的身高体重数据来显示曲线
        const growthCount = allRecords.filter(r =>
          r.type === 'growth' && r.data && (r.data.height || r.data.weight)
        ).length

        this.setData({
          records: allRecords,
          dateGroups,
          hasGrowthData: growthCount >= 2,
          hasMore: allRecords.length < res.data.total
        })
      }
    } catch (err) {
      console.error('加载记录失败:', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 按日期分组
  groupByDate(records) {
    const groups = {}
    records.forEach(r => {
      const dateKey = r.recordDate ? r.recordDate.substring(0, 10) : 'unknown'
      if (!groups[dateKey]) {
        const d = new Date(dateKey)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        let label = `${d.getMonth() + 1}月${d.getDate()}日`
        if (dateKey === today.toISOString().substring(0, 10)) label = '今天'
        else if (dateKey === yesterday.toISOString().substring(0, 10)) label = '昨天'

        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        const weekDay = weekDays[d.getDay()]

        groups[dateKey] = {
          dateKey,
          label,
          weekDay,
          fullDate: `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`,
          items: []
        }
      }
      groups[dateKey].items.push(r)
    })
    return Object.values(groups)
  },

  // 筛选切换
  onFilterTap(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      activeType: type,
      page: 1,
      records: [],
      hasMore: true
    })
    this.loadRecords()
  },

  // 加载更多
  loadMore() {
    if (!this.data.hasMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadRecords()
  },

  // 查看记录详情
  viewRecord(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({ title: '记录详情', icon: 'none' })
  },

  // 跳转添加记录
  goAddRecord() {
    const type = this.data.activeType || ''
    wx.navigateTo({
      url: `/pages/baby/add-record${type ? '?type=' + type : ''}`
    })
  },

  // 跳转生长曲线页面
  goGrowthChart() {
    wx.navigateTo({ url: '/pages/baby/growth-chart' })
  }
})
