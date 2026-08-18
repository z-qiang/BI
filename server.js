const app = require('./src/app')
const config = require('./src/config/env')
const vcRealtimeSalesJob = require('./src/jobs/vcRealtimeSalesJob')

const PORT = config.port

// 启动 HTTP 服务
const server = app.listen(PORT, () => {
  console.log(`=================================`)
  console.log(`🚀 ${config.appName} 服务已启动`)
  console.log(`📡 监听端口: http://localhost:${PORT}`)
  console.log(`🔧 运行环境: ${config.nodeEnv}`)
  console.log(`=================================`)
  vcRealtimeSalesJob.start()
})

// 捕获未处理的 Promise 拒绝 (Uncaught Rejections)
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection] 未捕获的 Promise 拒绝:', reason)
})

// 捕获未捕获的未处理异常 (Uncaught Exceptions)
process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception] 未捕获的系统异常:', error)
  process.exit(1)
})

// 生产环境优雅退出 (Graceful Shutdown)
const gracefulShutdown = (signal) => {
  console.log(`\n[System] 收到 ${signal} 信号，开始关闭 HTTP 服务...`)
  vcRealtimeSalesJob.stop()
  server.close(() => {
    console.log('[System] HTTP 服务已平滑关闭')
    process.exit(0)
  })

  // 10 秒超时强制退出
  setTimeout(() => {
    console.error('[System] 强制退出 (超时)')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
