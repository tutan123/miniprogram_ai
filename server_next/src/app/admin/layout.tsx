import Link from "next/link";
import { LayoutDashboard, Users, ClipboardList, ShoppingBag, Map, Settings, Truck, MessageSquare, LifeBuoy } from "lucide-react";

// ... AdminLayout 保持不变 ...

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
    >
      {icon}
      {label}
    </Link>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            WeChat Admin
          </h1>
          <p className="text-xs text-slate-500 mt-1">Next.js 全栈后台</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem href="/admin" icon={<LayoutDashboard size={20} />} label="仪表盘" />
          
          <div className="pt-4 pb-2 text-xs font-semibold text-slate-400 px-3">运营</div>
          <NavItem href="/admin/users" icon={<Users size={20} />} label="用户管理" />
          <NavItem href="/admin/orders" icon={<Truck size={20} />} label="订单管理" />
          <NavItem href="/admin/records" icon={<ClipboardList size={20} />} label="打卡记录" />
          <NavItem href="/admin/posts" icon={<MessageSquare size={20} />} label="社区管理" />
          <NavItem href="/admin/complaints" icon={<LifeBuoy size={20} />} label="反馈管理" />
          
          <div className="pt-4 pb-2 text-xs font-semibold text-slate-400 px-3">资源</div>
          <NavItem href="/admin/tasks" icon={<Map size={20} />} label="任务配置" />
          <NavItem href="/admin/products" icon={<ShoppingBag size={20} />} label="商品管理" />
          
          <div className="pt-4 pb-2 text-xs font-semibold text-slate-400 px-3">系统</div>
          <NavItem href="/admin/settings" icon={<Settings size={20} />} label="系统设置" />
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
