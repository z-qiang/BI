const config = require('../config/env')

module.exports = (req, res, next) => {
  if (!config.internalApiToken) {
    const error = new Error('INTERNAL_API_TOKEN 未配置')
    error.statusCode = 503
    return next(error)
  }
  if (req.get('x-internal-token') !== config.internalApiToken) {
    const error = new Error('内部接口认证失败')
    error.statusCode = 401
    return next(error)
  }
  return next()
}
