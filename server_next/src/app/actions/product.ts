'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  const price = Number(formData.get('price'))
  const stock = Number(formData.get('stock'))
  const image = formData.get('image') as string // 暂时先用 URL 文本框，后续可升级文件上传

  await prisma.product.create({
    data: {
      name,
      price,
      stock,
      image
    }
  })

  revalidatePath('/admin/products')
  redirect('/admin/products')
}

export async function updateProduct(id: number, formData: FormData) {
  const name = formData.get('name') as string
  const price = Number(formData.get('price'))
  const stock = Number(formData.get('stock'))
  const image = formData.get('image') as string

  await prisma.product.update({
    where: { id },
    data: {
      name,
      price,
      stock,
      image
    }
  })

  revalidatePath('/admin/products')
  redirect('/admin/products')
}

export async function deleteProduct(id: number) {
  await prisma.product.delete({
    where: { id }
  })
  
  revalidatePath('/admin/products')
}

