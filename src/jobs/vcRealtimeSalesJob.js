const cron = require('node-cron')
const config = require('../config/env')
const service = require('../services/vcRealtimeSalesService')
const { yesterday } = require('../utils/date')

let task

const start = () => {
  if (!config.vcRealtimeCron.enabled || task) return task
  if (!cron.validate(config.vcRealtimeCron.expression)) {
    throw new Error(`VC_REALTIME_CRON_EXPRESSION 无效: ${config.vcRealtimeCron.expression}`)
  }
  task = cron.schedule(config.vcRealtimeCron.expression, async () => {
    const statDate = yesterday()
    try {
      const result = await service.sync(statDate)
      console.log('[VC realtime sales] scheduled sync completed', { statDate, result })
    } catch (error) {
      console.error('[VC realtime sales] scheduled sync failed', { statDate, error })
    }
  }, { timezone: config.vcRealtimeCron.timezone })
  return task
}

const stop = () => {
  if (task) task.stop()
  task = null
}

module.exports = { start, stop }
