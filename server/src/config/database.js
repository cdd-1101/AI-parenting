/**
 * Prisma 数据库客户端实例
 * 单例模式，全局共享
 */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

// 优雅关闭时断开连接
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

module.exports = prisma
