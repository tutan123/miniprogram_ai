import { prisma } from '@/lib/db'
import RecordsTable from './_components/RecordsTable'

export const dynamic = 'force-dynamic'

export default async function RecordsPage() {
  const records = await prisma.record.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      task: true
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">打卡记录</h1>
        <p className="text-slate-500 mt-1">最近 50 条用户打卡流水</p>
      </div>
      <RecordsTable data={records} />
    </div>
  )
}
