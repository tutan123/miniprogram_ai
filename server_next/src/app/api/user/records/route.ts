import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const openid = searchParams.get('openid')

  const user = await prisma.user.findUnique({ where: { openid: openid || '' } })
  if (!user) return NextResponse.json({ code: 404 })

  const records = await prisma.record.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { task: true }
  })

  const formatted = records.map(r => ({
    id: r.id,
    task: { title: r.task.title, reward: r.task.reward },
    created_at: r.createdAt.toLocaleString()
  }))

  return NextResponse.json({ code: 0, data: formatted })
}

