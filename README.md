# 🚀 Next.js Fullstack WeChat Admin

这是一个基于 **Next.js 14 (App Router)** 构建的现代化全栈应用，集成了小程序后端 API 和可视化的运营管理后台。

---

## 🏗️ 技术架构深度解析

本项目采用了目前业界最先进的 **"BFF (Backend for Frontend)"** 全栈架构。

### 1. 系统分层图

```mermaid
graph TD
    subgraph Client [小程序端]
        MP[微信小程序]
    end

    subgraph Next_Server [Next.js 全栈服务]
        direction TB
        
        subgraph Router [路由层 (App Router)]
            Page[Admin UI (Page/Layout)]
            Route[API Routes (Route Handlers)]
        end
        
        subgraph Controller [逻辑层]
            Action[Server Actions (表单提交/数据变更)]
        end
        
        subgraph Model [数据层]
            Prisma[Prisma Client (ORM)]
        end
    end

    subgraph Data [持久化]
        SQLite[(SQLite 数据库)]
        Files[本地文件/对象存储]
    end

    %% 数据流
    MP -->|HTTPS 请求| Route
    Page -->|服务端渲染| Action
    Route --> Prisma
    Action --> Prisma
    Prisma --> SQLite
```

### 2. 核心技术栈

*   **框架核心**: `Next.js 14` - 使用最新的 **App Router** 模式，支持 React Server Components (RSC)。
*   **语言**: `TypeScript` - 全程类型安全，杜绝 `undefined` 报错。
*   **数据库 ORM**: `Prisma` - 现代化的数据库工具，自动生成类型定义，支持 SQLite/MySQL 无缝切换。
*   **UI 样式**: `Tailwind CSS` - 原子化 CSS，快速构建美观的后台界面。
*   **组件库**: `Lucide React` (图标) + `Recharts` (图表)。

---

## 📂 工程目录解读

对于不熟悉 Next.js 的开发者，理解以下目录结构至关重要：

```text
server_next/
├── prisma/
│   ├── schema.prisma      # 💎 数据库模型定义 (在此处修改表结构)
│   └── dev.db             # 本地 SQLite 数据库文件
│
├── public/
│   └── uploads/           # 📂 图片上传存储目录 (由 API 自动创建)
│
├── src/
│   ├── app/               # 核心路由目录
│   │   ├── admin/         # 🖥️ 管理后台页面 (http://localhost:8080/admin)
│   │   │   ├── layout.tsx # 全局布局 (侧边栏、顶部导航)
│   │   │   └── page.tsx   # 仪表盘首页
│   │   │
│   │   ├── api/           # 🔌 小程序接口 (http://localhost:8080/api/...)
│   │   │   ├── login/     # 登录接口
│   │   │   └── upload/    # 文件上传接口
│   │   │
│   │   └── actions/       # ⚡ Server Actions (服务端逻辑函数)
│   │       └── product.ts # 处理商品的增删改逻辑
│   │
│   ├── components/        # 🧩 UI 组件 (复用代码)
│   │   ├── DataTable.tsx  # 通用数据表格
│   │   └── ImageUpload.tsx# 图片上传组件
│   │
│   └── lib/
│       └── db.ts          # 数据库单例模式 (防止连接数过多)
```

---

## 🛠️ 关键模块工作原理

### A. 小程序 API (Route Handlers)
位于 `src/app/api/*` 下的文件对应 HTTP 接口。
*   **示例**: `src/app/api/posts/route.ts`
*   **原理**: 导出一个 `GET` 或 `POST` 函数，Next.js 会自动将其映射为 API。
*   **优势**: 直接在函数里调用 Prisma 查数据库，无需额外部署后端服务。

### B. 管理后台 (Server Components)
位于 `src/app/admin/*` 下的 `page.tsx` 默认是 **服务端组件**。
*   **原理**: 代码在服务器执行，直接连接数据库获取数据，渲染成 HTML 后发送给浏览器。
*   **优势**: 速度极快，对 SEO 友好，且数据库密码等敏感信息绝不会泄露给客户端。

### C. 表单提交 (Server Actions)
位于 `src/app/actions/*`。
*   **原理**: 你在前端写一个普通的 `form action={createProduct}`，Next.js 会自动把表单数据序列化，发送 POST 请求到服务器执行这个函数。
*   **优势**: 甚至不需要写 `fetch` 代码，像写本地函数一样写后端逻辑！

---

## 📖 更多文档

*   [☁️ 云存储迁移指南 (Local -> COS)](docs/STORAGE_GUIDE.md)
*   [🏛️ 详细系统架构图](docs/ARCHITECTURE.md)
