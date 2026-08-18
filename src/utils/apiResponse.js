/**
 * 统一 API 响应结果封装工具
 */
class ApiResponse {
  /**
   * 成功响应
   * @param {object} res Express res 对象
   * @param {any} data 返回数据
   * @param {string} message 成功提示信息
   * @param {number} code 状态码
   */
  static success(res, data = null, message = '操作成功', code = 200) {
    return res.status(code).json({
      code,
      message,
      data,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * 失败响应
   * @param {object} res Express res 对象
   * @param {string} message 错误提示信息
   * @param {number} code 错误状态码
   * @param {any} errors 详细错误说明
   */
  static error(res, message = '服务器内部错误', code = 500, errors = null) {
    return res.status(code).json({
      code,
      message,
      errors,
      timestamp: new Date().toISOString()
    })
  }
}

module.exports = ApiResponse
