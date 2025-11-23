'use client'

import { DataTable } from '@/components/DataTable'

export default function OrdersTable({ data }: { data: any[] }) {
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
      cell: () => <button className="text-blue-600 hover:underline text-sm">发货</button> 
    }
  ]

  return <DataTable searchPlaceholder="搜索订单号..." data={data} columns={columns as any} />
}

