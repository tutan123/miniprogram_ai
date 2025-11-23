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

  // 4. 路线（南山区三个路线）
  // 美食路线：南山多个美食地点
  await prisma.route.upsert({
    where: { key: 'food' },
    update: {
      name: '美食路线',
      points: JSON.stringify([
        { lat: 22.5314, lng: 113.9354, name: '海岸城' },
        { lat: 22.5208, lng: 113.9341, name: '万象天地' },
        { lat: 22.5075, lng: 113.9332, name: '益田假日广场' },
        { lat: 22.4970, lng: 113.9320, name: '世界之窗美食街' }
      ])
    },
    create: {
      key: 'food',
      name: '美食路线',
      points: JSON.stringify([
        { lat: 22.5314, lng: 113.9354, name: '海岸城' },
        { lat: 22.5208, lng: 113.9341, name: '万象天地' },
        { lat: 22.5075, lng: 113.9332, name: '益田假日广场' },
        { lat: 22.4970, lng: 113.9320, name: '世界之窗美食街' }
      ])
    }
  })

  // 购物路线：南山多个购物地点
  await prisma.route.upsert({
    where: { key: 'shopping' },
    update: {
      name: '购物路线',
      points: JSON.stringify([
        { lat: 22.5208, lng: 113.9341, name: '万象天地' },
        { lat: 22.5314, lng: 113.9354, name: '海岸城购物中心' },
        { lat: 22.5075, lng: 113.9332, name: '益田假日广场' },
        { lat: 22.4970, lng: 113.9320, name: '世界之窗奥特莱斯' }
      ])
    },
    create: {
      key: 'shopping',
      name: '购物路线',
      points: JSON.stringify([
        { lat: 22.5208, lng: 113.9341, name: '万象天地' },
        { lat: 22.5314, lng: 113.9354, name: '海岸城购物中心' },
        { lat: 22.5075, lng: 113.9332, name: '益田假日广场' },
        { lat: 22.4970, lng: 113.9320, name: '世界之窗奥特莱斯' }
      ])
    }
  })

  // 踏青路线：南山多个自然景点
  await prisma.route.upsert({
    where: { key: 'outing' },
    update: {
      name: '踏青路线',
      points: JSON.stringify([
        { lat: 22.5100, lng: 113.9400, name: '深圳人才公园' },
        { lat: 22.4950, lng: 113.9350, name: '深圳湾公园' },
        { lat: 22.4839, lng: 113.9167, name: '蛇口海上世界' },
        { lat: 22.5200, lng: 113.9100, name: '大南山公园' }
      ])
    },
    create: {
      key: 'outing',
      name: '踏青路线',
      points: JSON.stringify([
        { lat: 22.5100, lng: 113.9400, name: '深圳人才公园' },
        { lat: 22.4950, lng: 113.9350, name: '深圳湾公园' },
        { lat: 22.4839, lng: 113.9167, name: '蛇口海上世界' },
        { lat: 22.5200, lng: 113.9100, name: '大南山公园' }
      ])
    }
  })

  // 5. 兴趣点（POI）
  // 人才公园
  await prisma.poi.upsert({
    where: { id: 1 },
    update: {
      name: '深圳人才公园',
      lat: 22.5100,
      lng: 113.9400,
      description: '深圳人才公园是深圳市为吸引和留住人才而打造的主题公园，位于南山区，毗邻深圳湾，环境优美，是市民休闲娱乐的好去处。公园内有人才星光桥、求贤阁、群英荟等景点。',
      category: 'attraction',
      address: '深圳市南山区科苑南路3329号'
    },
    create: {
      id: 1,
      name: '深圳人才公园',
      lat: 22.5100,
      lng: 113.9400,
      description: '深圳人才公园是深圳市为吸引和留住人才而打造的主题公园，位于南山区，毗邻深圳湾，环境优美，是市民休闲娱乐的好去处。公园内有人才星光桥、求贤阁、群英荟等景点。',
      category: 'attraction',
      address: '深圳市南山区科苑南路3329号'
    }
  })

  // 蛇口海上世界
  await prisma.poi.upsert({
    where: { id: 2 },
    update: {
      name: '蛇口海上世界',
      lat: 22.4839,
      lng: 113.9167,
      description: '蛇口海上世界是深圳标志性景点之一，集文化、艺术、餐饮、娱乐于一体。这里有明华轮、女娲补天雕像等标志性建筑，是深圳改革开放的见证地。',
      category: 'attraction',
      address: '深圳市南山区蛇口望海路1128号'
    },
    create: {
      id: 2,
      name: '蛇口海上世界',
      lat: 22.4839,
      lng: 113.9167,
      description: '蛇口海上世界是深圳标志性景点之一，集文化、艺术、餐饮、娱乐于一体。这里有明华轮、女娲补天雕像等标志性建筑，是深圳改革开放的见证地。',
      category: 'attraction',
      address: '深圳市南山区蛇口望海路1128号'
    }
  })

  // 南头古城
  await prisma.poi.upsert({
    where: { id: 3 },
    update: {
      name: '南头古城',
      lat: 22.5360,
      lng: 113.9130,
      description: '南头古城是深圳历史最悠久的古城，有1700多年历史，是深圳特区历史文化的地标。古城内保存有明清时期的古建筑，是了解深圳历史文化的必去之地。',
      category: 'attraction',
      address: '深圳市南山区深南大道3109号'
    },
    create: {
      id: 3,
      name: '南头古城',
      lat: 22.5360,
      lng: 113.9130,
      description: '南头古城是深圳历史最悠久的古城，有1700多年历史，是深圳特区历史文化的地标。古城内保存有明清时期的古建筑，是了解深圳历史文化的必去之地。',
      category: 'attraction',
      address: '深圳市南山区深南大道3109号'
    }
  })

  // 深圳湾公园
  await prisma.poi.upsert({
    where: { id: 4 },
    update: {
      name: '深圳湾公园',
      lat: 22.4950,
      lng: 113.9350,
      description: '深圳湾公园是深圳最美的滨海公园之一，沿着深圳湾海岸线延伸，是观赏日出日落、休闲散步的理想场所。公园内有大片的红树林湿地，是候鸟的天堂。',
      category: 'attraction',
      address: '深圳市南山区滨海大道'
    },
    create: {
      id: 4,
      name: '深圳湾公园',
      lat: 22.4950,
      lng: 113.9350,
      description: '深圳湾公园是深圳最美的滨海公园之一，沿着深圳湾海岸线延伸，是观赏日出日落、休闲散步的理想场所。公园内有大片的红树林湿地，是候鸟的天堂。',
      category: 'attraction',
      address: '深圳市南山区滨海大道'
    }
  })

  // 大南山公园
  await prisma.poi.upsert({
    where: { id: 5 },
    update: {
      name: '大南山公园',
      lat: 22.5200,
      lng: 113.9100,
      description: '大南山公园是南山区的城市森林公园，主峰海拔336米，登顶可俯瞰深圳湾和蛇口全景。公园内有多条登山步道，是市民登山健身的好去处。',
      category: 'attraction',
      address: '深圳市南山区沿山路'
    },
    create: {
      id: 5,
      name: '大南山公园',
      lat: 22.5200,
      lng: 113.9100,
      description: '大南山公园是南山区的城市森林公园，主峰海拔336米，登顶可俯瞰深圳湾和蛇口全景。公园内有多条登山步道，是市民登山健身的好去处。',
      category: 'attraction',
      address: '深圳市南山区沿山路'
    }
  })
  
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
