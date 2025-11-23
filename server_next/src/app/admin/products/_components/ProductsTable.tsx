'use client'

import { DataTable } from '@/components/DataTable'
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { deleteProduct, deactivateProduct, activateProduct } from '@/app/actions/product'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProductsTable({ data }: { data: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<number | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const handleDeactivate = async (id: number) => {
    if (!confirm('确定要下架这个商品吗？下架后商品将不再显示给用户。')) return
    
    setLoadingAction(`deactivate-${id}`)
    try {
      const result = await deactivateProduct(id)
      if (result.success) {
        alert(result.message || '下架成功')
        router.refresh()
      } else {
        alert(result.message || '下架失败')
      }
    } catch (error: any) {
      alert(error.message || '下架失败，请重试')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleActivate = async (id: number) => {
    setLoadingAction(`activate-${id}`)
    try {
      const result = await activateProduct(id)
      if (result.success) {
        alert(result.message || '上架成功')
        router.refresh()
      } else {
        alert(result.message || '上架失败')
      }
    } catch (error: any) {
      alert(error.message || '上架失败，请重试')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('警告：确定要永久删除这个商品吗？此操作无法撤销！')) return
    if (!confirm('再次确认：删除后将无法恢复，是否继续？')) return
    
    setLoading(id)
    try {
      const result = await deleteProduct(id)
      if (result.success) {
        alert(result.message || '删除成功')
        router.refresh()
      } else {
        alert(result.message || '删除失败')
      }
    } catch (error: any) {
      alert(error.message || '删除失败，请重试')
    } finally {
      setLoading(null)
    }
  }

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
      cell: (p: any) => {
        // 处理 status 为 undefined 的情况（旧数据默认视为 active）
        const status = p.status || 'active'
        if (status === 'inactive') {
          return <span className="text-slate-500 text-xs bg-slate-100 px-2 py-1 rounded-full">已下架</span>
        }
        return p.stock > 0 ? (
          <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full">销售中</span>
        ) : (
          <span className="text-slate-400 text-xs bg-slate-100 px-2 py-1 rounded-full">已售罄</span>
        )
      } 
    },
    { 
      header: '操作', 
      cell: (p: any) => {
        // 处理 status 为 undefined 的情况（旧数据默认视为 active）
        const status = p.status || 'active'
        const isDeactivating = loadingAction === `deactivate-${p.id}`
        const isActivating = loadingAction === `activate-${p.id}`
        const isDeleting = loading === p.id
        
        return (
          <div className="flex gap-2 items-center">
            <Link href={`/admin/products/${p.id}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs">
              <Pencil size={14} /> 编辑
            </Link>
            {status === 'active' ? (
              <button 
                onClick={() => handleDeactivate(p.id)} 
                disabled={isDeactivating || isDeleting}
                className="text-orange-600 hover:text-orange-800 flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                title="下架商品"
              >
                <ChevronDown size={14} /> {isDeactivating ? '下架中...' : '下架'}
              </button>
            ) : (
              <button 
                onClick={() => handleActivate(p.id)} 
                disabled={isActivating || isDeleting}
                className="text-green-600 hover:text-green-800 flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                title="上架商品"
              >
                <ChevronUp size={14} /> {isActivating ? '上架中...' : '上架'}
              </button>
            )}
            <button 
              onClick={() => handleDelete(p.id)} 
              disabled={isDeleting || isDeactivating || isActivating}
              className="text-red-600 hover:text-red-800 flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              title="永久删除商品"
            >
              <Trash2 size={14} /> {isDeleting ? '删除中...' : '删除'}
            </button>
          </div>
        )
      } 
    }
  ]

  return <DataTable data={data} columns={columns as any} />
}

