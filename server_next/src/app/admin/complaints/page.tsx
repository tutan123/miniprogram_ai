import { prisma } from '@/lib/db'
import ComplaintsTable from './_components/ComplaintsTable'

export const dynamic = 'force-dynamic'

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
      <ComplaintsTable data={complaints} />
    </div>
  )
}
