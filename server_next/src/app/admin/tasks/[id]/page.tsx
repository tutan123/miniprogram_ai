import TaskForm from '@/components/TaskForm'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'

export default async function EditTaskPage({ params }: { params: { id: string } }) {
  const task = await prisma.task.findUnique({
    where: { id: Number(params.id) }
  })

  if (!task) notFound()

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">编辑任务</h1>
      <TaskForm task={task} />
    </div>
  )
}

