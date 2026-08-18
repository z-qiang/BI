const ApiResponse = require('../utils/apiResponse')
const service = require('../services/vcRealtimeSalesService')
const { normalizeDate } = require('../utils/date')

class VcRealtimeSalesController {
  sync = async (req, res) => {
    const statDate = normalizeDate(req.body.date)
    const result = await service.sync(statDate)
    return ApiResponse.success(res, result, 'VC 实时销量 Excel 同步完成')
  }
}

module.exports = new VcRealtimeSalesController()
