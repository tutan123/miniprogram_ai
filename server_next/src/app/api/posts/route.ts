import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { nickname: true, avatarUrl: true }
      },
      _count: {
        select: { comments: true }
      }
    }
  })

  // 格式化数据给前端
  const formattedPosts = posts.map(p => ({
    id: p.id,
    title: p.title,
    content: p.content,
    images: p.images ? JSON.parse(p.images) : [],
    likes: p.likes,
    comments_count: p._count.comments,
    nickname: p.user.nickname,
    avatar_url: p.user.avatarUrl,
    created_at: p.createdAt.toISOString().split('T')[0]
  }))

  return NextResponse.json({ code: 0, data: formattedPosts })
}

