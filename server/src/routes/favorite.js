/**
 * 收藏路由
 * GET    /           - 获取当前用户收藏列表
 * POST   /           - 添加收藏
 * DELETE /:id         - 取消收藏
 * POST   /toggle      - 切换收藏状态
 */
const express = require('express')
const router = express.Router()
const prisma = require('../config/database')

// 获取收藏列表
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.userId

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ code: 0, data: favorites })
  } catch (err) {
    next(err)
  }
})

// 添加收藏
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user.userId
    const { targetType, targetId } = req.body

    if (!targetType || !targetId) {
      return res.json({ code: 400, message: '参数不完整' })
    }

    const validTypes = ['knowledge', 'conversation', 'article']
    if (!validTypes.includes(targetType)) {
      return res.json({ code: 400, message: '无效的收藏类型' })
    }

    // 检查是否已存在
    const existing = await prisma.favorite.findFirst({
      where: { userId, targetType, targetId }
    })

    if (existing) {
      return res.json({ code: 0, data: existing, message: '已收藏' })
    }

    const favorite = await prisma.favorite.create({
      data: { userId, targetType, targetId }
    })

    res.json({ code: 0, data: favorite })
  } catch (err) {
    next(err)
  }
})

// 取消收藏
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user.userId
    const favoriteId = parseInt(req.params.id)

    const favorite = await prisma.favorite.findFirst({
      where: { id: favoriteId, userId }
    })

    if (!favorite) {
      return res.json({ code: 404, message: '收藏不存在' })
    }

    await prisma.favorite.delete({ where: { id: favoriteId } })

    res.json({ code: 0, message: '已取消收藏' })
  } catch (err) {
    next(err)
  }
})

// 切换收藏状态（收藏则取消，未收藏则添加）
router.post('/toggle', async (req, res, next) => {
  try {
    const userId = req.user.userId
    const { targetType, targetId } = req.body

    if (!targetType || !targetId) {
      return res.json({ code: 400, message: '参数不完整' })
    }

    const existing = await prisma.favorite.findFirst({
      where: { userId, targetType, targetId }
    })

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } })
      res.json({ code: 0, data: { favorited: false } })
    } else {
      const favorite = await prisma.favorite.create({
        data: { userId, targetType, targetId }
      })
      res.json({ code: 0, data: { favorited: true, favorite } })
    }
  } catch (err) {
    next(err)
  }
})

module.exports = router
