'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deletePost(id: number) {
  await prisma.comment.deleteMany({ where: { postId: id } })
  await prisma.post.delete({ where: { id } })
  revalidatePath('/admin/posts')
}

export async function updatePost(id: number, formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const likes = Number(formData.get('likes'))

  await prisma.post.update({
    where: { id },
    data: {
      title,
      content,
      likes
    }
  })

  revalidatePath('/admin/posts')
  redirect('/admin/posts')
}
