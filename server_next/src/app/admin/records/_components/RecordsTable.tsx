'use client'

import { DataTable } from '@/components/DataTable'

export default function RecordsTable({ data }: { data: any[] }) {
  const columns = [
    { header: '流水号', accessorKey: 'id' },
    { header: '用户', cell: (r: any) => r.user.nickname || '未知用户' },
    { header: '完成任务', cell: (r: any) => <span className="font-medium">{r.task.title}</span> },
    { header: '获得奖励', cell: (r: any) => <span className="text-green-600">+{r.task.reward} 积分</span> },
    { header: '打卡时间', cell: (r: any) => new Date(r.createdAt).toLocaleString() },
  ]

  return <DataTable data={data} columns={columns as any} />
}

