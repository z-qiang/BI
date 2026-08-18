const ExcelJS = require('exceljs')
const crypto = require('crypto')
const path = require('path')

const HEADER_NAMES = {
  asin: 'ASIN',
  parentAsins: '父ASIN',
  title: '标题',
  skus: 'SKU',
  productNames: '品名',
  model: '型号',
  countries: '国家',
  shops: '店铺',
  category: '分类',
  brand: '品牌',
  listingOwner: 'Listing负责人',
  averageSales: '均值',
  subtotalSales: '小计'
}

const cellText = (cell) => {
  if (cell === null || cell === undefined) return null
  if (typeof cell === 'object') {
    if (cell.text !== undefined) return String(cell.text).trim() || null
    if (cell.result !== undefined) return String(cell.result).trim() || null
    if (Array.isArray(cell.richText)) return cell.richText.map(item => item.text).join('').trim() || null
  }
  const text = String(cell).trim()
  return text || null
}

const decimalValue = (value, field, rowNumber) => {
  const text = cellText(value)
  if (text === null || text === '-') return null
  const number = Number(text.replace(/,/g, ''))
  if (!Number.isFinite(number)) {
    throw new Error(`Excel 第 ${rowNumber} 行 ${field} 不是数字: ${text}`)
  }
  return number
}

class VcRealtimeSalesExcelService {
  async parse(filePath, statDate) {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)
    const worksheet = workbook.worksheets[0]
    if (!worksheet) throw new Error('Excel 不包含工作表')

    const headerRowNumber = this.findHeaderRow(worksheet)
    const headerRow = worksheet.getRow(headerRowNumber)
    const headerMap = new Map()
    headerRow.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
      const name = cellText(cell.value)
      if (name) headerMap.set(name, columnNumber)
    })

    for (const required of ['ASIN', '小计', statDate]) {
      if (!headerMap.has(required)) throw new Error(`Excel 缺少必需列: ${required}`)
    }

    const column = (name) => headerMap.get(name)
    const get = (row, name) => {
      const index = column(name)
      return index ? cellText(row.getCell(index).value) : null
    }

    const rows = []
    for (let rowNumber = headerRowNumber + 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
      const row = worksheet.getRow(rowNumber)
      const asin = get(row, 'ASIN')
      if (!asin || asin === '总计') continue
      const rawData = {}
      for (const [name, index] of headerMap.entries()) rawData[name] = cellText(row.getCell(index).value)
      const item = {
        asin,
        parentAsins: get(row, HEADER_NAMES.parentAsins),
        title: get(row, HEADER_NAMES.title),
        skus: get(row, HEADER_NAMES.skus),
        productNames: get(row, HEADER_NAMES.productNames),
        model: get(row, HEADER_NAMES.model),
        countries: get(row, HEADER_NAMES.countries),
        shops: get(row, HEADER_NAMES.shops),
        category: get(row, HEADER_NAMES.category),
        brand: get(row, HEADER_NAMES.brand),
        listingOwner: get(row, HEADER_NAMES.listingOwner),
        averageSales: decimalValue(get(row, HEADER_NAMES.averageSales), '均值', rowNumber),
        subtotalSales: decimalValue(get(row, HEADER_NAMES.subtotalSales), '小计', rowNumber),
        realtimeSales: decimalValue(get(row, statDate), statDate, rowNumber),
        rawData
      }
      item.rowHash = crypto.createHash('sha256')
        .update(JSON.stringify([statDate, asin, item.parentAsins, item.skus, item.countries, item.shops, item.subtotalSales]))
        .digest('hex')
      rows.push(item)
    }
    if (rows.length === 0) throw new Error('Excel 没有可导入的 ASIN 数据')

    const subtotalTotal = rows.reduce((sum, item) => sum + (item.subtotalSales || 0), 0)
    const realtimeTotal = rows.reduce((sum, item) => sum + (item.realtimeSales || 0), 0)
    if (Math.abs(subtotalTotal - realtimeTotal) > 0.0001) {
      throw new Error(`Excel 合计校验失败: 小计=${subtotalTotal}, ${statDate}=${realtimeTotal}`)
    }

    return {
      statDate,
      fileName: path.basename(filePath),
      rows,
      summary: {
        rowCount: rows.length,
        zeroCount: rows.filter(item => item.subtotalSales === 0).length,
        negativeCount: rows.filter(item => item.subtotalSales < 0).length,
        subtotalTotal,
        realtimeTotal
      }
    }
  }

  findHeaderRow(worksheet) {
    const maxRows = Math.min(worksheet.rowCount, 20)
    for (let rowNumber = 1; rowNumber <= maxRows; rowNumber += 1) {
      const values = []
      worksheet.getRow(rowNumber).eachCell({ includeEmpty: true }, cell => values.push(cellText(cell.value)))
      if (values.includes('ASIN') && values.includes('小计')) return rowNumber
    }
    throw new Error('Excel 未找到 ASIN/小计表头')
  }
}

module.exports = new VcRealtimeSalesExcelService()
