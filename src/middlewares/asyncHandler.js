/**
 * 异步路由包装器，免除控制器中的 try-catch 样板代码
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = asyncHandler
