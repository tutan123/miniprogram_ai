import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const openid = searchParams.get('openid')

  const user = await prisma.user.findUnique({ where: { openid: openid || '' } })
  if (!user) return NextResponse.json({ code: 404 })

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { product: true }
  })

  const formatted = orders.map(o => ({
    id: o.id,
    product_name: o.product.name,
    product_image: o.product.image,
    points: o.points,
    status: o.status, // pending, shipped
    created_at: o.createdAt.toLocaleString(),
    address: o.snapshotAddress
  }))

  return NextResponse.json({ code: 0, data: formatted })
}

