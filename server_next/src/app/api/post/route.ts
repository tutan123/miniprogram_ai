import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { openid, title, content, images } = body

  const user = await prisma.user.findUnique({ where: { openid } })
  if (!user) return NextResponse.json({ code: 404 })

  try {
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        title,
        content,
        images: JSON.stringify(images || [])
      }
    })
    return NextResponse.json({ code: 0, data: post })
  } catch (e) {
    return NextResponse.json({ code: 500 })
  }
}

