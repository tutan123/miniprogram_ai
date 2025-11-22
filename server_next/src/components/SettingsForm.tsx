'use client'

import { updateSystemConfig } from '@/app/actions/system'

interface SettingsFormProps {
  configs: Record<string, string>
}

export default function SettingsForm({ configs }: SettingsFormProps) {
  return (
    <form action={updateSystemConfig} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 pb-2 border-b border-slate-100">基本设置</h3>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">小程序名称</label>
          <input 
            name="cfg_app_name" 
            defaultValue={configs['app_name'] || 'WeChat Map App'}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">维护模式</label>
          <select 
            name="cfg_maintenance_mode" 
            defaultValue={configs['maintenance_mode'] || 'false'}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="false">关闭 (正常运行)</option>
            <option value="true">开启 (暂停服务)</option>
          </select>
          <p className="text-xs text-slate-400 mt-1">开启后，用户打开小程序将看到维护提示</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 pb-2 border-b border-slate-100">积分规则</h3>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">新用户注册奖励</label>
          <input 
            name="cfg_new_user_points" 
            type="number"
            defaultValue={configs['new_user_points'] || '0'}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
      </div>

      <div className="pt-4">
        <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition font-medium">
          保存设置
        </button>
      </div>
    </form>
  )
}

