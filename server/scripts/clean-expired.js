/**
 * 清理过期数据脚本
 * 用法: node scripts/clean-expired.js [--dry-run]
 * 清理内容:
 *   - 超过 90 天的对话记录及其消息
 *   - 已注销用户的孤立数据
 * --dry-run 只统计不删除
 */
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const isDryRun = process.argv.includes('--dry-run')

async function main() {
  console.log(`${isDryRun ? '📊 [DRY RUN] ' : '🧹 '}开始清理过期数据...\n`)

  try {
    // 1. 清理 90 天前的对话
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 90)

    const oldConversations = await prisma.conversation.findMany({
      where: { createdAt: { lt: cutoffDate } },
      select: { id: true }
    })

    const oldConvIds = oldConversations.map(c => c.id)
    console.log(`  超过 90 天的对话: ${oldConvIds.length} 条`)

    if (!isDryRun && oldConvIds.length > 0) {
      // 先删消息再删对话
      const deletedMessages = await prisma.conversationMessage.deleteMany({
        where: { conversationId: { in: oldConvIds } }
      })
      const deletedConvs = await prisma.conversation.deleteMany({
        where: { id: { in: oldConvIds } }
      })
      console.log(`    ✅ 已删除 ${deletedMessages.count} 条消息, ${deletedConvs.count} 条对话`)
    }

    // 2. 清理孤立宝宝（用户不存在）
    const allUserIds = await prisma.user.findMany({ select: { id: true } })
    const userIdSet = new Set(allUserIds.map(u => u.id))

    const allBabies = await prisma.baby.findMany({ select: { id: true, userId: true } })
    const orphanBabies = allBabies.filter(b => !userIdSet.has(b.userId))
    console.log(`  孤立宝宝（用户已不存在）: ${orphanBabies.length} 个`)

    if (!isDryRun && orphanBabies.length > 0) {
      const orphanIds = orphanBabies.map(b => b.id)
      // 先清理关联数据
      await prisma.growthRecord.deleteMany({ where: { babyId: { in: orphanIds } } })
      await prisma.favorite.deleteMany({ where: { babyId: { in: orphanIds } } })
      const deleted = await prisma.baby.deleteMany({ where: { id: { in: orphanIds } } })
      console.log(`    ✅ 已删除 ${deleted.count} 个孤立宝宝及关联数据`)
    }

    // 3. 统计汇总
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.baby.count(),
      prisma.growthRecord.count(),
      prisma.conversation.count(),
      prisma.conversationMessage.count(),
      prisma.favorite.count(),
      prisma.knowledgeBase.count()
    ])

    console.log('\n📊 当前数据统计:')
    console.log(`  用户: ${stats[0]}`)
    console.log(`  宝宝: ${stats[1]}`)
    console.log(`  成长记录: ${stats[2]}`)
    console.log(`  对话: ${stats[3]}`)
    console.log(`  消息: ${stats[4]}`)
    console.log(`  收藏: ${stats[5]}`)
    console.log(`  知识库: ${stats[6]}`)

    if (isDryRun) {
      console.log('\n💡 去掉 --dry-run 参数可实际执行清理')
    } else {
      console.log('\n✅ 清理完成')
    }

  } catch (err) {
    console.error('❌ 清理失败:', err.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
