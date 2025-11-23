import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const routes = await prisma.route.findMany()
  
  // 转换数据格式以匹配小程序前端需求
  // 前端期望: { "food": { name: "...", points: [] }, "shopping": ... }
  const data: Record<string, any> = {}
  
  routes.forEach(route => {
    data[route.key] = {
      name: route.name,
      points: JSON.parse(route.points)
    }
  })

  return NextResponse.json({ code: 0, data })
}

