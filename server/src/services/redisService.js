/**
 * Redis 缓存服务
 * - 懒加载单例客户端
 * - 连接失败时优雅降级（返回 null，不崩溃）
 * - 提供 JSON 序列化/反序列化的缓存方法
 */
const { createClient } = require('redis')

let redisClient = null
let isConnected = false

/**
 * 获取 Redis 客户端实例（懒加载单例）
 * 连接失败时返回 null
 */
async function getRedisClient() {
  if (redisClient && isConnected) {
    return redisClient
  }

  try {
    const url = process.env.REDIS_URL || 'redis://localhost:6379'
    redisClient = createClient({ url })

    redisClient.on('error', (err) => {
      console.log('[Redis] 连接错误:', err.message)
      isConnected = false
    })

    redisClient.on('connect', () => {
      console.log('[Redis] 已连接')
      isConnected = true
    })

    redisClient.on('end', () => {
      isConnected = false
    })

    await redisClient.connect()
    return redisClient
  } catch (err) {
    console.log('[Redis] 初始化失败，降级模式:', err.message)
    isConnected = false
    return null
  }
}

/**
 * 获取字符串缓存值
 * @param {string} key
 * @returns {string|null}
 */
async function cacheGet(key) {
  try {
    const client = await getRedisClient()
    if (!client) return null
    return await client.get(key)
  } catch (err) {
    return null
  }
}

/**
 * 设置字符串缓存值
 * @param {string} key
 * @param {string} value
 * @param {number} [ttl=300] - 过期时间（秒），默认 5 分钟
 */
async function cacheSet(key, value, ttl = 300) {
  try {
    const client = await getRedisClient()
    if (!client) return
    await client.set(key, value, { EX: ttl })
  } catch (err) {
    // 静默处理
  }
}

/**
 * 获取 JSON 缓存（自动反序列化）
 * @param {string} key
 * @returns {object|null}
 */
async function cacheGetJSON(key) {
  const raw = await cacheGet(key)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * 设置 JSON 缓存（自动序列化）
 * @param {string} key
 * @param {object} value
 * @param {number} [ttl=300]
 */
async function cacheSetJSON(key, value, ttl = 300) {
  await cacheSet(key, JSON.stringify(value), ttl)
}

/**
 * 删除缓存
 * @param {string} key
 */
async function cacheDel(key) {
  try {
    const client = await getRedisClient()
    if (!client) return
    await client.del(key)
  } catch (err) {
    // 静默处理
  }
}

/**
 * 检查键是否存在
 * @param {string} key
 * @returns {boolean}
 */
async function cacheExists(key) {
  try {
    const client = await getRedisClient()
    if (!client) return false
    return (await client.exists(key)) === 1
  } catch (err) {
    return false
  }
}

/**
 * 关闭 Redis 连接（用于优雅关闭）
 */
async function disconnect() {
  if (redisClient && isConnected) {
    try {
      await redisClient.quit()
    } catch (err) {
      console.log('[Redis] 关闭连接失败:', err.message)
    }
    isConnected = false
  }
}

module.exports = {
  getRedisClient,
  cacheGet,
  cacheSet,
  cacheGetJSON,
  cacheSetJSON,
  cacheDel,
  cacheExists,
  disconnect
}
