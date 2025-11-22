import { prisma } from '@/lib/db'
import { DataTable } from '@/components/DataTable'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { deleteProduct } from '@/app/actions/product'

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

      <DataTable 
        data={products}
        columns={[
          { header: 'ID', accessorKey: 'id' },
          { header: '商品名称', accessorKey: 'name', cell: (p) => (
              <div className="flex items-center gap-3">
                {p.image && <img src={p.image} className="w-10 h-10 rounded object-cover border" />}
                <span className="font-medium text-slate-900">{p.name}</span>
              </div>
            ) 
          },
          { header: '兑换价格', accessorKey: 'price', cell: (p) => <span className="text-orange-600 font-bold">{p.price} 积分</span> },
          { header: '库存', accessorKey: 'stock', cell: (p) => p.stock < 10 ? <span className="text-red-600 font-bold">{p.stock} (紧缺)</span> : p.stock },
          { 
            header: '状态', 
            cell: (p) => p.stock > 0 ? <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full">销售中</span> : <span className="text-slate-400 text-xs bg-slate-100 px-2 py-1 rounded-full">已售罄</span> 
          },
          { 
            header: '操作', 
            cell: (p) => (
              <div className="flex gap-3 items-center">
                <Link href={`/admin/products/${p.id}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs">
                  <Pencil size={14} /> 编辑
                </Link>
                {/* 删除按钮需用 form 提交 action */}
                <form action={deleteProduct.bind(null, p.id)}>
                  <button className="text-red-600 hover:text-red-800 flex items-center gap-1 text-xs">
                    <Trash2 size={14} /> 下架
                  </button>
                </form>
              </div>
            ) 
          }
        ]}
      />
    </div>
  )
}
