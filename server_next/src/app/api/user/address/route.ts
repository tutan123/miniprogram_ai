import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { openid, realName, phone, address } = body

  try {
    await prisma.user.update({
      where: { openid },
      data: { realName, phone, address }
    })
    return NextResponse.json({ code: 0, msg: '保存成功' })
  } catch (e) {
    return NextResponse.json({ code: 500, msg: '保存失败' })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const openid = searchParams.get('openid')
  
  const user = await prisma.user.findUnique({ where: { openid: openid || '' } })
  if (!user) return NextResponse.json({ code: 404 })
  
  return NextResponse.json({ 
    code: 0, 
    data: { 
      realName: user.realName, 
      phone: user.phone, 
      address: user.address 
    } 
  })
}

