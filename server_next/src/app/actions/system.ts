'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string
  const reward = Number(formData.get('reward'))
  const type = formData.get('type') as string
  const radius = Number(formData.get('radius') || 50)

  await prisma.task.create({
    data: { title, reward, type, radius }
  })

  revalidatePath('/admin/tasks')
  redirect('/admin/tasks')
}

export async function updateTask(id: number, formData: FormData) {
  const title = formData.get('title') as string
  const reward = Number(formData.get('reward'))
  const type = formData.get('type') as string
  const radius = Number(formData.get('radius') || 50)
  const isActive = formData.get('isActive') === 'on'

  await prisma.task.update({
    where: { id },
    data: { title, reward, type, radius, isActive }
  })

  revalidatePath('/admin/tasks')
  redirect('/admin/tasks')
}

// ... 其他 actions
