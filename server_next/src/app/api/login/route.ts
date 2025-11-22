import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import axios from 'axios'

const WX_APP_ID = process.env.WX_APP_ID || ''
const WX_APP_SECRET = process.env.WX_APP_SECRET || ''

export async function POST(request: Request) {
  const body = await request.json()
  const { code, userInfo } = body

  let openid = ''

  // 1. 模拟或真实换取 OpenID
  if (code === 'test_code' || !WX_APP_ID) {
    openid = 'test_openid_real_123'
  } else {
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APP_ID}&secret=${WX_APP_SECRET}&js_code=${code}&grant_type=authorization_code`
    const res = await axios.get(url)
    if (res.data.errcode) {
      return NextResponse.json({ code: 400, msg: res.data.errmsg })
    }
    openid = res.data.openid
  }

  // 2. 存入数据库 (使用 Prisma upsert)
  try {
    // 查找是否存在
    let user = await prisma.user.findUnique({
      where: { openid }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          openid,
          nickname: userInfo?.nickName || '微信用户',
          avatarUrl: userInfo?.avatarUrl || ''
        }
      })
    } else if (userInfo?.nickName) {
      // 更新信息
      user = await prisma.user.update({
        where: { openid },
        data: {
          nickname: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      })
    }

    return NextResponse.json({ code: 0, data: { openid } })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ code: 500, msg: 'Database Error' })
  }
}

