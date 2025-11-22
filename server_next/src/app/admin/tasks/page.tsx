import { prisma } from '@/lib/db'
import { DataTable } from '@/components/DataTable'
import { Plus, Settings } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({ orderBy: { id: 'desc' }})

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">任务配置</h1>
          <p className="text-slate-500 mt-1">管理用户可参与的打卡任务</p>
        </div>
        <Link href="/admin/tasks/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-700 transition">
          <Plus size={16} />
          新建任务
        </Link>
      </div>

      <DataTable 
        data={tasks}
        columns={[
          { header: 'ID', accessorKey: 'id' },
          { header: '任务标题', accessorKey: 'title', cell: (t) => <span className="font-medium text-slate-900">{t.title}</span> },
          { header: '奖励积分', accessorKey: 'reward', cell: (t) => <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-mono font-bold">+{t.reward}</span> },
          { header: '类型', accessorKey: 'type', cell: (t) => t.type === 'daily' ? '每日任务' : '一次性' },
          { header: '打卡范围', accessorKey: 'radius', cell: (t) => `${t.radius} 米` },
          { header: '状态', cell: (t) => t.isActive ? <span className="text-green-600 text-xs">启用</span> : <span className="text-slate-400 text-xs">禁用</span> },
          { 
            header: '操作', 
            cell: (t) => (
              <Link href={`/admin/tasks/${t.id}`} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm">
                <Settings size={14} /> 配置
              </Link>
            ) 
          }
        ]}
      />
    </div>
  )
}
