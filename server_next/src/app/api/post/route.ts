import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { openid, title, content, images } = body

  // 1. 校验用户
  const user = await prisma.user.findUnique({ where: { openid } })
  if (!user) return NextResponse.json({ code: 404, msg: 'User not found' })

  // 2. 校验内容限制
  if (!content || content.length > 500) {
    return NextResponse.json({ code: 400, msg: '内容长度限制在 500 字以内' })
  }

  // 3. 校验图片数量
  if (images && images.length > 1) {
    return NextResponse.json({ code: 400, msg: '最多只能上传 1 张图片' })
  }

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
    console.error(e)
    return NextResponse.json({ code: 500 })
  }
}
