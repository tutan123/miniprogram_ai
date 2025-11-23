'use client'

import { createProduct, updateProduct } from '@/app/actions/product'
import ImageUpload from '@/components/ImageUpload'
import { useState } from 'react'

interface ProductFormProps {
  product?: {
    id: number
    name: string
    price: number
    stock: number
    image: string | null
  }
}

export default function ProductForm({ product }: ProductFormProps) {
  const isEdit = !!product
  const action = isEdit ? updateProduct.bind(null, product.id) : createProduct
  const [image, setImage] = useState(product?.image || '')

  return (
    <form action={action} className="space-y-6 max-w-lg bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">商品名称</label>
        <input 
          name="name" 
          required 
          defaultValue={product?.name}
          className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">兑换积分</label>
          <input 
            name="price" 
            type="number" 
            required 
            defaultValue={product?.price ?? 100}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">库存数量</label>
          <input 
            name="stock" 
            type="number" 
            required 
            defaultValue={product?.stock ?? 99}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">商品图片</label>
        <ImageUpload value={image} onChange={setImage} />
      </div>

      <div className="pt-4 flex gap-4">
        <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium">
          {isEdit ? '保存修改' : '立即上架'}
        </button>
        <button type="button" onClick={() => history.back()} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-lg hover:bg-slate-200 transition font-medium">
          取消
        </button>
      </div>
    </form>
  )
}
