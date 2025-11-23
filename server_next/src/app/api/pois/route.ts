import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const pois = await prisma.poi.findMany({
      orderBy: { id: 'asc' }
    })
    
    // 转换为小程序前端需要的格式
    const data = pois.map(poi => ({
      id: poi.id,
      name: poi.name,
      lat: poi.lat,
      lng: poi.lng,
      description: poi.description,
      category: poi.category,
      image: poi.image,
      address: poi.address
    }))

    return NextResponse.json({ code: 0, data })
  } catch (error: any) {
    console.error('获取兴趣点失败:', error)
    // 如果表不存在，返回空数组
    if (error.message && error.message.includes('does not exist')) {
      return NextResponse.json({ code: 0, data: [] })
    }
    return NextResponse.json({ code: 500, msg: '获取兴趣点失败', data: [] })
  }
}

