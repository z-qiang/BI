const exporter = require('./vcRealtimeSalesExporter')
const excelService = require('./vcRealtimeSalesExcelService')
const javaClient = require('./vcRealtimeSalesJavaClient')

class VcRealtimeSalesService {
  constructor() {
    this.runningDates = new Set()
  }

  async sync(statDate) {
    if (this.runningDates.has(statDate)) {
      const error = new Error(`${statDate} 的 VC 实时销量任务正在执行`)
      error.statusCode = 409
      throw error
    }
    this.runningDates.add(statDate)
    try {
      const filePath = await exporter.export(statDate)
      const parsed = await excelService.parse(filePath, statDate)
      const imported = await javaClient.importData(parsed)
      return { ...parsed.summary, ...imported, sourceFileName: parsed.fileName }
    } finally {
      this.runningDates.delete(statDate)
    }
  }
}

module.exports = new VcRealtimeSalesService()
