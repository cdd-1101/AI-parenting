/**
 * 腾讯云 COS 对象存储服务
 * - COS 客户端管理（懒加载）
 * - 文件上传（单张 / 批量）
 * - 文件名生成 & URL 拼接
 */
const path = require('path')
const crypto = require('crypto')

/**
 * 检查 COS 是否已配置
 */
function isCOSConfigured() {
  return !!(
    process.env.COS_SECRET_ID &&
    process.env.COS_SECRET_KEY &&
    process.env.COS_SECRET_ID !== 'your_cos_secret_id'
  )
}

/**
 * 获取 COS 客户端实例（懒加载）
 */
function getCOSClient() {
  if (!isCOSConfigured()) {
    return null
  }
  const COS = require('cos-nodejs-sdk-v5')
  return new COS({
    SecretId: process.env.COS_SECRET_ID,
    SecretKey: process.env.COS_SECRET_KEY
  })
}

/**
 * 生成唯一的存储文件名
 * @param {string} originalName - 原始文件名
 * @param {string} [prefix='parenting'] - 存储目录前缀
 * @returns {string}
 */
function generateFilename(originalName, prefix = 'parenting') {
  const ext = path.extname(originalName) || '.jpg'
  const hash = crypto.randomBytes(8).toString('hex')
  return `${prefix}/${Date.now()}_${hash}${ext}`
}

/**
 * 生成文件访问 URL
 * @param {string} filename - 存储路径（含前缀）
 * @returns {string}
 */
function getFileUrl(filename) {
  const bucket = process.env.COS_BUCKET
  const region = process.env.COS_REGION
  return `https://${bucket}.cos.${region}.myqcloud.com/${filename}`
}

/**
 * 上传单个文件到 COS
 * @param {Buffer} buffer - 文件内容
 * @param {string} originalName - 原始文件名
 * @param {string} mimetype - MIME 类型
 * @param {number} size - 文件大小（字节）
 * @returns {{ url: string, filename: string, size: number }}
 */
async function uploadFile(buffer, originalName, mimetype, size) {
  const cos = getCOSClient()
  if (!cos) {
    throw new Error('COS 未配置，请在 .env 中设置腾讯云 COS 密钥')
  }

  const filename = generateFilename(originalName)
  const bucket = process.env.COS_BUCKET
  const region = process.env.COS_REGION

  await new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: bucket,
      Region: region,
      Key: filename,
      Body: buffer,
      ContentLength: size,
      ContentType: mimetype
    }, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })

  return {
    url: getFileUrl(filename),
    filename,
    size
  }
}

/**
 * 批量上传文件到 COS
 * @param {Array<{ buffer: Buffer, originalname: string, mimetype: string, size: number }>} files
 * @returns {Array<{ url: string, filename: string, size: number }>}
 */
async function uploadBatch(files) {
  const results = []
  for (const file of files) {
    const result = await uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      file.size
    )
    results.push(result)
  }
  return results
}

module.exports = {
  isCOSConfigured,
  getCOSClient,
  generateFilename,
  getFileUrl,
  uploadFile,
  uploadBatch
}
