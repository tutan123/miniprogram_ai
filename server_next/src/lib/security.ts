// 安全工具函数

// 获取今天的日期字符串（使用服务器时间，中国时区 UTC+8）
export function getTodayDateString(): string {
  const now = new Date()
  // 转换为中国时区 (UTC+8)
  const chinaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  const year = chinaTime.getUTCFullYear()
  const month = String(chinaTime.getUTCMonth() + 1).padStart(2, '0')
  const day = String(chinaTime.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 验证坐标范围
export function validateCoordinates(lat: number, lng: number): boolean {
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180
}

// 验证积分值合理性
export function validatePointsValue(points: number): boolean {
  return points >= 0 && points <= 10000
}

