import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

// 频率限制（防止快速重复兑换）
const exchangeRateLimitCache = new Map<string, { count: number; resetTime: number }>()
const EXCHANGE_RATE_LIMIT_WINDOW = 10 * 1000 // 10秒
const EXCHANGE_RATE_LIMIT_MAX = 3 // 10秒内最多3次

function checkExchangeRateLimit(openid: string): boolean {
  const now = Date.now()
  const key = `exchange_${openid}`
  const limit = exchangeRateLimitCache.get(key)

  if (!limit || now > limit.resetTime) {
    exchangeRateLimitCache.set(key, { count: 1, resetTime: now + EXCHANGE_RATE_LIMIT_WINDOW })
    return true
  }

  if (limit.count >= EXCHANGE_RATE_LIMIT_MAX) {
    return false
  }

  limit.count++
  return true
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { openid, productId } = body

    // 0. 参数验证
    if (!openid || !productId) {
      return NextResponse.json({ code: 400, msg: '参数错误' })
    }

    // 1. 频率限制
    if (!checkExchangeRateLimit(openid)) {
      return NextResponse.json({ code: 429, msg: '操作过于频繁，请稍后再试' })
    }

    // 2. 查找用户和商品
    const user = await prisma.user.findUnique({ where: { openid } })
    const product = await prisma.product.findUnique({ where: { id: Number(productId) } })

    if (!user || !product) {
      return NextResponse.json({ code: 404, msg: '用户或商品不存在' })
    }

    // 3. 验证商品状态（关键：防止兑换已下架商品）
    if (product.status !== 'active') {
      return NextResponse.json({ code: 1, msg: '该商品已下架，无法兑换' })
    }

    // 4. 校验地址
    if (!user.address || !user.phone || !user.realName) {
      return NextResponse.json({ code: 400, msg: '请先完善收货地址' })
    }

    // 5. 验证积分和库存（在事务外先检查，避免不必要的数据库操作）
    if (user.points < product.price) {
      return NextResponse.json({ code: 1, msg: '积分不足' })
    }
    
    if (product.stock <= 0) {
      return NextResponse.json({ code: 1, msg: '库存不足' })
    }

    // 6. 验证价格合理性（防止恶意商品配置）
    if (product.price < 0 || product.price > 10000) {
      console.error(`[Security] 异常的商品价格: ${product.price} for product ${product.id}`)
      return NextResponse.json({ code: 500, msg: '商品配置异常，请联系管理员' })
    }

    // 7. 执行兑换事务（使用数据库锁防止并发）
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 重新查询最新数据（防止并发问题）
        const latestUser = await tx.user.findUnique({ where: { id: user.id } })
        const latestProduct = await tx.product.findUnique({ where: { id: product.id } })

        if (!latestUser || !latestProduct) {
          throw new Error('用户或商品不存在')
        }

        // 再次验证（防止并发时数据已变化）
        if (latestProduct.status !== 'active') {
          throw new Error('商品已下架')
        }

        if (latestUser.points < latestProduct.price) {
          throw new Error('积分不足')
        }

        if (latestProduct.stock <= 0) {
          throw new Error('库存不足')
        }

        // 更新用户积分
        const updatedUser = await tx.user.update({
          where: { id: latestUser.id },
          data: { 
            points: { decrement: latestProduct.price }
          }
        })

        // 确保积分不为负
        if (updatedUser.points < 0) {
          throw new Error('积分不足')
        }

        // 更新商品库存
        await tx.product.update({
          where: { id: latestProduct.id },
          data: { stock: { decrement: 1 } }
        })

        // 创建订单（快照当前商品信息和用户地址）
        const order = await tx.order.create({
          data: {
            userId: latestUser.id,
            productId: latestProduct.id,
            points: latestProduct.price,
            status: 'pending',
            snapshotAddress: `${latestUser.realName} ${latestUser.phone} ${latestUser.address}`
          }
        })

        return { user: updatedUser, order }
      })

      return NextResponse.json({ 
        code: 0, 
        msg: '兑换成功', 
        data: { current_points: result.user.points } 
      })
    } catch (e: any) {
      console.error('[Exchange Error]', e)
      
      // 处理特定错误
      if (e.message === '积分不足' || e.message === '库存不足' || e.message === '商品已下架') {
        return NextResponse.json({ code: 1, msg: e.message })
      }

      return NextResponse.json({ code: 500, msg: '兑换失败，请重试' })
    }
  } catch (e: any) {
    console.error('[Exchange API Error]', e)
    return NextResponse.json({ code: 500, msg: '服务器错误' })
  }
}
