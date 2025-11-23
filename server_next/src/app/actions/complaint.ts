'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function resolveComplaint(id: number) {
  await prisma.complaint.update({
    where: { id },
    data: { status: 'closed' }
  })
  revalidatePath('/admin/complaints')
}

