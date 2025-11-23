'use client'

import { DataTable } from '@/components/DataTable'
import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { deleteProduct } from '@/app/actions/product'

export default function ProductsTable({ data }: { data: any[] }) {
  const columns = [
    { header: 'ID', accessorKey: 'id' },
    { header: '商品名称', accessorKey: 'name', cell: (p: any) => (
        <div className="flex items-center gap-3">
          {p.image && <img src={p.image} className="w-10 h-10 rounded object-cover border" />}
          <span className="font-medium text-slate-900">{p.name}</span>
        </div>
      ) 
    },
    { header: '兑换价格', accessorKey: 'price', cell: (p: any) => <span className="text-orange-600 font-bold">{p.price} 积分</span> },
    { header: '库存', accessorKey: 'stock', cell: (p: any) => p.stock < 10 ? <span className="text-red-600 font-bold">{p.stock} (紧缺)</span> : p.stock },
    { 
      header: '状态', 
      cell: (p: any) => p.stock > 0 ? <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full">销售中</span> : <span className="text-slate-400 text-xs bg-slate-100 px-2 py-1 rounded-full">已售罄</span> 
    },
    { 
      header: '操作', 
      cell: (p: any) => (
        <div className="flex gap-3 items-center">
          <Link href={`/admin/products/${p.id}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs">
            <Pencil size={14} /> 编辑
          </Link>
          <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1 text-xs">
            <Trash2 size={14} /> 下架
          </button>
        </div>
      ) 
    }
  ]

  return <DataTable data={data} columns={columns as any} />
}

