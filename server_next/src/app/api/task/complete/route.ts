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

// 简单的频率限制（内存缓存，生产环境建议使用 Redis）
const rateLimitCache = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1分钟
const RATE_LIMIT_MAX = 10 // 每分钟最多10次请求

function checkRateLimit(openid: string): boolean {
  const now = Date.now()
  const key = `checkin_${openid}`
  const limit = rateLimitCache.get(key)

  if (!limit || now > limit.resetTime) {
    rateLimitCache.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return false
  }

  limit.count++
  return true
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { openid, taskId, lat, lng } = body

    // 0. 参数验证
    if (!openid || !taskId) {
      return NextResponse.json({ code: 400, msg: '参数错误' })
    }

    // 1. 频率限制
    if (!checkRateLimit(openid)) {
      return NextResponse.json({ code: 429, msg: '请求过于频繁，请稍后再试' })
    }

    // 2. 查找用户和任务
    const user = await prisma.user.findUnique({ where: { openid } })
    const task = await prisma.task.findUnique({ where: { id: Number(taskId) } })

    if (!user || !task) {
      return NextResponse.json({ code: 404, msg: '用户或任务不存在' })
    }

    // 3. 验证任务是否激活
    if (!task.isActive) {
      return NextResponse.json({ code: 1, msg: '该任务已暂停' })
    }

    // 4. 校验地理位置（使用服务器时间验证）
    if (task.target_lat && task.target_lng && lat && lng) {
      // 验证坐标范围（防止传入无效坐标）
      if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return NextResponse.json({ code: 400, msg: '坐标无效' })
      }

      const distance = getDistance(lat, lng, task.target_lat, task.target_lng)
      console.log(`[Checkin] Task: ${task.title}, Dist: ${distance}m, Limit: ${task.radius}m`)
      
      if (distance > task.radius) {
        return NextResponse.json({ 
          code: 1, 
          msg: `距离目标还有 ${Math.round(distance - task.radius)} 米，请走到目标点打卡` 
        })
      }
    } else if (task.target_lat && task.target_lng) {
      // 如果任务需要位置但未提供，拒绝请求
      return NextResponse.json({ code: 400, msg: '该任务需要定位，请允许位置权限' })
    }

    // 5. 使用服务器时间检查今日打卡（关键安全点）
    const todayDateStr = getTodayDateString()
    
    // 检查是否已打卡（使用唯一约束的字段）
    const existingRecord = await prisma.record.findUnique({
      where: {
        userId_taskId_checkinDate: {
          userId: user.id,
          taskId: task.id,
          checkinDate: todayDateStr
        }
      }
    })

    if (existingRecord) {
      return NextResponse.json({ code: 1, msg: '今日已完成打卡' })
    }

    // 6. 验证积分奖励值（防止恶意任务配置）
    if (task.reward < 0 || task.reward > 1000) {
      console.error(`[Security] 异常的积分奖励值: ${task.reward} for task ${task.id}`)
      return NextResponse.json({ code: 500, msg: '任务配置异常，请联系管理员' })
    }

    // 7. 执行打卡事务（使用唯一约束防止并发重复打卡）
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 创建打卡记录（唯一约束会自动防止重复）
        const record = await tx.record.create({
          data: {
            userId: user.id,
            taskId: task.id,
            checkinDate: todayDateStr  // 使用服务器日期
          }
        })

        // 更新用户积分（确保不为负）
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: { 
            points: {
              increment: task.reward
            }
          }
        })

        // 确保积分不为负（额外校验）
        if (updatedUser.points < 0) {
          throw new Error('积分不能为负数')
        }

        return { record, user: updatedUser }
      })

      return NextResponse.json({ 
        code: 0, 
        msg: '打卡成功', 
        data: { current_points: result.user.points } 
      })
    } catch (e: any) {
      // 如果是唯一约束冲突，说明已经打卡过了
      if (e.code === 'P2002' || e.message?.includes('Unique constraint')) {
        return NextResponse.json({ code: 1, msg: '今日已完成打卡' })
      }
      console.error('[Checkin Error]', e)
      return NextResponse.json({ code: 500, msg: '打卡失败，请重试' })
    }
  } catch (e: any) {
    console.error('[Checkin API Error]', e)
    return NextResponse.json({ code: 500, msg: '服务器错误' })
  }
}
