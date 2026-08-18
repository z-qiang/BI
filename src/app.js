const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const config = require('./config/env')

const apiRoutes = require('./routes')
const notFound = require('./middlewares/notFound')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

// 1. 安全与 HTTP 请求头防护
app.use(helmet())

// 2. 跨域资源共享配置
app.use(cors({ origin: config.corsOrigin }))

// 3. HTTP 请求日志
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'))
}

// 4. 请求体解析 (JSON & URL-Encoded)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 5. 根路由欢迎提示
app.get('/', (req, res) => {
  res.json({
    name: config.appName,
    status: 'Running',
    docs: '/api/health'
  })
})

// 6. 注册 API 路由挂载点 `/api`
app.use('/api', apiRoutes)

// 7. 404 处理与全局异常捕捉中间件
app.use(notFound)
app.use(errorHandler)

module.exports = app
