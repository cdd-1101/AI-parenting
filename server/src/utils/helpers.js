/**
 * 通用工具函数
 */

/**
 * 安全解析 JSON 字符串
 * @param {string} str
 * @param {*} [fallback=null] - 解析失败时的默认值
 * @returns {*}
 */
function safeParseJSON(str, fallback = null) {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
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
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss
 * @param {Date|string} date
 * @returns {string}
 */
function formatDateTime(date) {
  const d = new Date(date)
  return `${formatDate(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

/**
 * 异步等待指定毫秒数
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 截断字符串并添加省略号
 * @param {string} str
 * @param {number} [maxLen=50]
 * @returns {string}
 */
function truncate(str, maxLen = 50) {
  if (!str) return ''
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str
}

/**
 * 生成友好的日期显示文本
 * @param {string|Date} dateStr
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

/**
 * 从对象中选取指定字段（白名单）
 * @param {object} obj
 * @param {string[]} keys
 * @returns {object}
 */
function pick(obj, keys) {
  const result = {}
  keys.forEach(key => {
    if (obj && obj.hasOwnProperty(key)) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * 生成 JWT token payload（用于测试或内部调用）
 * @param {number} userId
 * @param {string} openid
 * @returns {object}
 */
function createTokenPayload(userId, openid) {
  return { userId, openid }
}

module.exports = {
  safeParseJSON,
  formatDate,
  formatDateTime,
  sleep,
  truncate,
  friendlyDate,
  pick,
  createTokenPayload
}
