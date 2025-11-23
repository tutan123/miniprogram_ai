import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

// 计算两点距离 (单位: 米)
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const radLat1 = (lat1 * Math.PI) / 180.0
  const radLat2 = (lat2 * Math.PI) / 180.0
  const a = radLat1 - radLat2
  const b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0
  let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
  s = s * 6378.137 // 地球半径
  s = Math.round(s * 10000) / 10 // 转为米
  return s
}

export async function POST(request: Request) {
  const body = await request.json()
  const { openid, taskId, lat, lng } = body

  // 1. 查找用户和任务
  const user = await prisma.user.findUnique({ where: { openid } })
  const task = await prisma.task.findUnique({ where: { id: Number(taskId) } })

  if (!user || !task) {
    return NextResponse.json({ code: 404, msg: 'User or Task not found' })
  }

  // 2. [新增] 校验地理位置
  // 只有当任务配置了目标坐标，且前端传了当前坐标时才校验
  if (task.target_lat && task.target_lng && lat && lng) {
    const distance = getDistance(lat, lng, task.target_lat, task.target_lng)
    console.log(`[Checkin] Task: ${task.title}, Dist: ${distance}m, Limit: ${task.radius}m`)
    
    if (distance > task.radius) {
      return NextResponse.json({ 
        code: 1, 
        msg: `距离目标还有 ${Math.round(distance - task.radius)} 米，请走到目标点打卡` 
      })
    }
  }

  // 3. 检查今日打卡
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const record = await prisma.record.findFirst({
    where: {
      userId: user.id,
      taskId: task.id,
      createdAt: { gte: today }
    }
  })

  if (record) {
    return NextResponse.json({ code: 1, msg: '今日已完成' })
  }

  // 4. 执行打卡事务
  try {
    await prisma.$transaction([
      prisma.record.create({
        data: { userId: user.id, taskId: task.id }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { points: { increment: task.reward } }
      })
    ])

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
