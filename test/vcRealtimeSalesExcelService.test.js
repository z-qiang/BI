const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs/promises')
const os = require('os')
const path = require('path')
const ExcelJS = require('exceljs')
const excelService = require('../src/services/vcRealtimeSalesExcelService')

test('完整保留 0 和负数并校验小计', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'vc-sales-'))
  const filePath = path.join(tempDir, 'sample.xlsx')
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('销量')
  sheet.addRow(['ASIN', '父ASIN', 'SKU', '型号', '国家', '店铺', '品牌', '均值', '小计', '2026-08-17'])
  sheet.addRow(['A1', 'P1', 'S1', 'M1', '德国', 'SHOP-DE', 'Proscenic', 10, 10, 10])
  sheet.addRow(['A2', 'P2', 'S2', 'M2', '英国', 'SHOP-UK', 'Vactidy', 0, 0, 0])
  sheet.addRow(['A3', 'P3', 'S3', 'M3', '意大利', 'SHOP-IT', 'Proscenic', -2, -2, -2])
  await workbook.xlsx.writeFile(filePath)
  try {
    const parsed = await excelService.parse(filePath, '2026-08-17')
    assert.equal(parsed.summary.rowCount, 3)
    assert.equal(parsed.summary.zeroCount, 1)
    assert.equal(parsed.summary.negativeCount, 1)
    assert.equal(parsed.summary.subtotalTotal, 8)
    assert.deepEqual(parsed.rows.map(item => item.subtotalSales), [10, 0, -2])
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
})
