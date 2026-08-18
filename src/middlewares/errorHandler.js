const ApiResponse = require('../utils/apiResponse')
const config = require('../config/env')

/**
 * 全局统一异常处理中间件
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err)

  const statusCode = err.statusCode || err.status || 500
  const message = err.message || '服务器内部异常'
  const errors = config.nodeEnv === 'development' ? err.stack : null

  return ApiResponse.error(res, message, statusCode, errors)
}

module.exports = errorHandler
