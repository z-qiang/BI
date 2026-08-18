const express = require('express')
const router = express.Router()

const healthRoutes = require('./healthRoutes')
const userRoutes = require('./userRoutes')
const vcRealtimeSalesRoutes = require('./vcRealtimeSalesRoutes')

router.use('/health', healthRoutes)
router.use('/users', userRoutes)
router.use('/vc-realtime-sales', vcRealtimeSalesRoutes)

module.exports = router
