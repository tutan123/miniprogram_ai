import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const products = await prisma.product.findMany()
  return NextResponse.json({ code: 0, data: products })
}

