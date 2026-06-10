const express = require('express')
const router = express.Router()
const prisma = require('../config/database')

// 月龄标题映射
const MONTH_TITLES = {
  0: '新生儿期',
  1: '1月龄',
  2: '2月龄',
  3: '3月龄',
  4: '4月龄',
  5: '5月龄',
  6: '6月龄',
  7: '7月龄',
  8: '8月龄',
  9: '9月龄',
  10: '10月龄',
  11: '11月龄',
  12: '12月龄'
}

// 板块名称映射
const SECTION_NAMES = {
  physiology: '生理特征',
  abilities: '能力发展',
  feeding: '喂养指南',
  sleep: '睡眠指导',
  common_issues: '常见问题',
  early_education: '早教互动'
}

// 板块图标映射
const SECTION_ICONS = {
  physiology: '🧬',
  abilities: '🏃',
  feeding: '🍼',
  sleep: '😴',
  common_issues: '💡',
  early_education: '🎨'
}

// GET /timeline - 获取 0-12 月龄概览
router.get('/timeline', async (req, res, next) => {
  try {
    const knowledge = await prisma.knowledgeBase.findMany({
      select: { month: true, section: true, title: true, summary: true },
      orderBy: [{ month: 'asc' }, { section: 'asc' }]
    })

    // 按月分组
    const monthMap = {}
    knowledge.forEach(item => {
      if (!monthMap[item.month]) {
        monthMap[item.month] = {
          month: item.month,
          title: MONTH_TITLES[item.month] || `${item.month}月龄`,
          sections: []
        }
      }
      monthMap[item.month].sections.push({
        section: item.section,
        sectionName: SECTION_NAMES[item.section] || item.section,
        icon: SECTION_ICONS[item.section] || '📖',
        title: item.title,
        summary: item.summary
      })
    })

    res.json({
      code: 0,
      message: 'ok',
      data: Object.values(monthMap)
    })
  } catch (err) {
    next(err)
  }
})

// GET /:month - 获取某月全部知识
router.get('/:month', async (req, res, next) => {
  try {
    const month = parseInt(req.params.month)
    if (isNaN(month) || month < 0 || month > 12) {
      return res.json({ code: 400, message: '月龄参数无效，请输入 0-12 的整数' })
    }

    const knowledge = await prisma.knowledgeBase.findMany({
      where: { month },
      orderBy: { id: 'asc' }
    })

    // 添加板块名称和图标
    const enriched = knowledge.map(item => ({
      ...item,
      sectionName: SECTION_NAMES[item.section] || item.section,
      icon: SECTION_ICONS[item.section] || '📖'
    }))

    res.json({
      code: 0,
      message: 'ok',
      data: {
        month,
        title: MONTH_TITLES[month] || `${month}月龄`,
        sections: enriched
      }
    })
  } catch (err) {
    next(err)
  }
})

// GET /:month/:section - 获取某月某板块详情
router.get('/:month/:section', async (req, res, next) => {
  try {
    const { month, section } = req.params
    const validSections = ['physiology', 'abilities', 'feeding', 'sleep', 'common_issues', 'early_education']

    if (!validSections.includes(section)) {
      return res.json({ code: 400, message: '板块参数无效' })
    }

    const knowledge = await prisma.knowledgeBase.findUnique({
      where: { month_section: { month: parseInt(month), section } }
    })

    if (!knowledge) {
      return res.json({ code: 404, message: '知识内容不存在' })
    }

    res.json({
      code: 0,
      message: 'ok',
      data: {
        ...knowledge,
        sectionName: SECTION_NAMES[section] || section,
        icon: SECTION_ICONS[section] || '📖'
      }
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
