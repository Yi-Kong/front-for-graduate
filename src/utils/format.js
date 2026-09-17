// 通用格式化工具

export function formatDate(input) {
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

export function formatMoney(num, symbol = '¥') {
  const n = Number(num) || 0
  return symbol + n.toFixed(2)
}
