import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 1. 任务
  const task1 = await prisma.task.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: '每日登录',
      reward: 10,
      type: 'daily'
    }
  })
  
  const task2 = await prisma.task.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: '地图定点打卡',
      reward: 50,
      type: 'daily'
    }
  })

  // 2. 商品
  await prisma.product.createMany({
    data: [
      { name: '咖啡券', price: 100, stock: 99 },
      { name: '明信片', price: 50, stock: 50 }
    ]
  })

  // 3. 路线
  await prisma.route.create({
    data: {
        key: 'food',
        name: '美食路线',
        points: JSON.stringify([{lat: 30.572, lng: 104.066, name: "春熙路火锅"}])
    }
  })

  console.log({ task1, task2 })
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

