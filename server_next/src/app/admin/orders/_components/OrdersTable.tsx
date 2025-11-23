'use client'

import { DataTable } from '@/components/DataTable'
import { shipOrder, completeOrder } from '@/app/actions/order'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OrdersTable({ data }: { data: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleShip = async (orderId: string) => {
    if (!confirm('确定要发货这个订单吗？')) return
    
    setLoading(orderId)
    try {
      const result = await shipOrder(orderId)
      if (result.success) {
        alert(result.message || '发货成功')
        router.refresh()
      } else {
        alert(result.message || '发货失败')
      }
    } catch (error: any) {
      alert(error.message || '发货失败，请重试')
    } finally {
      setLoading(null)
    }
  }

  const handleComplete = async (orderId: string) => {
    if (!confirm('确定要标记这个订单为已完成吗？')) return
    
    setLoading(orderId)
    try {
      const result = await completeOrder(orderId)
      if (result.success) {
        alert(result.message || '操作成功')
        router.refresh()
      } else {
        alert(result.message || '操作失败')
      }
    } catch (error: any) {
      alert(error.message || '操作失败，请重试')
    } finally {
      setLoading(null)
    }
  }

  const columns = [
    { header: '订单号', accessorKey: 'id', cell: (o: any) => <span className="font-mono text-xs">{o.id}</span> },
    { header: '用户', cell: (o: any) => o.user.nickname || '未知用户' },
    { header: '商品', cell: (o: any) => <span className="font-medium">{o.product.name}</span> },
    { header: '消耗积分', accessorKey: 'points', cell: (o: any) => <span className="text-orange-600 font-bold">-{o.points}</span> },
    { 
      header: '状态', 
      accessorKey: 'status', 
      cell: (o: any) => {
        const colors: any = { pending: 'bg-yellow-100 text-yellow-800', shipped: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800' }
        const labels: any = { pending: '待处理', shipped: '已发货', completed: '已完成' }
        return <span className={`px-2 py-1 rounded-full text-xs ${colors[o.status] || 'bg-gray-100'}`}>{labels[o.status] || o.status}</span>
      }
    },
    { header: '兑换时间', cell: (o: any) => new Date(o.createdAt).toLocaleString() },
    { 
      header: '操作', 
      cell: (o: any) => {
        const isLoading = loading === o.id
        return (
          <div className="flex gap-2 items-center">
            {o.status === 'pending' && (
              <button 
                onClick={() => handleShip(o.id)}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '处理中...' : '发货'}
              </button>
            )}
            {o.status === 'shipped' && (
              <button 
                onClick={() => handleComplete(o.id)}
                disabled={isLoading}
                className="text-green-600 hover:text-green-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '处理中...' : '完成'}
              </button>
            )}
            {o.status === 'completed' && (
              <span className="text-slate-400 text-sm">已完成</span>
            )}
          </div>
        )
      } 
    }
  ]

  return <DataTable searchPlaceholder="搜索订单号..." data={data} columns={columns as any} />
}

