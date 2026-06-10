const express = require('express')
const router = express.Router({ mergeParams: true })
const prisma = require('../config/database')
const { AppError } = require('../middleware/errorHandler')

// POST / - 添加成长记录
router.post('/', async (req, res, next) => {
  try {
    const babyId = parseInt(req.params.babyId)
    const { type, recordDate, data, note, images, tags } = req.body

    if (!type || !recordDate || !data) {
      throw new AppError('类型、日期和数据为必填项')
    }

    // 计算月龄和日龄
    const baby = await prisma.baby.findFirst({ where: { id: babyId, userId: req.user.userId } })
    if (!baby) throw new AppError('宝宝不存在', 404)

    const birth = new Date(baby.birthday)
    const record = new Date(recordDate)
    const ageMonth = (record.getFullYear() - birth.getFullYear()) * 12 + (record.getMonth() - birth.getMonth())
    const ageDay = Math.floor((record - birth) / (1000 * 60 * 60 * 24))

    const growthRecord = await prisma.growthRecord.create({
      data: {
        babyId,
        userId: req.user.userId,
        type,
        recordDate: new Date(recordDate),
        ageMonth,
        ageDay,
        data,
        note,
        images,
        tags
      }
    })

    res.json({ code: 0, message: 'ok', data: growthRecord })
  } catch (err) {
    next(err)
  }
})

// GET / - 查询记录列表（分页、按类型筛选）
router.get('/', async (req, res, next) => {
  try {
    const babyId = parseInt(req.params.babyId)
    const { type, page = 1, pageSize = 20 } = req.query

    const where = { babyId }
    if (type) where.type = type

    const [records, total] = await Promise.all([
      prisma.growthRecord.findMany({
        where,
        orderBy: { recordDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: parseInt(pageSize)
      }),
      prisma.growthRecord.count({ where })
    ])

    res.json({
      code: 0,
      message: 'ok',
      data: { records, total, page: parseInt(page), pageSize: parseInt(pageSize) }
    })
  } catch (err) {
    next(err)
  }
})

// GET /:id - 记录详情
router.get('/:id', async (req, res, next) => {
  try {
    const record = await prisma.growthRecord.findFirst({
      where: { id: parseInt(req.params.id), babyId: parseInt(req.params.babyId) }
    })
    if (!record) throw new AppError('记录不存在', 404)
    res.json({ code: 0, message: 'ok', data: record })
  } catch (err) {
    next(err)
  }
})

// PUT /:id - 更新记录
router.put('/:id', async (req, res, next) => {
  try {
    const { data, note, images, tags } = req.body
    const record = await prisma.growthRecord.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(data && { data }),
        ...(note !== undefined && { note }),
        ...(images && { images }),
        ...(tags && { tags })
      }
    })
    res.json({ code: 0, message: 'ok', data: record })
  } catch (err) {
    next(err)
  }
})

// DELETE /:id - 删除记录
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.growthRecord.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ code: 0, message: 'ok' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
