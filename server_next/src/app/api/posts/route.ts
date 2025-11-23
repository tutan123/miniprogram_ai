import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const openid = searchParams.get('openid')

    // 1. 先获取当前用户 ID (如果已登录)
    let userId = undefined
    if (openid) {
      const u = await prisma.user.findUnique({ where: { openid } })
      if (u) userId = u.id
    }

    // 2. 查询帖子
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { nickname: true, avatarUrl: true }
        },
        _count: {
          select: { comments: true }
        },
        // 只有当 userId 存在时才查询点赞状态
        userLikes: userId ? {
          where: { userId: userId }
        } : false
      }
    })

    // 3. 格式化返回
    const formattedPosts = posts.map(p => ({
      id: p.id,
      title: p.title,
      content: p.content,
      // 安全解析图片 JSON
      images: p.images ? JSON.parse(p.images) : [],
      likes: p.likes,
      comments_count: p._count.comments,
      nickname: p.user?.nickname || '未知用户',
      avatar_url: p.user?.avatarUrl || '',
      created_at: p.createdAt.toISOString().split('T')[0],
      // userLikes 存在且长度 > 0 表示已赞
      is_liked: userId && p.userLikes ? p.userLikes.length > 0 : false
    }))

    return NextResponse.json({ code: 0, data: formattedPosts })
  } catch (e) {
    console.error('[API Error] /api/posts:', e)
    return NextResponse.json({ code: 500, msg: 'Internal Server Error' })
  }
}
