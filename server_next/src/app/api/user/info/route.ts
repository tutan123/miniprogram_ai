import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const openid = searchParams.get('openid')

  const user = await prisma.user.findUnique({ where: { openid: openid || '' } })
  
  if (user) {
    return NextResponse.json({ code: 0, data: user })
  } else {
    return NextResponse.json({ code: 404, msg: 'User not found' })
  }
}

