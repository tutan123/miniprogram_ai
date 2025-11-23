import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // 只返回上架的商品（小程序端）
  const products = await prisma.product.findMany({
    where: { status: 'active' },
    orderBy: { id: 'desc' }
  })
  return NextResponse.json({ code: 0, data: products })
}

