/**
 * 宝宝相关服务
 * - 月龄计算
 * - 宝宝信息查询（含年龄自动计算）
 * - 归属验证
 */
const prisma = require('../config/database')

/**
 * 计算宝宝月龄
 * @param {Date|string} birthday - 出生日期
 * @param {Date} [referenceDate] - 参考日期，默认今天
 * @returns {{ months: number, days: number, totalDays: number }}
 */
function calculateAge(birthday, referenceDate) {
  const birth = new Date(birthday)
  const ref = referenceDate ? new Date(referenceDate) : new Date()

  const totalDays = Math.floor((ref - birth) / (1000 * 60 * 60 * 24))

  let months = (ref.getFullYear() - birth.getFullYear()) * 12 + (ref.getMonth() - birth.getMonth())
  let days = ref.getDate() - birth.getDate()

  if (days < 0) {
    months -= 1
    const lastMonth = new Date(ref.getFullYear(), ref.getMonth(), 0)
    days += lastMonth.getDate()
  }

  return { months: Math.max(months, 0), days: Math.max(days, 0), totalDays }
}

/**
 * 获取用户最新的宝宝信息（含月龄计算）
 * @param {number} userId
 * @returns {object|null}
 */
async function getBabyWithAge(userId) {
  const baby = await prisma.baby.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  if (!baby) return null

  const age = calculateAge(baby.birthday)
  return {
    ...baby,
    birthday: baby.birthday instanceof Date
      ? baby.birthday.toISOString().split('T')[0]
      : baby.birthday,
    ageMonths: age.months,
    totalDays: age.totalDays
  }
}

/**
 * 验证宝宝归属（确保 babyId 属于当前用户）
 * @param {number} babyId
 * @param {number} userId
 * @returns {object|null}
 */
async function verifyBabyOwnership(babyId, userId) {
  return prisma.baby.findFirst({
    where: { id: babyId, userId }
  })
}

/**
 * 格式化宝宝信息用于前端展示（日期转 ISO 字符串）
 * @param {object} baby - Prisma 查询返回的 baby 对象
 * @returns {object|null}
 */
function formatBabyForResponse(baby) {
  if (!baby) return null
  return {
    ...baby,
    birthday: baby.birthday instanceof Date
      ? baby.birthday.toISOString().split('T')[0]
      : baby.birthday
  }
}

/**
 * 喂养方式映射
 */
const FEEDING_TYPE_MAP = {
  breast: '母乳喂养',
  formula: '配方奶喂养',
  mixed: '混合喂养'
}

/**
 * 性别映射
 */
const GENDER_MAP = {
  male: '男宝宝',
  female: '女宝宝'
}

module.exports = {
  calculateAge,
  getBabyWithAge,
  verifyBabyOwnership,
  formatBabyForResponse,
  FEEDING_TYPE_MAP,
  GENDER_MAP
}
