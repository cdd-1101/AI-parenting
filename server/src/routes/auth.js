const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const prisma = require('../config/database')

/**
 * POST /api/auth/dev-login
 * 开发模式模拟登录（仅 NODE_ENV=development 时可用）
 * 前端传入 openid 即可直接获取 token，无需微信 code
 */
router.post('/dev-login', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.json({ code: 403, message: '此接口仅在开发环境可用' })
    }

    const { openid } = req.body
    if (!openid) {
      return res.json({ code: 400, message: '缺少 openid 参数' })
    }

    // 查找或创建用户
    let user = await prisma.user.findUnique({ where: { openid } })
    if (!user) {
      user = await prisma.user.create({
        data: { openid, nickname: '开发测试用户' }
      })
    }

    // 查找用户的宝宝信息
    const baby = await prisma.baby.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    // 生成 JWT
    const expiresIn = 7 * 24 * 60 * 60 // 7天
    const token = jwt.sign(
      { userId: user.id, openid },
      process.env.JWT_SECRET,
      { expiresIn }
    )

    res.json({
      code: 0,
      message: 'ok',
      data: {
        token,
        expiresIn,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          role: user.role
        },
        baby: baby ? {
          id: baby.id,
          nickname: baby.nickname,
          gender: baby.gender,
          birthday: baby.birthday,
          feedingType: baby.feedingType,
          avatarUrl: baby.avatarUrl
        } : null
      }
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/auth/login
 * 微信小程序登录：code 换 token
 */
router.post('/login', async (req, res, next) => {
  try {
    const { code } = req.body
    if (!code) {
      return res.json({ code: 400, message: '缺少 code 参数' })
    }

    // 调用微信 code2session 接口
    const wxRes = await new Promise((resolve, reject) => {
      const https = require('https')
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.WX_APPID}&secret=${process.env.WX_SECRET}&js_code=${code}&grant_type=authorization_code`
      https.get(url, (resp) => {
        let data = ''
        resp.on('data', chunk => data += chunk)
        resp.on('end', () => resolve(JSON.parse(data)))
      }).on('error', reject)
    })

    if (wxRes.errcode) {
      return res.json({ code: 400, message: `微信登录失败: ${wxRes.errmsg}` })
    }

    const { openid, session_key } = wxRes

    // 查找或创建用户
    let user = await prisma.user.findUnique({ where: { openid } })
    if (!user) {
      user = await prisma.user.create({
        data: { openid, nickname: '新用户' }
      })
    }

    // 查找用户的宝宝信息
    const baby = await prisma.baby.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    // 生成 JWT
    const expiresIn = 7 * 24 * 60 * 60 // 7天
    const token = jwt.sign(
      { userId: user.id, openid },
      process.env.JWT_SECRET,
      { expiresIn }
    )

    res.json({
      code: 0,
      message: 'ok',
      data: {
        token,
        expiresIn,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          role: user.role
        },
        baby: baby ? {
          id: baby.id,
          nickname: baby.nickname,
          gender: baby.gender,
          birthday: baby.birthday,
          feedingType: baby.feedingType,
          avatarUrl: baby.avatarUrl
        } : null
      }
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
