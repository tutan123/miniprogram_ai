import TaskForm from '@/components/TaskForm'

export default function NewTaskPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">新建任务</h1>
      <TaskForm />
    </div>
  )
}
