import { prisma } from '@/lib/db'
import { DataTable } from '@/components/DataTable'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

async function resolveComplaint(id: number) {
  "use server"
  await prisma.complaint.update({
    where: { id },
    data: { status: 'closed' }
  })
  revalidatePath('/admin/complaints')
}

export default async function ComplaintsPage() {
  const complaints = await prisma.complaint.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">反馈管理</h1>
          <p className="text-slate-500 mt-1">处理用户的投诉与建议</p>
        </div>
      </div>

      <DataTable 
        data={complaints}
        columns={[
          { header: 'ID', accessorKey: 'id' },
          { 
            header: '类型', 
            cell: (c) => c.type === 'complaint' 
              ? <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-medium">投诉</span> 
              : <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-medium">建议</span> 
          },
          { header: '反馈内容', cell: (c) => <div className="max-w-md text-sm">{c.content}</div> },
          { header: '联系方式', accessorKey: 'contact', cell: (c) => c.contact || '-' },
          { header: '提交用户', cell: (c) => c.user.nickname || '匿名' },
          { 
            header: '状态', 
            cell: (c) => c.status === 'open' 
              ? <span className="flex items-center gap-1 text-orange-500 text-xs"><AlertCircle size={12}/> 待处理</span>
              : <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle size={12}/> 已完成</span>
          },
          { 
            header: '操作', 
            cell: (c) => c.status === 'open' && (
              <form action={resolveComplaint.bind(null, c.id)}>
                <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                  标记为已处理
                </button>
              </form>
            )
          }
        ]}
      />
    </div>
  )
}

