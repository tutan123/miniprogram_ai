# 数据库初始化指南

## 关于数据库文件

### 数据库文件位置
- **SQLite 数据库文件**: `prisma/dev.db`
- **数据库配置文件**: `prisma/schema.prisma`

### Git 状态
✅ **数据库文件已添加到 `.gitignore`，不会上传到 GitHub**

这意味着：
- ✅ 每个开发者/环境都有独立的数据库
- ✅ 数据库不会意外提交到代码仓库
- ✅ 保护敏感数据（用户信息、积分等）

### 新环境启动

当你在新电脑上 `git clone` 项目后，数据库是空的。需要按以下步骤初始化：

## 初始化步骤

### 1. 安装依赖
```bash
cd 小程序/server_next
npm install
```

### 2. 创建数据库结构
```bash
npm run db:push
```
这个命令会：
- 根据 `prisma/schema.prisma` 创建数据库表
- 如果表已存在，会更新结构（添加新字段等）

### 3. 重新生成 Prisma Client
```bash
npx prisma generate
```
这个命令会：
- 根据最新的 schema 生成 TypeScript 类型
- 更新 `node_modules/.prisma/client`

### 4. 初始化种子数据
```bash
npm run db:seed
```
这个命令会：
- 创建示例任务（每日登录、海上世界打卡等）
- 创建示例商品（咖啡券、明信片等）
- 创建三个路线（美食、购物、踏青）
- 创建兴趣点（人才公园、蛇口海上世界等）
- 创建示例帖子（用于测试社区功能）

### 5. 启动开发服务器
```bash
npm run dev
```

## 数据库迁移说明

### 重要变更（安全加固）

本次更新添加了 `Record.checkinDate` 字段，用于：
- ✅ 防止同一用户同一天重复打卡
- ✅ 使用服务器时间而非客户端时间
- ✅ 数据库唯一约束防止并发问题

**迁移时**：
- 如果数据库是新建的，`npm run db:push` 会自动创建包含 `checkinDate` 的表
- 如果数据库已有数据，现有的 `Record` 记录需要手动添加 `checkinDate`（或删除旧记录重新开始）

### 迁移现有数据（可选）

如果已有打卡记录，可以运行以下 SQL 更新：

```sql
-- 为现有记录添加 checkinDate（基于 createdAt）
UPDATE Record 
SET checkinDate = strftime('%Y-%m-%d', createdAt, '+8 hours');
```

或者，删除所有记录重新开始（开发环境推荐）：
```bash
# 删除数据库文件
rm prisma/dev.db

# 重新初始化
npm run db:push
npm run db:seed
```

## 验证数据库

启动服务后，可以通过以下方式验证：

1. **查看数据库文件**
```bash
# Windows PowerShell
Get-Item prisma/dev.db

# 应该能看到文件大小 > 0
```

2. **使用 Prisma Studio 查看数据**
```bash
npx prisma studio
```
这会打开浏览器，可以可视化查看所有表的数据。

3. **检查 API 响应**
```bash
# 访问任务列表 API
curl http://localhost:8080/api/tasks?openid=test_openid_123
```

应该返回任务列表数据。

## 常见问题

### Q: 为什么数据库文件不在 Git 中？
A: 因为：
- 每个环境需要独立的数据库
- 数据库可能包含敏感数据
- 数据库文件可能很大
- 开发数据库经常变化

### Q: 如何重置数据库？
A: 
```bash
# 删除数据库文件
rm prisma/dev.db  # Linux/Mac
del prisma\dev.db  # Windows CMD

# 重新初始化
npm run db:push
npx prisma generate
npm run db:seed
```

### Q: 如何备份数据库？
A:
```bash
# 简单复制数据库文件
cp prisma/dev.db prisma/dev.db.backup

# 或导出为 SQL（需要 sqlite3 工具）
sqlite3 prisma/dev.db .dump > backup.sql
```

### Q: 生产环境如何处理？
A: 生产环境应该：
- 使用 PostgreSQL 或 MySQL（而非 SQLite）
- 配置数据库连接字符串（`.env` 文件）
- 使用 Prisma Migrations（而非 `db:push`）
- 定期备份数据库

## 相关命令总结

```bash
# 查看数据库结构
npx prisma db pull

# 生成 Prisma Client
npx prisma generate

# 推送 schema 到数据库（开发环境）
npm run db:push

# 运行迁移（生产环境）
npx prisma migrate dev

# 初始化种子数据
npm run db:seed

# 打开数据库可视化工具
npx prisma studio

# 重置数据库
rm prisma/dev.db && npm run db:push && npm run db:seed
```

