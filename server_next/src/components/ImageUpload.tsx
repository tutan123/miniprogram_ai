'use client'

import { useState } from 'react'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [loading, setLoading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const json = await res.json()
      if (json.code === 0) {
        onChange(json.data.url)
      } else {
        alert('上传失败')
      }
    } catch (err) {
      console.error(err)
      alert('上传出错')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {value && (
        <img src={value} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
      )}
      <label className="cursor-pointer bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition">
        {loading ? '上传中...' : '选择图片'}
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </label>
      <input type="hidden" name="image" value={value || ''} />
    </div>
  )
}

