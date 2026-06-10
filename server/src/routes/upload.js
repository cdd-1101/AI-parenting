const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const crypto = require('crypto')

// Multer 配置：内存存储，限制 5MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('仅支持 JPG、PNG、GIF、WebP 格式的图片'))
    }
  }
})

/**
 * 初始化 COS 客户端（懒加载，避免未配置时报错）
 */
function getCOS() {
  const COS = require('cos-nodejs-sdk-v5')
  return new COS({
    SecretId: process.env.COS_SECRET_ID,
    SecretKey: process.env.COS_SECRET_KEY
  })
}

/**
 * POST /image - 上传单张图片到腾讯云 COS
 * Content-Type: multipart/form-data
 * Body: file (图片文件)
 * Returns: { url: "https://..." }
 */
router.post('/image', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.json({ code: 400, message: '请上传图片文件' })
    }

    // 生成唯一文件名
    const ext = path.extname(req.file.originalname) || '.jpg'
    const filename = `parenting/${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext}`

    const cos = getCOS()
    const bucket = process.env.COS_BUCKET
    const region = process.env.COS_REGION

    // 上传到 COS
    const result = await new Promise((resolve, reject) => {
      cos.putObject({
        Bucket: bucket,
        Region: region,
        Key: filename,
        Body: req.file.buffer,
        ContentLength: req.file.size,
        ContentType: req.file.mimetype
      }, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })

    // 拼接访问 URL
    const imageUrl = `https://${bucket}.cos.${region}.myqcloud.com/${filename}`

    res.json({
      code: 0,
      message: 'ok',
      data: {
        url: imageUrl,
        filename: filename,
        size: req.file.size
      }
    })
  } catch (err) {
    console.error('COS 上传失败:', err.message)
    // 如果 COS 未配置，降级为本地存储提示
    if (!process.env.COS_SECRET_ID || process.env.COS_SECRET_ID === 'your_cos_secret_id') {
      return res.json({
        code: -1,
        message: 'COS 未配置，请在 .env 中设置腾讯云 COS 密钥'
      })
    }
    next(err)
  }
})

/**
 * POST /images - 批量上传（最多9张）
 */
router.post('/images', upload.array('files', 9), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.json({ code: 400, message: '请上传图片文件' })
    }

    const cos = getCOS()
    const bucket = process.env.COS_BUCKET
    const region = process.env.COS_REGION
    const results = []

    for (const file of req.files) {
      const ext = path.extname(file.originalname) || '.jpg'
      const filename = `parenting/${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext}`

      await new Promise((resolve, reject) => {
        cos.putObject({
          Bucket: bucket,
          Region: region,
          Key: filename,
          Body: file.buffer,
          ContentLength: file.size,
          ContentType: file.mimetype
        }, (err, data) => {
          if (err) reject(err)
          else resolve(data)
        })
      })

      results.push({
        url: `https://${bucket}.cos.${region}.myqcloud.com/${filename}`,
        filename,
        size: file.size
      })
    }

    res.json({ code: 0, message: 'ok', data: { images: results } })
  } catch (err) {
    console.error('COS 批量上传失败:', err.message)
    next(err)
  }
})

module.exports = router
