'use client'

import { DataTable } from '@/components/DataTable'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { resolveComplaint } from '@/app/actions/complaint'

export default function ComplaintsTable({ data }: { data: any[] }) {
  const columns = [
    { header: 'ID', accessorKey: 'id' },
    { 
      header: '类型', 
      cell: (c: any) => c.type === 'complaint' 
        ? <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-medium">投诉</span> 
        : <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-medium">建议</span> 
    },
    { header: '反馈内容', cell: (c: any) => <div className="max-w-md text-sm">{c.content}</div> },
    { header: '联系方式', accessorKey: 'contact', cell: (c: any) => c.contact || '-' },
    { header: '提交用户', cell: (c: any) => c.user.nickname || '匿名' },
    { 
      header: '状态', 
      cell: (c: any) => c.status === 'open' 
        ? <span className="flex items-center gap-1 text-orange-500 text-xs"><AlertCircle size={12}/> 待处理</span>
        : <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle size={12}/> 已完成</span>
    },
    { 
      header: '操作', 
      cell: (c: any) => c.status === 'open' && (
        <button onClick={() => resolveComplaint(c.id)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
          标记为已处理
        </button>
      )
    }
  ]

  return <DataTable data={data} columns={columns as any} />
}

