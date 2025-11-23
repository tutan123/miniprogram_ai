'use client'

import { DataTable } from '@/components/DataTable'

export default function UsersTable({ data }: { data: any[] }) {
  const columns = [
    { 
      header: '头像', 
      cell: (u: any) => u.avatarUrl ? <img src={u.avatarUrl} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">无</div>
    },
    { header: '昵称', accessorKey: 'nickname' },
    { header: '当前积分', accessorKey: 'points', cell: (u: any) => <span className="font-mono font-bold text-blue-600">{u.points}</span> },
    { header: '等级', accessorKey: 'level', cell: (u: any) => <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">Lv.{u.level}</span> },
    { header: '注册时间', cell: (u: any) => new Date(u.createdAt).toLocaleDateString() },
    { 
      header: '操作', 
      cell: (u: any) => <button className="text-blue-600 hover:underline text-xs">查看详情</button> 
    }
  ]

  return <DataTable searchPlaceholder="搜索昵称或 OpenID..." data={data} columns={columns as any} />
}

