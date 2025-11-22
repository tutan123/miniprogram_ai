import { prisma } from '@/lib/db'
import SettingsForm from '@/components/SettingsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const configs = await prisma.systemConfig.findMany()
  const configMap = configs.reduce((acc, cur) => ({ ...acc, [cur.key]: cur.value }), {} as Record<string, string>)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">系统设置</h1>
      <p className="text-slate-500 mb-8">管理小程序的全局参数</p>
      <SettingsForm configs={configMap} />
    </div>
  )
}
