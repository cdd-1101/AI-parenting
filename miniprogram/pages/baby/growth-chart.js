// pages/baby/growth-chart.js
const http = require('../../utils/request')

const app = getApp()

Page({
  data: {
    growthData: [],
    chartType: 'height',
    validCount: 0,
    latestValue: '--',
    changeAmount: '--'
  },

  onLoad() {
    this.loadGrowthData()
  },

  async loadGrowthData() {
    const baby = app.globalData.babyInfo || wx.getStorageSync('babyInfo')
    if (!baby) return

    try {
      // 获取更多记录以便生成曲线
      const res = await http.get(`/babies/${baby.id}/records`, {
        type: 'growth',
        page: 1,
        pageSize: 100
      })

      if (res.code === 0) {
        const growthData = this.extractGrowthData(res.data.records)
        this.setData({ growthData })
        this.updateStats()

        if (growthData.length > 1) {
          setTimeout(() => this.drawChart(), 300)
        }
      }
    } catch (err) {
      console.error('加载生长曲线数据失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 提取身高体重数据（按月龄排序）
  extractGrowthData(records) {
    return records
      .filter(r => r.type === 'growth' && r.data)
      .filter(r => r.data.height || r.data.weight)
      .map(r => ({
        ageMonth: r.ageMonth || 0,
        ageDay: r.ageDay || 0,
        age: (r.ageMonth || 0) + (r.ageDay || 0) / 30,
        height: parseFloat(r.data.height) || null,
        weight: parseFloat(r.data.weight) || null,
        date: r.recordDate ? r.recordDate.substring(5, 10) : ''
      }))
      .sort((a, b) => a.age - b.age)
  },

  // 更新统计数据
  updateStats() {
    const { growthData, chartType } = this.data
    const key = chartType === 'height' ? 'height' : 'weight'
    const validData = growthData.filter(d => d[key] !== null)

    if (validData.length > 0) {
      const latestValue = validData[validData.length - 1][key].toFixed(1)
      const firstValue = validData[0][key]
      const lastValue = validData[validData.length - 1][key]
      const changeAmount = (lastValue - firstValue).toFixed(1)

      this.setData({
        validCount: validData.length,
        latestValue,
        changeAmount: changeAmount > 0 ? '+' + changeAmount : changeAmount
      })
    }
  },

  // 切换图表类型
  switchChart(e) {
    const type = e.currentTarget.dataset.type
    if (type === this.data.chartType) return

    this.setData({ chartType: type })
    this.updateStats()
    this.drawChart()
  },

  // 绘制生长曲线
  drawChart() {
    const query = wx.createSelectorQuery()
    query.select('#growthChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) return

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getWindowInfo().pixelRatio || 2

        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)

        const W = res[0].width
        const H = res[0].height
        const pad = { top: 30, right: 30, bottom: 50, left: 50 }
        const chartW = W - pad.left - pad.right
        const chartH = H - pad.top - pad.bottom

        const { growthData, chartType } = this.data
        const key = chartType === 'height' ? 'height' : 'weight'
        const data = growthData.filter(d => d[key] !== null)

        if (data.length < 2) return

        const values = data.map(d => d[key])
        const ages = data.map(d => d.age)
        const minVal = Math.min(...values) * 0.95
        const maxVal = Math.max(...values) * 1.05
        const minAge = Math.min(...ages)
        const maxAge = Math.max(...ages)
        const ageRange = maxAge - minAge || 1
        const valRange = maxVal - minVal || 1

        // 清空画布
        ctx.clearRect(0, 0, W, H)

        // 绘制网格线
        ctx.strokeStyle = '#F0F0F0'
        ctx.lineWidth = 0.5
        for (let i = 0; i <= 4; i++) {
          const y = pad.top + (chartH / 4) * i
          ctx.beginPath()
          ctx.moveTo(pad.left, y)
          ctx.lineTo(pad.left + chartW, y)
          ctx.stroke()
        }

        // Y轴标签
        ctx.fillStyle = '#999999'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'right'
        for (let i = 0; i <= 4; i++) {
          const y = pad.top + (chartH / 4) * i
          const val = (maxVal - (valRange / 4) * i).toFixed(1)
          ctx.fillText(val, pad.left - 8, y + 4)
        }

        // X轴标签
        ctx.textAlign = 'center'
        ctx.fillStyle = '#999999'
        const labelStep = Math.max(1, Math.floor(data.length / 5))
        for (let i = 0; i < data.length; i += labelStep) {
          const x = pad.left + ((data[i].age - minAge) / ageRange) * chartW
          ctx.fillText(data[i].date, x, H - pad.bottom + 20)
        }

        // 计算点坐标
        const points = data.map(d => ({
          x: pad.left + ((d.age - minAge) / ageRange) * chartW,
          y: pad.top + chartH - ((d[key] - minVal) / valRange) * chartH,
          val: d[key]
        }))

        // 绘制渐变填充区域
        const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH)
        gradient.addColorStop(0, 'rgba(255, 138, 128, 0.3)')
        gradient.addColorStop(1, 'rgba(255, 138, 128, 0.02)')
        ctx.beginPath()
        ctx.moveTo(points[0].x, pad.top + chartH)
        points.forEach(p => ctx.lineTo(p.x, p.y))
        ctx.lineTo(points[points.length - 1].x, pad.top + chartH)
        ctx.closePath()
        ctx.fillStyle = gradient
        ctx.fill()

        // 绘制曲线
        ctx.beginPath()
        ctx.strokeStyle = '#FF8A80'
        ctx.lineWidth = 3
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        })
        ctx.stroke()

        // 绘制数据点
        points.forEach(p => {
          // 外圈
          ctx.beginPath()
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
          ctx.fillStyle = '#FF8A80'
          ctx.fill()
          // 内圈
          ctx.beginPath()
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
          ctx.fillStyle = '#FFFFFF'
          ctx.fill()
        })

        // 最后一个点显示数值
        const last = points[points.length - 1]
        ctx.fillStyle = '#333333'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(last.val.toFixed(1), last.x, last.y - 14)
      })
  }
})
