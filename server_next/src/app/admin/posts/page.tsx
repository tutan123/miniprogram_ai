import { prisma } from '@/lib/db'
import { DataTable } from '@/components/DataTable'
import { MessageSquare, Trash2, Eye } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

async function deletePost(id: number) {
  "use server"
  await prisma.comment.deleteMany({ where: { postId: id } }) // 先删评论
  await prisma.post.delete({ where: { id } })
  revalidatePath('/admin/posts')
}

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
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

      <DataTable 
        data={posts}
        columns={[
          { header: 'ID', accessorKey: 'id', cell: (p) => <span className="font-mono text-xs text-slate-400">#{p.id}</span> },
          { 
            header: '内容摘要', 
            cell: (p) => (
              <div className="max-w-md">
                <div className="font-medium text-slate-900 truncate">{p.title}</div>
                <p className="text-xs text-slate-500 truncate">{p.content}</p>
                {p.images && <span className="text-xs bg-slate-100 px-1 rounded mt-1 inline-block">含图片</span>}
              </div>
            ) 
          },
          { header: '作者', cell: (p) => <div className="flex items-center gap-2"><img src={p.user.avatarUrl || ''} className="w-6 h-6 rounded-full bg-slate-200" /><span className="text-sm">{p.user.nickname}</span></div> },
          { header: '热度', cell: (p) => <div className="flex gap-3 text-xs text-slate-500"><span>❤️ {p.likes}</span><span>💬 {p._count.comments}</span></div> },
          { header: '发布时间', cell: (p) => new Date(p.createdAt).toLocaleString() },
          { 
            header: '操作', 
            cell: (p) => (
              <div className="flex gap-3">
                <form action={deletePost.bind(null, p.id)}>
                  <button className="text-red-600 hover:text-red-800 flex items-center gap-1 text-xs">
                    <Trash2 size={14} /> 删除
                  </button>
                </form>
              </div>
            ) 
          }
        ]}
      />
    </div>
  )
}

