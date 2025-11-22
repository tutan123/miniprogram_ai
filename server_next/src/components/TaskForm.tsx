'use client'

import { createTask, updateTask } from '@/app/actions/system'

interface TaskFormProps {
  task?: {
    id: number
    title: string
    reward: number
    type: string
    radius: number
    isActive: boolean
  }
}

export default function TaskForm({ task }: TaskFormProps) {
  const isEdit = !!task
  const action = isEdit ? updateTask.bind(null, task.id) : createTask

  return (
    <form action={action} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">任务标题</label>
        <input 
          name="title" 
          required 
          defaultValue={task?.title}
          className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="例如：周末狂欢打卡" 
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">奖励积分</label>
          <input 
            name="reward" 
            type="number" 
            required 
            defaultValue={task?.reward ?? 10}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">打卡半径 (米)</label>
          <input 
            name="radius" 
            type="number" 
            required 
            defaultValue={task?.radius ?? 50}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">任务类型</label>
        <select 
          name="type" 
          defaultValue={task?.type ?? 'daily'}
          className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">每日任务 (每天重置)</option>
          <option value="weekly">每周任务 (周一重置)</option>
          <option value="once">一次性任务</option>
        </select>
      </div>

      {isEdit && (
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            name="isActive" 
            id="isActive"
            defaultChecked={task.isActive}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-slate-700">启用任务</label>
        </div>
      )}

      <div className="pt-4 flex gap-4">
        <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium">
          {isEdit ? '保存修改' : '立即发布'}
        </button>
        <button type="button" onClick={() => history.back()} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-lg hover:bg-slate-200 transition font-medium">
          取消
        </button>
      </div>
    </form>
  )
}
