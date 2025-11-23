'use client'

import { updatePost } from '@/app/actions/post'

interface PostFormProps {
  post: {
    id: number
    title: string
    content: string
    likes: number
  }
}

export default function PostForm({ post }: PostFormProps) {
  const action = updatePost.bind(null, post.id)

  return (
    <form action={action} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">帖子标题</label>
        <input 
          name="title" 
          required 
          defaultValue={post.title}
          className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">正文内容</label>
        <textarea 
          name="content" 
          required 
          defaultValue={post.content}
          rows={5}
          className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">点赞数 (人工干预)</label>
        <input 
          name="likes" 
          type="number"
          defaultValue={post.likes}
          className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>

      <div className="pt-4 flex gap-4">
        <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium">
          保存修改
        </button>
        <button type="button" onClick={() => history.back()} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-lg hover:bg-slate-200 transition font-medium">
          取消
        </button>
      </div>
    </form>
  )
}

