import { prisma } from '@/lib/db'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const userCount = await prisma.user.count()
  const taskCount = await prisma.task.count()
  const productCount = await prisma.product.count()
  const recordCount = await prisma.record.count()
  
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🚀 运营管理后台 (Next.js)</h1>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="总用户" value={userCount} color="bg-blue-500" />
          <StatCard title="总任务" value={taskCount} color="bg-green-500" />
          <StatCard title="商品数" value={productCount} color="bg-yellow-500" />
          <StatCard title="打卡记录" value={recordCount} color="bg-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 用户列表 */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">最新用户</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">昵称</th>
                    <th className="px-4 py-3">积分</th>
                    <th className="px-4 py-3">加入时间</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(user => (
                    <tr key={user.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{user.nickname || '未授权'}</td>
                      <td className="px-4 py-3">{user.points}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">快捷操作</h2>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium">💡 提示</h3>
                <p className="text-sm text-gray-500 mt-1">
                  现在可以直接点击下方按钮进行管理。
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <Link href="/admin/tasks" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-center">
                   管理任务
                 </Link>
                 <Link href="/admin/products/new" className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition text-center">
                   上架商品
                 </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: { title: string, value: number, color: string }) {
  return (
    <div className={`${color} rounded-xl shadow-lg p-6 text-white`}>
      <div className="text-sm opacity-80 mb-1">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  )
}
