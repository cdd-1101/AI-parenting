/**
 * 全局错误处理中间件
 * 统一捕获并格式化所有未处理的错误
 */

function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)

  // Prisma 已知错误
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          code: 409,
          message: '数据已存在（唯一约束冲突）'
        })
      case 'P2025':
        return res.status(404).json({
          code: 404,
          message: '记录不存在'
        })
    }
  }

  // 自定义业务错误
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message
    })
  }

  // 未知错误
  const statusCode = err.status || 500
  res.status(statusCode).json({
    code: statusCode,
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误'
  })
}

/**
 * 创建自定义业务错误
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
  }
}

module.exports = { errorHandler, AppError }
