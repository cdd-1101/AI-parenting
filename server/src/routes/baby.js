const express = require('express')
const router = express.Router()
const prisma = require('../config/database')
const { AppError } = require('../middleware/errorHandler')

/**
 * POST /api/babies - 创建宝宝档案
 */
router.post('/', async (req, res, next) => {
  try {
    const { nickname, gender, birthday, feedingType, bloodType } = req.body

    if (!nickname || !gender || !birthday) {
      throw new AppError('昵称、性别和出生日期为必填项')
    }

    const baby = await prisma.baby.create({
      data: {
        userId: req.user.userId,
        nickname,
        gender,
        birthday: new Date(birthday),
        feedingType: feedingType || 'breast',
        bloodType
      }
    })

    res.json({ code: 0, message: 'ok', data: baby })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/babies/:id - 获取宝宝信息（含自动计算月龄）
 */
router.get('/:id', async (req, res, next) => {
  try {
    const baby = await prisma.baby.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.userId
      }
    })

    if (!baby) {
      throw new AppError('宝宝不存在', 404)
    }

    // 计算月龄
    const now = new Date()
    const birth = new Date(baby.birthday)
    const ageMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24))

    res.json({
      code: 0,
      message: 'ok',
      data: {
        ...baby,
        ageMonths,
        totalDays,
        birthday: baby.birthday.toISOString().split('T')[0]
      }
    })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/babies/:id - 更新宝宝信息
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { nickname, gender, birthday, feedingType, bloodType, avatarUrl } = req.body

    const baby = await prisma.baby.update({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.userId
      },
      data: {
        ...(nickname && { nickname }),
        ...(gender && { gender }),
        ...(birthday && { birthday: new Date(birthday) }),
        ...(feedingType && { feedingType }),
        ...(bloodType !== undefined && { bloodType }),
        ...(avatarUrl && { avatarUrl })
      }
    })

    res.json({ code: 0, message: 'ok', data: baby })
  } catch (err) {
    next(err)
  }
})

module.exports = router
