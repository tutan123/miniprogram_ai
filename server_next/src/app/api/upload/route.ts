import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ code: 400, msg: 'No file uploaded' })
    }

    // 1. 准备目录
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    
    // 自动创建目录（如果不存在）
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 2. 生成安全的文件名 (时间戳+随机数+后缀)
    const ext = path.extname(file.name) || '.jpg'
    const filename = `${Date.now()}-${Math.round(Math.random() * 10000)}${ext}`
    const filepath = path.join(uploadDir, filename)

    // 3. 写入文件
    await writeFile(filepath, buffer)
    
    console.log(`[Upload] File saved to ${filepath}`)

    // 4. 返回 URL (注意：生产环境可能需要配置 Nginx 或 CDN 域名)
    // 在 Next.js 中，public 目录下的文件可以直接通过 /uploads/xxx 访问
    const url = `/uploads/${filename}`
    
    return NextResponse.json({ code: 0, data: { url } })
  } catch (e) {
    console.error('[Upload Error]', e)
    return NextResponse.json({ code: 500, msg: 'Upload failed' })
  }
}
