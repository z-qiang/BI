const ApiResponse = require('../utils/apiResponse')
const config = require('../config/env')

class HealthController {
  check = (req, res) => {
    const data = {
      name: config.appName,
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date()
    }
    return ApiResponse.success(res, data, '系统服务健康')
  }
}

module.exports = new HealthController()
