import { prisma } from '@/lib/db'
import OrdersTable from './_components/OrdersTable'

export const dynamic = 'force-dynamic'

export default async function OrdersPage({ searchParams }: { searchParams: { q?: string } }) {
  const where = searchParams.q ? {
    id: { contains: searchParams.q }
  } : {}

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { user: true, product: true }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">订单管理</h1>
        <p className="text-slate-500 mt-1">管理用户积分兑换的商品订单</p>
      </div>
      <OrdersTable data={orders} />
    </div>
  )
}
