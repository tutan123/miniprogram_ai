import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { openid, postId } = body

  const user = await prisma.user.findUnique({ where: { openid } })
  if (!user) return NextResponse.json({ code: 404 })

  const pId = Number(postId)

  // 检查是否已赞
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: user.id,
        postId: pId
      }
    }
  })

  try {
    if (existingLike) {
      // 取消赞
      await prisma.$transaction([
        prisma.like.delete({ where: { id: existingLike.id } }),
        prisma.post.update({
          where: { id: pId },
          data: { likes: { decrement: 1 } }
        })
      ])
      return NextResponse.json({ code: 0, data: { isLiked: false } })
    } else {
      // 点赞
      await prisma.$transaction([
        prisma.like.create({
          data: { userId: user.id, postId: pId }
        }),
        prisma.post.update({
          where: { id: pId },
          data: { likes: { increment: 1 } }
        })
      ])
      return NextResponse.json({ code: 0, data: { isLiked: true } })
    }
  } catch (e) {
    return NextResponse.json({ code: 500 })
  }
}


