/**
 * JWT 鉴权中间件
 * 从 Authorization header 中提取并验证 JWT token
 */
const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未提供有效的认证令牌' })
  }

  const token = authHeader.substring(7) // 去掉 "Bearer " 前缀

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { userId, openid }
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: '登录已过期，请重新登录' })
    }
    return res.status(401).json({ code: 401, message: '无效的认证令牌' })
  }
}

module.exports = { authMiddleware }
