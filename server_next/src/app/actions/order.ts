'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function shipOrder(orderId: string) {
  try {
    // 检查订单是否存在
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })
    
    if (!order) {
      return { success: false, message: '订单不存在' }
    }
    
    // 检查订单状态
    if (order.status === 'shipped' || order.status === 'completed') {
      return { success: false, message: '订单已发货，无需重复操作' }
    }
    
    // 更新订单状态为已发货
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'shipped' }
    })
    
    revalidatePath('/admin/orders')
    return { success: true, message: '发货成功' }
  } catch (error: any) {
    console.error('发货失败:', error)
    return { success: false, message: error.message || '发货失败，请重试' }
  }
}

export async function completeOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })
    
    if (!order) {
      return { success: false, message: '订单不存在' }
    }
    
    if (order.status === 'completed') {
      return { success: false, message: '订单已完成' }
    }
    
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'completed' }
    })
    
    revalidatePath('/admin/orders')
    return { success: true, message: '订单已完成' }
  } catch (error: any) {
    console.error('完成订单失败:', error)
    return { success: false, message: error.message || '操作失败，请重试' }
  }
}

