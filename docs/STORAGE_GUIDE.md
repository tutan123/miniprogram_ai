# ☁️ 存储方案升级指南 (Local -> Cloud Object Storage)

目前项目为了开发方便，默认将用户上传的图片存储在服务器本地 (`public/uploads` 目录)。
但在生产环境（尤其是使用云托管/Docker 部署时），本地文件会在容器重启后**丢失**。

因此，强烈建议在上线前迁移到 **对象存储 (Object Storage)**，如腾讯云 COS 或阿里云 OSS。

---

## 1. 为什么要迁移？

| 特性 | 本地存储 (Local) | 云对象存储 (COS/OSS) |
| :--- | :--- | :--- |
| **持久性** | ❌ 容器重启/重新部署后，图片会丢失 | ✅ 数据永久保存，由云厂商保障安全 |
| **访问速度** | 🐢 依赖服务器带宽，可能卡顿 | 🚀 CDN 全球加速，秒开 |
| **扩展性** | ⚠️ 硬盘满了就存不进去了 | ✅ 容量无限自动扩容 |
| **适用场景** | 开发调试、个人演示 | 生产环境、正式上线 |

---

## 2. 迁移步骤 (以腾讯云 COS 为例)

### 第一步：开通服务
1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/cos)。
2. 创建一个**存储桶 (Bucket)**，访问权限选择 **“公有读私有写”**。
3. 获取密钥：在“访问管理”中获取 `SecretId` 和 `SecretKey`。

### 第二步：安装 SDK
在 `server_next` 目录下运行：
```bash
npm install cos-nodejs-sdk-v5
```

### 第三步：修改上传代码
修改 `src/app/api/upload/route.ts`，替换核心逻辑：

```typescript
import { NextResponse } from 'next/server'
import COS from 'cos-nodejs-sdk-v5'

// 初始化 COS 实例
const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
})

export async function POST(request: Request) {
  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File
  
  if (!file) return NextResponse.json({ code: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `uploads/${Date.now()}-${file.name}`

  return new Promise((resolve) => {
    cos.putObject({
      Bucket: '你的存储桶名-1250000000', // 替换为你的 Bucket
      Region: 'ap-shanghai',             // 替换为你的地域
      Key: filename,
      Body: buffer,
    }, (err, data) => {
      if (err) {
        console.error(err)
        resolve(NextResponse.json({ code: 500, msg: '上传云端失败' }))
      } else {
        // data.Location 就是图片的访问链接 (例如: https://example-125xxx.cos.ap-shanghai.myqcloud.com/...)
        resolve(NextResponse.json({ 
          code: 0, 
          data: { url: 'https://' + data.Location } 
        }))
      }
    })
  })
}
```

### 第四步：配置环境变量
在 `.env` 文件中添加你的密钥，不要硬编码在代码里！

---

## 3. 数据库数据兼容
由于我们只在数据库存了 `url` 字符串（例如 `/uploads/1.jpg` 或 `https://cos.../1.jpg`），所以**代码不需要做任何改动**！
只要接口返回的 URL 是可访问的，前端就能正常显示。这体现了我们架构设计的优越性。

