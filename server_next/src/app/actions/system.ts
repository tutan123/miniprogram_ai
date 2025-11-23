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

// 修复：补充缺失的 updateSystemConfig
export async function updateSystemConfig(formData: FormData) {
  // 遍历所有以 cfg_ 开头的字段
  for (const [key, value] of Array.from(formData.entries())) {
    if (key.startsWith('cfg_')) {
      const configKey = key.replace('cfg_', '')
      await prisma.systemConfig.upsert({
        where: { key: configKey },
        update: { value: value as string },
        create: { key: configKey, value: value as string }
      })
    }
  }
  
  revalidatePath('/admin/settings')
  // 设置页一般不需要跳转，留在当前页即可
}

export async function createAnnouncement(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  
  await prisma.announcement.create({
    data: { title, content }
  })
  
  revalidatePath('/admin')
}
