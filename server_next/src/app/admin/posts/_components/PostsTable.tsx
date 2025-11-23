'use client'

import { DataTable } from '@/components/DataTable'
import { Trash2, Pencil } from 'lucide-react'
import Link from 'next/link'
import { deletePost } from '@/app/actions/post' // 注意：这里不能直接引入 Server Action 如果它没导出，或者需要 bind

export default function PostsTable({ data }: { data: any[] }) {
  const columns = [
    { header: 'ID', accessorKey: 'id', cell: (p: any) => <span className="font-mono text-xs text-slate-400">#{p.id}</span> },
    { 
      header: '内容摘要', 
      cell: (p: any) => (
        <div className="max-w-md">
          <div className="font-medium text-slate-900 truncate">{p.title}</div>
          <p className="text-xs text-slate-500 truncate">{p.content}</p>
          {p.images && p.images !== '[]' && <span className="text-xs bg-slate-100 px-1 rounded mt-1 inline-block">含图片</span>}
        </div>
      ) 
    },
    { header: '作者', cell: (p: any) => <div className="flex items-center gap-2"><img src={p.user.avatarUrl || ''} className="w-6 h-6 rounded-full bg-slate-200" /><span className="text-sm">{p.user.nickname}</span></div> },
    { header: '热度', cell: (p: any) => <div className="flex gap-3 text-xs text-slate-500"><span>❤️ {p.likes}</span><span>💬 {p._count.comments}</span></div> },
    { header: '发布时间', cell: (p: any) => new Date(p.createdAt).toLocaleString() },
    { 
      header: '操作', 
      cell: (p: any) => (
        <div className="flex gap-3">
          <Link href={`/admin/posts/${p.id}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs">
            <Pencil size={14} /> 编辑
          </Link>
          <button onClick={() => deletePost(p.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1 text-xs">
            <Trash2 size={14} /> 删除
          </button>
        </div>
      ) 
    }
  ]

  return <DataTable searchPlaceholder="搜索帖子标题或内容..." data={data} columns={columns as any} />
}

