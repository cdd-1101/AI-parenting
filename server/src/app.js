/**
 * 安心育儿小程序 - Express API 服务入口
 */
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const { errorHandler } = require('./middleware/errorHandler')
const { authMiddleware } = require('./middleware/auth')

const app = express()
const PORT = process.env.PORT || 3000

// ============ 全局中间件 ============
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 全局限流：每个 IP 每分钟最多 60 次请求
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { code: 429, message: '请求过于频繁，请稍后再试' }
})
app.use('/api/', globalLimiter)

// ============ 健康检查 ============
app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: 'ok', data: { timestamp: Date.now() } })
})

// ============ 路由注册 ============
const authRoutes = require('./routes/auth')
const babyRoutes = require('./routes/baby')
const growthRoutes = require('./routes/growth')
const knowledgeRoutes = require('./routes/knowledge')
const chatRoutes = require('./routes/chat')
const uploadRoutes = require('./routes/upload')
const homeRoutes = require('./routes/home')
const favoriteRoutes = require('./routes/favorite')

app.use('/api/auth', authRoutes)
app.use('/api/babies', authMiddleware, babyRoutes)
app.use('/api/babies/:babyId/records', authMiddleware, growthRoutes)
app.use('/api/knowledge', knowledgeRoutes)
app.use('/api/chat', authMiddleware, chatRoutes)
app.use('/api/upload', authMiddleware, uploadRoutes)
app.use('/api/home', authMiddleware, homeRoutes)
app.use('/api/favorites', authMiddleware, favoriteRoutes)

// ============ 404 处理 ============
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' })
})

// ============ 全局错误处理 ============
app.use(errorHandler)

// ============ 启动服务 ============
const server = app.listen(PORT, () => {
  console.log(`🚀 安心育儿 API 服务已启动: http://localhost:${PORT}`)
  console.log(`📋 健康检查: http://localhost:${PORT}/api/health`)
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`)
})

// ============ 优雅关闭 ============
const gracefulShutdown = async (signal) => {
  console.log(`\n收到 ${signal} 信号，正在优雅关闭...`)
  server.close(async () => {
    const { redisService } = require('./services')
    await redisService.disconnect()
    console.log('服务已关闭')
    process.exit(0)
  })
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

module.exports = app
