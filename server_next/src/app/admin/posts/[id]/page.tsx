import { prisma } from '@/lib/db'
import PostForm from '@/components/PostForm'
import { notFound } from 'next/navigation'

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: Number(params.id) }
  })

  if (!post) notFound()

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">编辑帖子</h1>
      <PostForm post={post} />
    </div>
  )
}

