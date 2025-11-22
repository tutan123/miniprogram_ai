import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { openid, taskId } = body

  // 1. 查找用户和任务
  const user = await prisma.user.findUnique({ where: { openid } })
  const task = await prisma.task.findUnique({ where: { id: Number(taskId) } })

  if (!user || !task) {
    return NextResponse.json({ code: 404, msg: 'User or Task not found' })
  }

  // 2. 检查今日打卡 (Prisma 强大之处)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const record = await prisma.record.findFirst({
    where: {
      userId: user.id, // 关联的是 User.id 不是 openid
      taskId: task.id,
      createdAt: {
        gte: today
      }
    }
  })

  if (record) {
    return NextResponse.json({ code: 1, msg: '今日已完成' })
  }

  // 3. 执行打卡事务 (Transaction)
  try {
    await prisma.$transaction([
      prisma.record.create({
        data: {
          userId: user.id,
          taskId: task.id
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { points: { increment: task.reward } }
      })
    ])

    // 获取最新积分
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } })

    return NextResponse.json({ 
      code: 0, 
      msg: '打卡成功', 
      data: { current_points: updatedUser?.points } 
    })
  } catch (e) {
    return NextResponse.json({ code: 500, msg: 'Transaction failed' })
  }
}

