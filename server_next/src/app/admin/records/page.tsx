import { prisma } from '@/lib/db'
import { DataTable } from '@/components/DataTable'

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

      <DataTable 
        data={records}
        columns={[
          { header: '流水号', accessorKey: 'id' },
          { header: '用户', cell: (r) => r.user.nickname || '未知用户' },
          { header: '完成任务', cell: (r) => <span className="font-medium">{r.task.title}</span> },
          { header: '获得奖励', cell: (r) => <span className="text-green-600">+{r.task.reward} 积分</span> },
          { header: '打卡时间', cell: (r) => new Date(r.createdAt).toLocaleString() },
        ]}
      />
    </div>
  )
}

