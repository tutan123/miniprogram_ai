import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 1. 任务
  await prisma.task.upsert({
    where: { id: 1 },
    update: {},
    create: { title: '每日登录', reward: 10, type: 'daily', radius: 50 }
  })
  
  // 2. 海上世界打卡 (带坐标)
  await prisma.task.upsert({
    where: { id: 2 },
    update: {
      title: '海上世界打卡',
      target_lat: 22.483953,
      target_lng: 113.916671,
      radius: 500
    },
    create: {
      title: '海上世界打卡',
      reward: 50,
      type: 'daily',
      target_lat: 22.483953,
      target_lng: 113.916671,
      radius: 500
    }
  })

  // 3. 商品（使用 upsert 避免重复创建）
  await prisma.product.upsert({
    where: { id: 1 },
    update: { name: '咖啡券', price: 100, stock: 154, status: 'active' },
    create: { id: 1, name: '咖啡券', price: 100, stock: 154, status: 'active' }
  })
  
  await prisma.product.upsert({
    where: { id: 2 },
    update: { name: '明信片', price: 50, stock: 50, status: 'active' },
    create: { id: 2, name: '明信片', price: 50, stock: 50, status: 'active' }
  })
  
  // 删除重复的咖啡券（如果存在ID为3的）
  await prisma.product.deleteMany({
    where: { 
      name: '咖啡券',
      id: { not: 1 }  // 保留ID为1的，删除其他的
    }
  })

  // 4. 路线
  // (省略路线 JSON，保持之前的逻辑)
  
  // 5. [新增] 社区演示帖子
  // 先创建一个演示用户
  const demoUser = await prisma.user.upsert({
    where: { openid: 'demo_user_001' },
    update: {},
    create: {
      openid: 'demo_user_001',
      nickname: '官方小助手',
      avatarUrl: 'https://img.icons8.com/color/96/robot.png'
    }
  })

  await prisma.post.create({
    data: {
      userId: demoUser.id,
      title: '欢迎来到社区！',
      content: '这里是大家的交流天地，欢迎分享你的打卡心情和美图！',
      images: JSON.stringify(['/uploads/demo.jpg']), // 假图片
      likes: 88
    }
  })

  console.log('Seed data updated with Posts')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
