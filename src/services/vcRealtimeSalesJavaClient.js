const axios = require('axios')
const config = require('../config/env')

class VcRealtimeSalesJavaClient {
  async importData(parsed) {
    if (!config.javaApi.internalToken) throw new Error('JAVA_API_INTERNAL_TOKEN 未配置')
    try {
      const response = await axios.post(
        `${config.javaApi.baseUrl}/erp/v1/internal/vc-realtime-sales/import`,
        {
          statDate: parsed.statDate,
          sourceFileName: parsed.fileName,
          summary: parsed.summary,
          rows: parsed.rows
        },
        {
          timeout: config.javaApi.timeoutMs,
          headers: {
            'content-type': 'application/json',
            'x-internal-token': config.javaApi.internalToken
          }
        }
      )
      const root = response.data
      if (!root || (root.code !== 200 && root.code !== 0)) {
        throw new Error(`Java 导入接口失败: ${root && root.msg ? root.msg : '响应格式异常'}`)
      }
      return root.data || root
    } catch (error) {
      if (error.response) {
        const message = error.response.data && (error.response.data.msg || error.response.data.message)
        throw new Error(`Java 导入接口 HTTP ${error.response.status}: ${message || '请求失败'}`)
      }
      if (error.code) throw new Error(`Java 导入接口请求失败: ${error.code}`)
      throw error
    }
  }
}

module.exports = new VcRealtimeSalesJavaClient()
