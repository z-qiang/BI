const { chromium } = require('playwright')
const fs = require('fs/promises')
const path = require('path')
const config = require('../config/env')
const { yesterday } = require('../utils/date')

class VcRealtimeSalesExporter {
  async export(statDate) {
    this.ensureConfig()
    await fs.mkdir(config.lingxing.downloadDir, { recursive: true })
    await fs.mkdir(path.dirname(config.lingxing.storageStatePath), { recursive: true })
    const launchOptions = { headless: config.lingxing.headless }
    if (config.lingxing.browserExecutablePath) launchOptions.executablePath = config.lingxing.browserExecutablePath
    const browser = await chromium.launch(launchOptions)
    let page
    try {
      const hasState = await fs.access(config.lingxing.storageStatePath).then(() => true).catch(() => false)
      const context = await browser.newContext({
        acceptDownloads: true,
        storageState: hasState ? config.lingxing.storageStatePath : undefined
      })
      page = await context.newPage()
      await page.goto(config.lingxing.vcSalesUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await this.loginIfNeeded(page)
      await page.goto(config.lingxing.vcSalesUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.getByRole('tab', { name: 'ASIN', exact: true }).click()
      await page.getByRole('radio', { name: '实时销量', exact: true }).check()
      await this.selectDate(page, statDate)
      await page.waitForTimeout(2000)
      await this.openExportDialog(page)
      await this.configureAggregation(page)

      const downloadPromise = page.waitForEvent('download', { timeout: 180000 })
      const dialog = page.getByRole('dialog').last()
      const confirm = dialog.getByRole('button', { name: /导出|确定/ }).last()
      await confirm.click()
      const download = await downloadPromise
      const suggested = download.suggestedFilename()
      const filePath = path.join(config.lingxing.downloadDir, `${statDate}-${Date.now()}-${suggested}`)
      await download.saveAs(filePath)
      await context.storageState({ path: config.lingxing.storageStatePath })
      return filePath
    } catch (error) {
      if (page) {
        const errorPath = path.join(config.lingxing.downloadDir, `error-${statDate}-${Date.now()}.png`)
        await page.screenshot({ path: errorPath, fullPage: true }).catch(() => {})
        error.message = `${error.message}; 错误截图: ${errorPath}`
      }
      throw error
    } finally {
      await browser.close()
    }
  }

  ensureConfig() {
    if (!config.lingxing.username || !config.lingxing.password) {
      throw new Error('LINGXING_USERNAME/LINGXING_PASSWORD 未配置')
    }
  }

  async loginIfNeeded(page) {
    if (!page.url().includes('/login')) return
    await page.locator('input[type="text"]').first().fill(config.lingxing.username)
    await page.locator('input[type="password"]').first().fill(config.lingxing.password)
    await page.getByRole('button', { name: /登录/ }).click()
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 60000 })
    const skip = page.getByRole('button', { name: /暂不设置|跳过/ })
    if (await skip.count()) await skip.first().click()
  }

  async selectDate(page, statDate) {
    const start = page.getByPlaceholder('开始日期')
    const end = page.getByPlaceholder('结束日期')
    if (statDate === yesterday()) {
      await start.click()
      await page.getByRole('button', { name: '昨天', exact: true }).click()
      return
    }
    await start.fill(statDate)
    await end.fill(statDate)
    await end.press('Enter')
  }

  async openExportDialog(page) {
    const selectors = [
      'button[title*="导出"]',
      'button:has([class*="export"])',
      'button:has([class*="download"])',
      '[data-testid="export"]'
    ]
    for (const selector of selectors) {
      const locator = page.locator(selector)
      if (await locator.count() && await locator.first().isVisible()) {
        await locator.first().click()
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 10000 })
        return
      }
    }
    const iconButton = page.getByRole('button', { name: '', exact: true })
    if (await iconButton.count()) {
      await iconButton.first().click()
      await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 10000 })
      return
    }
    const textButton = page.getByRole('button', { name: /导出/ })
    if (await textButton.count()) {
      await textButton.first().click()
      await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 10000 })
      return
    }
    throw new Error('未找到领星导出按钮，请根据错误截图更新选择器')
  }

  async configureAggregation(page) {
    let globalAggregation = page.getByLabel('全局聚合')
    if (!await globalAggregation.count()) {
      globalAggregation = page.locator('label').filter({ hasText: '全局聚合' }).locator('input[type="checkbox"]')
    }
    if (!await globalAggregation.count()) {
      if (!config.lingxing.globalAggregation) throw new Error('导出窗口未找到“全局聚合”选项，拒绝导出无法按站点过滤的数据')
      return
    }
    if (config.lingxing.globalAggregation) await globalAggregation.check()
    else await globalAggregation.uncheck({ force: true })
  }
}

module.exports = new VcRealtimeSalesExporter()
