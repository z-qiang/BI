const express = require('express')
const controller = require('../controllers/vcRealtimeSalesController')
const asyncHandler = require('../middlewares/asyncHandler')
const internalAuth = require('../middlewares/internalAuth')

const router = express.Router()

router.post('/sync', internalAuth, asyncHandler(controller.sync))

module.exports = router
