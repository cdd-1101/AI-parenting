/**
 * 数据库重置脚本（慎用！会清空所有数据）
 * 用法: node scripts/db-reset.js --confirm
 * 必须带 --confirm 参数才会执行
 */
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  if (!args.includes('--confirm')) {
    console.log('⚠️  数据库重置脚本')
    console.log('')
    console.log('⛔ 此操作将【删除所有数据】并重新初始化，不可恢复！')
    console.log('')
    console.log('确认执行请添加 --confirm 参数:')
    console.log('  node scripts/db-reset.js --confirm')
    process.exit(0)
  }

  console.log('🔄 开始重置数据库...\n')

  try {
    // 按外键依赖顺序删除
    console.log('  删除对话消息...')
    await prisma.conversationMessage.deleteMany()

    console.log('  删除对话记录...')
    await prisma.conversation.deleteMany()

    console.log('  删除收藏...')
    await prisma.favorite.deleteMany()

    console.log('  删除成长记录...')
    await prisma.growthRecord.deleteMany()

    console.log('  删除宝宝信息...')
    await prisma.baby.deleteMany()

    console.log('  删除知识库...')
    await prisma.knowledgeBase.deleteMany()

    console.log('  删除用户...')
    await prisma.user.deleteMany()

    console.log('\n✅ 数据库已清空')
    console.log('提示: 如需重新填充数据，请执行:')
    console.log('  npm run db:seed')

  } catch (err) {
    console.error('❌ 重置失败:', err.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
