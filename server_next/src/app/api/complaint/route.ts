import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { openid, type, content, contact } = body

  const user = await prisma.user.findUnique({ where: { openid } })
  if (!user) return NextResponse.json({ code: 404, msg: 'User not found' })

  try {
    await prisma.complaint.create({
      data: {
        userId: user.id,
        type,
        content,
        contact
      }
    })
    return NextResponse.json({ code: 0, msg: '提交成功' })
  } catch (e) {
    return NextResponse.json({ code: 500, msg: '提交失败' })
  }
}

