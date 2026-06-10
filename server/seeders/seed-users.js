/**
 * 开发/测试用户种子数据
 * 用法: node seeders/seed-users.js
 * 
 * 创建测试用户，方便本地开发调试
 * 生产环境请勿执行
 */
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'parenting_dev_secret'

// 测试用户列表
const testUsers = [
  {
    openid: 'dev_test_user_001',
    unionId: null,
    nickname: '测试妈妈',
    avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/default/132',
    phone: null
  },
  {
    openid: 'dev_test_user_002',
    unionId: null,
    nickname: '测试爸爸',
    avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/default/132',
    phone: null
  },
  {
    openid: 'dev_test_user_003',
    unionId: null,
    nickname: '新手妈妈小美',
    avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/default/132',
    phone: null
  }
]

// 测试宝宝数据
const testBabies = {
  'dev_test_user_001': [
    {
      nickname: '小贝',
      gender: 'male',
      birthday: new Date('2025-09-15'),
      weight: 3.2,
      height: 50,
      feedingType: 'breast',
      avatar: null
    }
  ],
  'dev_test_user_002': [
    {
      nickname: '小美',
      gender: 'female',
      birthday: new Date('2025-06-01'),
      weight: 2.8,
      height: 48,
      feedingType: 'mixed',
      avatar: null
    }
  ],
  'dev_test_user_003': [
    {
      nickname: '大宝',
      gender: 'male',
      birthday: new Date('2025-11-20'),
      weight: 3.5,
      height: 51,
      feedingType: 'formula',
      avatar: null
    }
  ]
}

async function main() {
  console.log('🌱 开始填充测试用户数据...\n')

  for (const userData of testUsers) {
    // upsert：存在则跳过，不存在则创建
    const user = await prisma.user.upsert({
      where: { openid: userData.openid },
      update: {},
      create: userData
    })

    console.log(`  ✅ 用户 "${user.nickname}" (ID: ${user.id})`)

    // 为该用户创建宝宝
    const babies = testBabies[userData.openid] || []
    for (const babyData of babies) {
      // 检查是否已有宝宝
      const existing = await prisma.baby.findFirst({
        where: { userId: user.id, nickname: babyData.nickname }
      })

      if (existing) {
        console.log(`     ↳ 宝宝 "${babyData.nickname}" 已存在，跳过`)
        continue
      }

      const baby = await prisma.baby.create({
        data: { ...babyData, userId: user.id }
      })
      console.log(`     ↳ 宝宝 "${baby.nickname}" (ID: ${baby.id})`)

      // 为每个宝宝创建几条成长记录
      const today = new Date()
      const records = [
        {
          babyId: baby.id,
          userId: user.id,
          type: 'FEEDING',
          time: new Date(today.getTime() - 2 * 3600000),
          data: { amount: 120, duration: 15, unit: 'ml' },
          note: '早上喂奶'
        },
        {
          babyId: baby.id,
          userId: user.id,
          type: 'SLEEP',
          time: new Date(today.getTime() - 5 * 3600000),
          data: { duration: 90, quality: 'good' },
          note: '午觉'
        },
        {
          babyId: baby.id,
          userId: user.id,
          type: 'MILESTONE',
          time: new Date(today.getTime() - 24 * 3600000),
          data: { milestone: '会翻身了' },
          note: '第一次翻身！'
        }
      ]

      for (const record of records) {
        await prisma.growthRecord.create({ data: record })
      }
      console.log(`     ↳ 成长记录: ${records.length} 条`)
    }

    // 生成测试 Token 方便调试
    const token = jwt.sign(
      { userId: user.id, openid: user.openid },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    console.log(`     🔑 Token: ${token.slice(0, 30)}...`)
  }

  console.log('\n✅ 测试数据填充完成！')
  console.log('\n💡 可用 Token（用于 API 测试）:')
  
  const firstUser = await prisma.user.findUnique({ where: { openid: 'dev_test_user_001' } })
  if (firstUser) {
    const token = jwt.sign(
      { userId: firstUser.id, openid: firstUser.openid },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    console.log(`   测试妈妈: ${token}`)
  }
}

main()
  .catch(err => {
    console.error('❌ 填充失败:', err.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
