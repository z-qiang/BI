const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const formatLocalDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const yesterday = () => {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return formatLocalDate(date)
}

const normalizeDate = (value) => {
  const date = value || yesterday()
  if (!DATE_PATTERN.test(date)) {
    const error = new Error('date 必须使用 yyyy-MM-dd 格式')
    error.statusCode = 400
    throw error
  }
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime()) || formatLocalDate(parsed) !== date) {
    const error = new Error('date 不是有效日期')
    error.statusCode = 400
    throw error
  }
  return date
}

module.exports = { normalizeDate, yesterday }
