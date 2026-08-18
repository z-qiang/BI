const ApiResponse = require('../utils/apiResponse')

const notFound = (req, res, next) => {
  return ApiResponse.error(res, `未找到路由: ${req.originalUrl}`, 404)
}

module.exports = notFound
