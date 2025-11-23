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
      image,
      status: 'active'
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

// 下架商品（软删除）
export async function deactivateProduct(id: number) {
  try {
    await prisma.product.update({
      where: { id },
      data: { status: 'inactive' }
    })
    
    revalidatePath('/admin/products')
    return { success: true, message: '下架成功' }
  } catch (error: any) {
    console.error('下架商品失败:', error)
    return { success: false, message: error.message || '下架失败，请重试' }
  }
}

// 上架商品
export async function activateProduct(id: number) {
  try {
    await prisma.product.update({
      where: { id },
      data: { status: 'active' }
    })
    
    revalidatePath('/admin/products')
    return { success: true, message: '上架成功' }
  } catch (error: any) {
    console.error('上架商品失败:', error)
    return { success: false, message: error.message || '上架失败，请重试' }
  }
}

// 删除商品（硬删除，需要检查关联订单）
export async function deleteProduct(id: number) {
  try {
    // 检查是否有关联的订单
    const orderCount = await prisma.order.count({
      where: { productId: id }
    })
    
    if (orderCount > 0) {
      throw new Error(`该商品已有 ${orderCount} 个订单，无法删除。建议先下架商品。`)
    }
    
    await prisma.product.delete({
      where: { id }
    })
    
    revalidatePath('/admin/products')
    return { success: true, message: '删除成功' }
  } catch (error: any) {
    console.error('删除商品失败:', error)
    return { success: false, message: error.message || '删除失败，请重试' }
  }
}

