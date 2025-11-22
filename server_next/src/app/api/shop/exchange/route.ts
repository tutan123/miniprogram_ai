import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { openid, productId } = body

  const user = await prisma.user.findUnique({ where: { openid } })
  const product = await prisma.product.findUnique({ where: { id: Number(productId) } })

  if (!user || !product) return NextResponse.json({ code: 404 })
  if (user.points < product.price) return NextResponse.json({ code: 1, msg: '积分不足' })
  if (product.stock <= 0) return NextResponse.json({ code: 1, msg: '库存不足' })

  try {
    await prisma.$transaction([
      // 1. 扣积分
      prisma.user.update({
        where: { id: user.id },
        data: { points: { decrement: product.price } }
      }),
      // 2. 扣库存
      prisma.product.update({
        where: { id: product.id },
        data: { stock: { decrement: 1 } }
      }),
      // 3. 生成订单
      prisma.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          points: product.price,
          status: 'pending'
        }
      })
    ])

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } })
    return NextResponse.json({ code: 0, msg: '兑换成功', data: { current_points: updatedUser?.points } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ code: 500, msg: '兑换失败' })
  }
}
