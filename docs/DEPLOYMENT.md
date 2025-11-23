# 🚀 上线部署与运维指南 (Deployment Guide)

本在将小程序和 Next.js 后端部署到生产环境（如腾讯云云托管）时，请务必遵循以下步骤。

---

## 1. 环境准备

### 数据库 (MySQL)
*   生产环境推荐使用 **TencentDB for MySQL**（云数据库）。
*   **配置方式**：
    在云托管的环境变量中设置 `DATABASE_URL`：
    ```env
    DATABASE_URL="mysql://user:password@host:3306/dbname"
    ```
    *(注意：Prisma 默认是 SQLite，上线前需修改 schema.prisma 中的 provider 为 "mysql")*

### 云存储 (COS)
*   生产环境图片**不能**存在本地 `public/uploads`。
*   请参考 `docs/STORAGE_GUIDE.md` 配置腾讯云 COS。

---

## 2. 关键配置修改

上线前，必须修改以下文件中的硬编码地址：

### 小程序端 (`miniprogram/app.js`)
将局域网 IP 修改为你的**公网 HTTPS 域名**：

```javascript
// ❌ 开发环境
// const FLASK_SERVER_URL = 'http://192.168.3.215:8080';

// ✅ 生产环境 (示例)
const FLASK_SERVER_URL = 'https://api.your-app.com'; 
// 或者云托管分配的域名
const FLASK_SERVER_URL = 'https://xxxx.ap-shanghai.app.tcloudbase.com';
```

### 微信后台配置
登录 [微信公众平台](https://mp.weixin.qq.com)：
1.  进入 **开发 -> 开发管理 -> 开发设置**。
2.  在 **服务器域名** 中，将你的域名添加到 `request合法域名` 和 `uploadFile合法域名`。

---

## 3. 常用运维命令

### 数据库同步
每当你在 `prisma/schema.prisma` 修改了表结构（例如新增了字段），**必须**在服务器执行：

```bash
npm run db:push
```
*作用：直接更新数据库表结构，使其与 schema 一致。*

### 客户端生成
如果报错 `PrismaClient is not initialized`，执行：

```bash
npx prisma generate
```
*作用：重新生成代码依赖，确保代码能识别最新的数据库结构。*

### 构建与启动
```bash
npm run build
npm start
```

---

## 4. 常见问题排查

*   **真机无法请求 / 网络错误**：
    *   检查手机是否开了代理/VPN。
    *   检查域名是否已配置 HTTPS 证书。
    *   检查微信后台是否配置了白名单。

*   **图片无法显示**：
    *   检查图片 URL 是否包含 `localhost` 或局域网 IP（生产环境应为 CDN 域名）。
    *   检查云存储桶的“跨域访问 CORS”设置是否允许了你的域名。

