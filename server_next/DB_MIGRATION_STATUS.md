# 数据库迁移说明 - 添加商品状态字段

## 问题说明
当前数据库中的 `Product` 表缺少 `status` 字段，导致下架/上架功能无法正常工作。

## 解决步骤

### 1. 更新数据库结构（添加 status 字段）

在 `小程序/server_next` 目录下运行：

```bash
npx prisma db push
```

这会：
- 在 `Product` 表中添加 `status` 字段（类型：String，默认值：'active'）
- 自动为现有数据设置默认值

### 2. 重新生成 Prisma Client

```bash
npx prisma generate
```

这会重新生成 TypeScript 类型，使代码能够识别 `status` 字段。

### 3. 更新现有数据（如果需要）

如果某些商品的 `status` 为 null 或 undefined，可以运行：

```bash
npx ts-node prisma/migrate-status.ts
```

或者在 Prisma Studio 中手动更新：
```bash
npx prisma studio
```

### 4. 重启开发服务器

完成上述步骤后，重启 Next.js 开发服务器：

```bash
npm run dev
```

## 验证

迁移成功后：
- 商品列表中的"状态"列应该正常显示（销售中/已下架）
- "下架"和"上架"按钮应该根据商品状态正确显示
- 点击"下架"或"上架"按钮不应该再出现 `Unknown argument 'status'` 错误

