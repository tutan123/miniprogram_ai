import { prisma } from '@/lib/db'
import PostsTable from './_components/PostsTable'

export const dynamic = 'force-dynamic'

export default async function PostsPage({ searchParams }: { searchParams: { q?: string } }) {
  const where = searchParams.q ? {
    OR: [
      { title: { contains: searchParams.q } },
      { content: { contains: searchParams.q } }
    ]
  } : {}

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { user: true, _count: { select: { comments: true } } }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">社区管理</h1>
          <p className="text-slate-500 mt-1">管理用户发布的帖子内容</p>
        </div>
      </div>
      <PostsTable data={posts} />
    </div>
  )
}
