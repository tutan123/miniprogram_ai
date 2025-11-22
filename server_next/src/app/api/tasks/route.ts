import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic' // 禁用缓存

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const openid = searchParams.get('openid')

  const tasks = await prisma.task.findMany()
  const user = await prisma.user.findUnique({ where: { openid: openid || '' } })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const resTasks = await Promise.all(tasks.map(async (task) => {
    let isCompleted = false
    if (user) {
      const record = await prisma.record.findFirst({
        where: {
          userId: user.id,
          taskId: task.id,
          createdAt: { gte: today }
        }
      })
      isCompleted = !!record
    }
    return { ...task, is_completed: isCompleted }
  }))

  return NextResponse.json({ code: 0, data: resTasks })
}

