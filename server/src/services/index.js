/**
 * Services 统一导出
 */
const babyService = require('./babyService')
const aiService = require('./aiService')
const redisService = require('./redisService')
const cosService = require('./cosService')

module.exports = {
  babyService,
  aiService,
  redisService,
  cosService
}
