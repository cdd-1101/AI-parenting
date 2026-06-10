/**
 * 月龄/日龄计算工具
 * @param {string} birthday - 出生日期 YYYY-MM-DD
 * @param {string} [referenceDate] - 参考日期，默认为今天
 * @returns {object} { months, days, totalDays, ageText }
 */
function calculateAge(birthday, referenceDate) {
  const birth = new Date(birthday)
  const ref = referenceDate ? new Date(referenceDate) : new Date()

  // 计算总天数
  const totalDays = Math.floor((ref - birth) / (1000 * 60 * 60 * 24))

  // 计算月龄和剩余天数
  let months = (ref.getFullYear() - birth.getFullYear()) * 12 + (ref.getMonth() - birth.getMonth())
  let days = ref.getDate() - birth.getDate()

  if (days < 0) {
    months -= 1
    // 获取上个月的最后一天
    const lastMonth = new Date(ref.getFullYear(), ref.getMonth(), 0)
    days += lastMonth.getDate()
  }

  // 生成年龄文本
  let ageText = ''
  if (months === 0) {
    ageText = `${totalDays}天`
  } else if (days === 0) {
    ageText = `${months}个月`
  } else {
    ageText = `${months}个月${days}天`
  }

  return {
    months,
    days,
    totalDays,
    ageText
  }
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date|string} date
 * @returns {string}
 */
function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 获取友好的日期显示
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string}
 */
function friendlyDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays === 2) return '前天'
  if (diffDays < 7) return `${diffDays}天前`

  const month = date.getMonth() + 1
  const day = date.getDate()

  if (date.getFullYear() === now.getFullYear()) {
    return `${month}月${day}日`
  }

  return `${date.getFullYear()}年${month}月${day}日`
}

module.exports = {
  calculateAge,
  formatDate,
  friendlyDate
}
