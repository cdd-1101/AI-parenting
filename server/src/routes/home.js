const express = require('express')
const router = express.Router()
const prisma = require('../config/database')

// GET /dashboard - 首页聚合接口
router.get('/dashboard', async (req, res, next) => {
  try {
    // 获取宝宝信息
    const baby = await prisma.baby.findFirst({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    })

    if (!baby) {
      return res.json({ code: 0, message: 'ok', data: { baby: null } })
    }

    // 计算月龄
    const now = new Date()
    const birth = new Date(baby.birthday)
    const ageMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24))

    // 获取最新的身高体重记录
    const latestGrowth = await prisma.growthRecord.findFirst({
      where: { babyId: baby.id, type: 'growth' },
      orderBy: { recordDate: 'desc' }
    })

    // 获取本月发育提醒（从知识库中匹配当前月龄）
    const knowledge = await prisma.knowledgeBase.findMany({
      where: { month: ageMonths },
      select: { section: true, summary: true }
    })

    const monthTips = knowledge
      .filter(k => k.summary)
      .map(k => k.summary)
      .slice(0, 5)

    res.json({
      code: 0,
      message: 'ok',
      data: {
        baby: {
          ...baby,
          birthday: baby.birthday.toISOString().split('T')[0],
          ageMonths,
          totalDays
        },
        latestGrowth: latestGrowth ? latestGrowth.data : null,
        monthTips,
        recommendations: [] // Sprint 5 实现推荐算法
      }
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
