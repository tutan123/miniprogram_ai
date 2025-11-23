import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      user: { select: { nickname: true, avatarUrl: true } },
      comments: {
        include: { user: { select: { nickname: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' }
      },
      _count: { select: { comments: true } }
    }
  })

  if (!post) return NextResponse.json({ code: 404, msg: 'Post not found' })

  const data = {
    id: post.id,
    title: post.title,
    content: post.content,
    images: post.images ? JSON.parse(post.images) : [],
    likes: post.likes,
    created_at: post.createdAt.toLocaleString(),
    user: post.user,
    comments: post.comments.map(c => ({
      id: c.id,
      content: c.content,
      created_at: c.createdAt.toLocaleString(),
      user: c.user
    }))
  }

  return NextResponse.json({ code: 0, data })
}


