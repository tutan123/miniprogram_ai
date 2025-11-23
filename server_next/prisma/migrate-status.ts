// 迁移脚本：为现有商品添加 status 字段
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('开始迁移：为现有商品添加 status 字段...')
  
  // 更新所有没有 status 的商品，设置为 'active'
  const result = await prisma.$executeRaw`
    UPDATE Product 
    SET status = 'active' 
    WHERE status IS NULL OR status = ''
  `.catch(() => {
    // 如果字段不存在，先尝试添加字段（SQLite）
    return prisma.$executeRaw`
      ALTER TABLE Product ADD COLUMN status TEXT DEFAULT 'active'
    `.catch((e: any) => {
      console.log('字段可能已存在或数据库不支持动态添加字段，请使用 prisma db push')
      return null
    })
  })

  console.log('迁移完成！现有商品已设置为 active 状态。')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('迁移失败:', e)
    await prisma.$disconnect()
    process.exit(1)
  })

