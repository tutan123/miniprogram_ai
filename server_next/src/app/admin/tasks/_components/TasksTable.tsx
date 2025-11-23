'use client'

import { DataTable } from '@/components/DataTable'
import { Settings } from 'lucide-react'
import Link from 'next/link'

export default function TasksTable({ data }: { data: any[] }) {
  const columns = [
    { header: 'ID', accessorKey: 'id' },
    { header: '任务标题', accessorKey: 'title', cell: (t: any) => <span className="font-medium text-slate-900">{t.title}</span> },
    { header: '奖励积分', accessorKey: 'reward', cell: (t: any) => <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-mono font-bold">+{t.reward}</span> },
    { header: '类型', accessorKey: 'type', cell: (t: any) => t.type === 'daily' ? '每日任务' : '一次性' },
    { header: '打卡范围', accessorKey: 'radius', cell: (t: any) => `${t.radius} 米` },
    { header: '状态', cell: (t: any) => t.isActive ? <span className="text-green-600 text-xs">启用</span> : <span className="text-slate-400 text-xs">禁用</span> },
    { 
      header: '操作', 
      cell: (t: any) => (
        <Link href={`/admin/tasks/${t.id}`} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm">
          <Settings size={14} /> 配置
        </Link>
      ) 
    }
  ]

  return <DataTable data={data} columns={columns as any} />
}

