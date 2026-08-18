const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const boolValue = (value, defaultValue) => {
  if (value === undefined || value === '') return defaultValue
  return String(value).toLowerCase() === 'true'
}

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'Express Starter API',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  internalApiToken: process.env.INTERNAL_API_TOKEN || '',
  lingxing: {
    username: process.env.LINGXING_USERNAME || '',
    password: process.env.LINGXING_PASSWORD || '',
    loginUrl: process.env.LINGXING_LOGIN_URL || 'https://erp.lingxing.com/login',
    vcSalesUrl: process.env.LINGXING_VC_SALES_URL || 'https://erp.lingxing.com/erp/mreport/vcSalesStat',
    headless: boolValue(process.env.LINGXING_HEADLESS, true),
    browserExecutablePath: process.env.LINGXING_BROWSER_EXECUTABLE_PATH || '',
    storageStatePath: path.resolve(process.cwd(), process.env.LINGXING_STORAGE_STATE_PATH || './runtime/lingxing-storage-state.json'),
    downloadDir: path.resolve(process.cwd(), process.env.LINGXING_DOWNLOAD_DIR || './runtime/downloads'),
    globalAggregation: boolValue(process.env.LINGXING_EXPORT_GLOBAL_AGGREGATION, false)
  },
  javaApi: {
    baseUrl: process.env.JAVA_API_BASE_URL || 'http://127.0.0.1:8080',
    internalToken: process.env.JAVA_API_INTERNAL_TOKEN || '',
    timeoutMs: Number(process.env.JAVA_API_TIMEOUT_MS || 300000)
  },
  vcRealtimeCron: {
    enabled: boolValue(process.env.VC_REALTIME_CRON_ENABLED, false),
    expression: process.env.VC_REALTIME_CRON_EXPRESSION || '10 16 * * *',
    timezone: process.env.VC_REALTIME_CRON_TIMEZONE || 'Asia/Shanghai'
  }
}
