import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic' // 禁用缓存

// 获取今天的日期字符串（使用服务器时间）
function getTodayDateString(): string {
  const now = new Date()
  // 转换为中国时区 (UTC+8)
  const chinaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  const year = chinaTime.getUTCFullYear()
  const month = String(chinaTime.getUTCMonth() + 1).padStart(2, '0')
  const day = String(chinaTime.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const openid = searchParams.get('openid')

    // 只返回激活的任务
    const tasks = await prisma.task.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' }
    })

    const user = openid ? await prisma.user.findUnique({ where: { openid } }) : null

    // 使用服务器时间获取今天的日期字符串
    const todayDateStr = getTodayDateString()

    const resTasks = await Promise.all(tasks.map(async (task) => {
      let isCompleted = false
      if (user) {
        // 使用 checkinDate 字段查询（更安全可靠）
        const record = await prisma.record.findUnique({
          where: {
            userId_taskId_checkinDate: {
              userId: user.id,
              taskId: task.id,
              checkinDate: todayDateStr
            }
          }
        })
        isCompleted = !!record
      }
      return { ...task, is_completed: isCompleted }
    }))

    return NextResponse.json({ code: 0, data: resTasks })
  } catch (e) {
    console.error('[Tasks API Error]', e)
    return NextResponse.json({ code: 500, msg: '服务器错误', data: [] })
  }
}

