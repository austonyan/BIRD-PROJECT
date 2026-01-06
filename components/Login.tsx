import React, { useState } from 'react';
import { db } from '../services/mockDb';
import { User } from '../types';
import { Bird, Lock, User as UserIcon, HelpCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = db.login(username, password);
    
    if (result.user) {
      onLogin(result.user);
    } else {
      setError(result.error || '工号或密码错误');
    }
  };

  const demoAccounts = [
    { role: '管理员 (Admin)', id: '00000', pass: 'ZCFE2026', desc: '全权管理' },
    { role: '领班 (Leader)', id: '00001', pass: 'ZCFE2026', desc: '审批与分配' },
    { role: '志愿者 (Volunteer)', id: '00002', pass: 'ZCFE2026', desc: '日常服务' },
  ];

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Bird size={40} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          小候鸟管理系统
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          志愿者服务平台
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-8 shadow-xl rounded-2xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                工号 (Worker ID)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon size={18} className="text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入5位工号"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码 (Password)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 animate-fade-in">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                登 录
              </button>
            </div>
          </form>

          {/* Demo Accounts Section */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 flex items-center gap-1 font-medium">
                  <HelpCircle size={14} /> 测试账号 (演示用)
                </span>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工号</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">初始密码</th>
                    </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                    {demoAccounts.map((acc, idx) => (
                      <tr 
                        key={idx} 
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => { setUsername(acc.id); setPassword(acc.pass); }}
                        title="点击自动填充"
                      >
                         <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">{acc.role}</td>
                         <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600 font-mono">{acc.id}</td>
                         <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 font-mono">{acc.pass}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
              <div className="px-3 py-2 bg-yellow-50 text-xs text-yellow-700 text-center border-t border-yellow-100">
                注：首次登录强制要求修改密码
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;