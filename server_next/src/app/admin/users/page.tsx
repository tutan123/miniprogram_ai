import { prisma } from '@/lib/db'
import { DataTable } from '@/components/DataTable'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">用户管理</h1>
          <p className="text-slate-500 mt-1">查看所有注册小程序的用户信息</p>
        </div>
      </div>

      <DataTable 
        title={`共 ${users.length} 位用户`}
        data={users}
        columns={[
          { 
            header: '头像', 
            cell: (u) => u.avatarUrl ? <img src={u.avatarUrl} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">无</div>
          },
          { header: '昵称', accessorKey: 'nickname' },
          { header: '当前积分', accessorKey: 'points', cell: (u) => <span className="font-mono font-bold text-blue-600">{u.points}</span> },
          { header: '等级', accessorKey: 'level', cell: (u) => <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">Lv.{u.level}</span> },
          { header: '注册时间', cell: (u) => new Date(u.createdAt).toLocaleString() },
          { 
            header: '操作', 
            cell: (u) => <button className="text-blue-600 hover:underline">查看详情</button> 
          }
        ]}
      />
    </div>
  )
}

