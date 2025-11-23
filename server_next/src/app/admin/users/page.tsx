import { prisma } from '@/lib/db'
import UsersTable from './_components/UsersTable'

export const dynamic = 'force-dynamic'

export default async function UsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const where = searchParams.q ? {
    OR: [
      { nickname: { contains: searchParams.q } },
      { openid: { contains: searchParams.q } }
    ]
  } : {}

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">用户管理</h1>
          <p className="text-slate-500 mt-1">共 {users.length} 位用户</p>
        </div>
      </div>
      <UsersTable data={users} />
    </div>
  )
}

