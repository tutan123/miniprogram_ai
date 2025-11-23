import { prisma } from '@/lib/db'
import TasksTable from './_components/TasksTable'
import { Plus } from 'lucide-react'
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

      <TasksTable data={tasks} />
    </div>
  )
}
