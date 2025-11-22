import { prisma } from '@/lib/db'
import { DataTable } from '@/components/DataTable'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true, product: true }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">订单管理</h1>
        <p className="text-slate-500 mt-1">管理用户积分兑换的商品订单</p>
      </div>

      <DataTable 
        data={orders}
        columns={[
          { header: '订单号', accessorKey: 'id', cell: (o) => <span className="font-mono text-xs">{o.id}</span> },
          { header: '用户', cell: (o) => o.user.nickname || '未知用户' },
          { header: '商品', cell: (o) => <span className="font-medium">{o.product.name}</span> },
          { header: '消耗积分', accessorKey: 'points', cell: (o) => <span className="text-orange-600 font-bold">-{o.points}</span> },
          { 
            header: '状态', 
            accessorKey: 'status', 
            cell: (o) => {
              const colors: any = { pending: 'bg-yellow-100 text-yellow-800', shipped: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800' }
              const labels: any = { pending: '待处理', shipped: '已发货', completed: '已完成' }
              return <span className={`px-2 py-1 rounded-full text-xs ${colors[o.status] || 'bg-gray-100'}`}>{labels[o.status] || o.status}</span>
            }
          },
          { header: '兑换时间', cell: (o) => new Date(o.createdAt).toLocaleString() },
          { 
            header: '操作', 
            cell: () => <button className="text-blue-600 hover:underline text-sm">发货</button> 
          }
        ]}
      />
    </div>
  )
}

