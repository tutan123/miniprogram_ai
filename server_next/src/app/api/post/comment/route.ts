import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { openid, postId, content } = body

  const user = await prisma.user.findUnique({ where: { openid } })
  if (!user) return NextResponse.json({ code: 404 })

  await prisma.comment.create({
    data: {
      userId: user.id,
      postId: Number(postId),
      content
    }
  })

  return NextResponse.json({ code: 0, msg: '评论成功' })
}

