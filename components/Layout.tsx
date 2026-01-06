import React from 'react';
import { User } from '../types';
import { 
  Users, 
  Bird, 
  FileText, 
  LogOut, 
  Activity, 
  LayoutDashboard,
  ShieldCheck,
  Network
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, activeTab, setActiveTab, onLogout }) => {
  
  const getNavItems = () => {
    // Role-based navigation visibility
    const items = [
      { id: 'dashboard', label: '仪表盘 (Dashboard)', icon: LayoutDashboard, roles: ['admin', 'leader', 'volunteer'] },
      { id: 'users', label: '用户管理', icon: Users, roles: ['admin'] },
      { id: 'org', label: '组织架构', icon: Network, roles: ['admin'] },
      { id: 'birds', label: '小候鸟档案', icon: Bird, roles: ['admin', 'leader', 'volunteer'] },
      { id: 'requests', label: '申请/审批', icon: FileText, roles: ['admin', 'leader', 'volunteer'] },
      { id: 'progress', label: '帮扶记录', icon: Activity, roles: ['admin', 'leader', 'volunteer'] },
    ];

    return items.filter(item => item.roles.includes(user.role));
  };

  const navItems = getNavItems();

  const getRoleName = (role: string) => {
    switch(role) {
      case 'admin': return '管理员';
      case 'leader': return '领班';
      case 'volunteer': return '志愿者';
      default: return role;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Bird size={20} />
          </div>
          <span className="font-bold text-lg text-gray-800 tracking-tight">小候鸟系统</span>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">当前用户</div>
          <div className="flex items-center gap-2 mb-1">
             <div className="font-bold text-gray-900 truncate">{user.name}</div>
          </div>
          <div className="flex items-center gap-1 text-sm text-blue-600">
             <ShieldCheck size={14} />
             <span className="font-medium">{getRoleName(user.role)}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1 font-mono">ID: {user.username}</div>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon size={19} className={activeTab === item.id ? 'text-blue-600' : 'text-gray-400'} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;