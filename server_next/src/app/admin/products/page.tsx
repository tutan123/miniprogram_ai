import { prisma } from '@/lib/db'
import ProductsTable from './_components/ProductsTable'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { id: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">商品管理</h1>
          <p className="text-slate-500 mt-1">配置积分商城可兑换的商品</p>
        </div>
        <Link href="/admin/products/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus size={16} />
          上架商品
        </Link>
      </div>
      <ProductsTable data={products} />
    </div>
  )
}
