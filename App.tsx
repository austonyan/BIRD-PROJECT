import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import { db } from './services/mockDb';
import { User, Bird, Request, Progress, Role, RequestType, UserStatus } from './types';
import { polishContent } from './services/geminiService';
import { 
  Plus, Search, CheckCircle, XCircle, Clock, 
  Sparkles, UserPlus, FileEdit, Calendar, Activity,
  Users as UsersIcon, Bird as BirdIcon, AlertCircle,
  User as UserIcon, List, Eye, Briefcase, Banknote, Coffee, 
  RefreshCw, PauseCircle, FilePlus, Gavel, UserCog, Star,
  MessageSquare, Trash2, ChevronRight, Lock, Edit2, Ban, PauseOctagon,
  Network
} from 'lucide-react';

const roleLabels: Record<string, string> = {
  admin: '管理员',
  leader: '领班',
  volunteer: '志愿者'
};

// --- Sub-Components ---

// 1. User Management (Admin Only)
const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState<{ name: string; role: Role; leaderId: string }>({ name: '', role: 'volunteer', leaderId: '' });
  
  // Edit State
  const [editUserModal, setEditUserModal] = useState<{isOpen: boolean, user: User | null}>({isOpen: false, user: null});
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  const leaders = users.filter(u => u.role === 'leader' && u.status !== 'banned');

  const getLeaderName = (leaderId?: string) => {
    if (!leaderId) return null;
    return users.find(u => u.id === leaderId)?.name || leaderId;
  };

  const countTeamMembers = (leaderId: string, currentUserId?: string) => {
    return users.filter(u => u.leaderId === leaderId && u.id !== currentUserId).length;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newUser.role === 'volunteer' && newUser.leaderId) {
        if (countTeamMembers(newUser.leaderId) >= 5) {
          alert("该领班已负责5名志愿者，无法继续分配！");
          return;
        }
      }

      const generatedUsername = db.getNextUsername();
      db.createUser({ 
        username: generatedUsername, 
        name: newUser.name, 
        role: newUser.role, 
        password: 'ZCFE2026',
        leaderId: newUser.role === 'volunteer' ? newUser.leaderId : undefined
      });
      setUsers(db.getUsers());
      setShowForm(false);
      setLastCreatedId(generatedUsername);
      setNewUser({ name: '', role: 'volunteer', leaderId: '' });
      alert(`用户创建成功！\n工号: ${generatedUsername}\n默认密码: ZCFE2026`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editUserModal.user) {
      // Validate leader limit if assigning a new leader
      if (editUserModal.user.role === 'volunteer' && editUserModal.user.leaderId) {
        if (countTeamMembers(editUserModal.user.leaderId, editUserModal.user.id) >= 5) {
           alert("该领班已负责5名志愿者，无法继续分配！");
           return;
        }
      }

      db.updateUser(editUserModal.user.id, { 
        name: editUserModal.user.name, 
        role: editUserModal.user.role,
        status: editUserModal.user.status,
        suspensionEndDate: editUserModal.user.status === 'suspended' ? editUserModal.user.suspensionEndDate : undefined,
        banReason: editUserModal.user.status === 'banned' ? editUserModal.user.banReason : undefined,
        leaderId: editUserModal.user.role === 'volunteer' ? editUserModal.user.leaderId : undefined
      });
      setUsers(db.getUsers());
      setEditUserModal({ isOpen: false, user: null });
    }
  };

  const getStatusBadge = (user: User) => {
    switch (user.status) {
      case 'banned':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><Ban size={12}/> 已停用</span>;
      case 'suspended':
        return (
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit" title={`至 ${user.suspensionEndDate}`}>
            <PauseOctagon size={12}/> 暂休 ({user.suspensionEndDate})
          </span>
        );
      default:
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><CheckCircle size={12}/> 正常</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">用户管理</h2>
          <p className="text-sm text-gray-500 mt-1">管理系统内所有人员账号</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
          <UserPlus size={18} /> 录入新员工
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">录入新员工信息</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">工号</label>
              <div className="mt-1 px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 text-sm">
                系统自动生成 (如: {db.getNextUsername()})
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">姓名</label>
              <input 
                required type="text" placeholder="真实姓名"
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500"
                value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">角色</label>
              <select 
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500"
                value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
              >
                <option value="volunteer">志愿者</option>
                <option value="leader">领班</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            {newUser.role === 'volunteer' && (
              <div className="md:col-span-3">
                 <label className="block text-sm font-medium text-gray-700">直属领班 (可选)</label>
                 <select 
                   className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500"
                   value={newUser.leaderId}
                   onChange={e => setNewUser({...newUser, leaderId: e.target.value})}
                 >
                   <option value="">-- 无 / 暂未分配 --</option>
                   {leaders.map(l => (
                     <option key={l.id} value={l.id} disabled={countTeamMembers(l.id) >= 5}>
                       {l.name} ({l.username}) - 现有队员 {countTeamMembers(l.id)}/5
                     </option>
                   ))}
                 </select>
              </div>
            )}
            <div className="md:col-span-3 text-sm text-gray-500 bg-blue-50 p-2 rounded border border-blue-100">
              提示：默认初始密码为 <strong>ZCFE2026</strong> (用户首次登录需修改)
            </div>
            <div className="md:col-span-3 flex justify-end">
               <button type="submit" className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 shadow-sm transition-colors font-medium">确认录入</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">直属领班</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(u => (
              <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.username === lastCreatedId ? 'bg-green-50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600">{u.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{u.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'leader' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {roleLabels[u.role]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {u.role === 'volunteer' && u.leaderId ? (
                     <span className="flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs w-fit">
                       <UserCog size={12}/> {getLeaderName(u.leaderId)}
                     </span>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getStatusBadge(u)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => setEditUserModal({ isOpen: true, user: u })}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editUserModal.isOpen && editUserModal.user && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
             <h3 className="text-lg font-bold mb-4">编辑用户信息</h3>
             <form onSubmit={handleUpdateUser} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700">工号 (不可修改)</label>
                  <input type="text" disabled className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-lg shadow-sm p-2.5 border text-gray-500" value={editUserModal.user.username} />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700">姓名</label>
                  <input 
                    required type="text" 
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"
                    value={editUserModal.user.name} 
                    onChange={e => setEditUserModal({
                      ...editUserModal, 
                      user: editUserModal.user ? { ...editUserModal.user, name: e.target.value } : null 
                    })}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700">角色</label>
                  <select 
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"
                    value={editUserModal.user.role} 
                    onChange={e => setEditUserModal({
                      ...editUserModal, 
                      user: editUserModal.user ? { ...editUserModal.user, role: e.target.value as Role } : null
                    })}
                  >
                    <option value="volunteer">志愿者</option>
                    <option value="leader">领班</option>
                    <option value="admin">管理员</option>
                  </select>
               </div>

               {editUserModal.user.role === 'volunteer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">直属领班</label>
                    <select 
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"
                      value={editUserModal.user.leaderId || ''}
                      onChange={e => setEditUserModal({
                        ...editUserModal,
                        user: editUserModal.user ? { ...editUserModal.user, leaderId: e.target.value } : null
                      })}
                    >
                      <option value="">-- 无 / 暂未分配 --</option>
                      {leaders.map(l => (
                        <option key={l.id} value={l.id} disabled={countTeamMembers(l.id, editUserModal.user?.id) >= 5}>
                          {l.name} ({l.username}) - 现有队员 {countTeamMembers(l.id, editUserModal.user?.id)}/5
                        </option>
                      ))}
                    </select>
                  </div>
               )}

               <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="block text-sm font-bold text-gray-700 mb-2">账户状态</label>
                  <select 
                    className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"
                    value={editUserModal.user.status}
                    onChange={e => setEditUserModal({
                      ...editUserModal, 
                      user: editUserModal.user ? { ...editUserModal.user, status: e.target.value as UserStatus } : null
                    })}
                  >
                    <option value="normal">正常 (Normal)</option>
                    <option value="suspended">暂时休眠 (Suspended)</option>
                    <option value="banned">停用 (Banned)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    {editUserModal.user.status === 'banned' && "该账户将无法登录系统。"}
                    {editUserModal.user.status === 'suspended' && "账户休眠中，需要设置休眠截止日期。"}
                  </p>
                  
                  {editUserModal.user.status === 'suspended' && (
                     <div className="mt-3">
                       <label className="block text-xs font-medium text-gray-600 mb-1">休眠截止日期</label>
                       <input 
                          type="date"
                          required
                          className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border text-sm"
                          value={editUserModal.user.suspensionEndDate || ''}
                          onChange={e => setEditUserModal({
                            ...editUserModal,
                            user: editUserModal.user ? { ...editUserModal.user, suspensionEndDate: e.target.value } : null
                          })}
                       />
                     </div>
                  )}

                  {editUserModal.user.status === 'banned' && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">封禁原因 (选填)</label>
                      <textarea
                        className="block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border text-sm"
                        rows={2}
                        placeholder="请输入封禁原因..."
                        value={editUserModal.user.banReason || ''}
                        onChange={e => setEditUserModal({
                          ...editUserModal,
                          user: editUserModal.user ? { ...editUserModal.user, banReason: e.target.value } : null
                        })}
                      />
                    </div>
                  )}
               </div>

               <div className="flex justify-end gap-2 mt-6">
                 <button type="button" onClick={() => setEditUserModal({isOpen: false, user: null})} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
                 <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg">保存</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. Org Chart Component
const OrgChart = () => {
  const users = db.getUsers();
  const admins = users.filter(u => u.role === 'admin');
  const leaders = users.filter(u => u.role === 'leader');
  const unassignedVolunteers = users.filter(u => u.role === 'volunteer' && !u.leaderId);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">组织架构</h2>
           <p className="text-sm text-gray-500 mt-1">查看系统内的团队分组情况</p>
        </div>
      </div>

      {/* Admins */}
      <div>
         <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">管理层 (Admins)</h3>
         <div className="flex flex-wrap gap-4">
            {admins.map(admin => (
              <div key={admin.id} className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-center gap-3 w-64 shadow-sm">
                <div className="w-10 h-10 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center font-bold">
                   <UserCog size={20} />
                </div>
                <div>
                   <div className="font-bold text-gray-800">{admin.name}</div>
                   <div className="text-xs text-gray-500 font-mono">{admin.username}</div>
                </div>
              </div>
            ))}
         </div>
      </div>

      {/* Teams */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">分组团队 (Teams)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {leaders.map(leader => {
              const teamMembers = users.filter(u => u.leaderId === leader.id);
              return (
                 <div key={leader.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                    <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center font-bold">
                             <Briefcase size={20} />
                          </div>
                          <div>
                             <div className="font-bold text-gray-800">{leader.name} <span className="text-xs font-normal text-gray-500">(领班)</span></div>
                             <div className="text-xs text-gray-500 font-mono">{leader.username}</div>
                          </div>
                       </div>
                       <span className={`text-xs px-2 py-1 rounded font-medium ${teamMembers.length >= 5 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          {teamMembers.length} / 5 人
                       </span>
                    </div>
                    <div className="p-4 flex-1">
                       {teamMembers.length > 0 ? (
                         <ul className="space-y-2">
                            {teamMembers.map(member => (
                               <li key={member.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                  <span className="text-sm font-medium text-gray-700">{member.name}</span>
                                  <span className="text-xs text-gray-400 ml-auto font-mono">{member.username}</span>
                               </li>
                            ))}
                         </ul>
                       ) : (
                         <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                            暂无组员
                         </div>
                       )}
                    </div>
                 </div>
              );
           })}
        </div>
      </div>

      {/* Unassigned */}
      {unassignedVolunteers.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">未分配志愿者 (Unassigned)</h3>
          <div className="flex flex-wrap gap-4">
             {unassignedVolunteers.map(vol => (
               <div key={vol.id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex items-center gap-3 w-56">
                 <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center">
                    <UserIcon size={16} />
                 </div>
                 <div>
                    <div className="font-medium text-gray-700 text-sm">{vol.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{vol.username}</div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 3. Bird Management
const BirdManagement = ({ user }: { user: User }) => {
  const [allBirds, setAllBirds] = useState<Bird[]>(db.getBirds());
  const [allUsers] = useState<User[]>(db.getUsers());
  const [volunteers] = useState<User[]>(db.getUsers().filter(u => u.role === 'volunteer'));
  const [showForm, setShowForm] = useState(false);
  const [editingBird, setEditingBird] = useState<Partial<Bird>>({});

  // Visibility Logic
  const visibleBirds = allBirds.filter(bird => {
    // Admin sees all
    if (user.role === 'admin') return true;
    
    // Leader sees their own assigned birds AND birds assigned to their team members
    if (user.role === 'leader') {
      if (bird.assigned_volunteer_id === user.id) return true; // Directly assigned
      
      const assignedUser = allUsers.find(u => u.id === bird.assigned_volunteer_id);
      // If the bird is assigned to a volunteer who reports to this leader
      if (assignedUser && assignedUser.leaderId === user.id) return true;
      
      return false;
    }
    
    // Volunteer only sees their own assigned birds
    if (user.role === 'volunteer') {
      return bird.assigned_volunteer_id === user.id;
    }
    
    return false;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBird.id) {
      db.updateBird(editingBird.id, editingBird);
    } else {
      db.createBird(editingBird as any);
    }
    setAllBirds(db.getBirds());
    setShowForm(false);
    setEditingBird({});
  };

  const startEdit = (bird: Bird) => {
    setEditingBird(bird);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">小候鸟档案</h2>
          <p className="text-sm text-gray-500 mt-1">查看和管理受助儿童信息</p>
        </div>
        {['admin', 'leader'].includes(user.role) && (
          <button onClick={() => { setEditingBird({}); setShowForm(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
            <Plus size={18} /> 新增档案
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleBirds.map(bird => {
          const assignedVol = allUsers.find(v => v.username === bird.assigned_volunteer_id || v.id === bird.assigned_volunteer_id);
          return (
            <div key={bird.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                    <BirdIcon size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{bird.name}</h3>
                </div>
                {['admin', 'leader'].includes(user.role) && (
                  <button onClick={() => startEdit(bird)} className="text-gray-400 hover:text-blue-600 p-1">
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-4 min-h-[40px]">{bird.info}</p>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="text-gray-500">负责人:</span>
                {assignedVol ? (
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">{assignedVol.name}</span>
                ) : (
                  <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md">待分配</span>
                )}
              </div>
            </div>
          );
        })}
        {visibleBirds.length === 0 && (
           <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
             {user.role === 'volunteer' ? '您名下暂无负责的小候鸟。' : '暂无相关档案。'}
           </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">{editingBird.id ? '编辑档案' : '新建档案'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">姓名</label>
                <input required type="text" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"
                  value={editingBird.name || ''} onChange={e => setEditingBird({...editingBird, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">基本情况</label>
                <textarea required rows={3} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"
                  value={editingBird.info || ''} onChange={e => setEditingBird({...editingBird, info: e.target.value})} />
              </div>
              {['admin', 'leader'].includes(user.role) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">指派志愿者</label>
                  <select className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"
                    value={editingBird.assigned_volunteer_id || ''} 
                    onChange={e => setEditingBird({...editingBird, assigned_volunteer_id: e.target.value || null})}
                  >
                    <option value="">-- 未分配 --</option>
                    {volunteers.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.username})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. Request Management
const RequestManagement = ({ user }: { user: User }) => {
  const [requests, setRequests] = useState<Request[]>(db.getRequests());
  const [allUsers] = useState<User[]>(db.getUsers());
  const [showForm, setShowForm] = useState(false);
  const [newRequest, setNewRequest] = useState<Partial<Request>>({ type: '资金' });
  const [isPolishing, setIsPolishing] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRequest.content) {
      db.createRequest({ ...newRequest, applicant_id: user.id } as any);
      setRequests(db.getRequests());
      setShowForm(false);
      setNewRequest({ type: '资金' });
    }
  };

  const handleStatusChange = (id: string, status: '已批准' | '已驳回', reason?: string) => {
    db.updateRequestStatus(id, status, user.id, reason);
    setRequests(db.getRequests());
  };

  const polish = async () => {
    if (!newRequest.content) return;
    setIsPolishing(true);
    const polished = await polishContent(newRequest.content, 'request');
    setNewRequest({ ...newRequest, content: polished });
    setIsPolishing(false);
  };

  // Filter requests based on role
  const visibleRequests = requests.filter(r => {
    const applicant = allUsers.find(u => u.id === r.applicant_id);

    // Admin sees all
    if (user.role === 'admin') return true;

    // Leader sees their own requests AND requests from their direct subordinates
    if (user.role === 'leader') {
      if (r.applicant_id === user.id) return true;
      if (applicant && applicant.leaderId === user.id) return true;
      return false;
    }

    // Volunteer sees only their own
    if (user.role === 'volunteer') {
      return r.applicant_id === user.id;
    }
    
    return false;
  }).sort((a, b) => (a.status === '待审批' ? -1 : 1));

  const canApprove = (request: Request) => {
    if (request.status !== '待审批') return false;
    
    const applicant = allUsers.find(u => u.id === request.applicant_id);
    if (!applicant) return false;

    // Leader can only approve their own team members (Volunteers)
    if (user.role === 'leader' && applicant.leaderId === user.id) return true;

    // Admin can only approve Leaders
    if (user.role === 'admin' && applicant.role === 'leader') return true;

    return false;
  };

  const getTypeIcon = (type: RequestType) => {
    switch(type) {
      case '资金': return <Banknote size={16} />;
      case '请假': return <Coffee size={16} />;
      case '调班': return <RefreshCw size={16} />;
      case '暂休': return <PauseCircle size={16} />;
      default: return <FilePlus size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case '待审批': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><Clock size={12}/> 待审批</span>;
      case '已批准': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle size={12}/> 已批准</span>;
      case '已驳回': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><XCircle size={12}/> 已驳回</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">申请与审批</h2>
          <p className="text-sm text-gray-500 mt-1">处理资金、请假及调班申请</p>
        </div>
        {/* Only Volunteers and Leaders can create requests */}
        {['volunteer', 'leader'].includes(user.role) && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
            <Plus size={18} /> 新申请
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">内容摘要</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请人</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                {(user.role === 'leader' || user.role === 'admin') && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {visibleRequests.map(r => {
                 const applicant = allUsers.find(u => u.id === r.applicant_id);
                 return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex items-center gap-2 font-medium">
                        {getTypeIcon(r.type)} {r.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={r.content}>
                      {r.content}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex flex-col">
                         <span>{applicant?.name || r.applicant_id}</span>
                         {applicant?.role && <span className="text-xs text-gray-400">{roleLabels[applicant.role]}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(r.status)}
                    </td>
                    {(user.role === 'leader' || user.role === 'admin') && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {canApprove(r) ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleStatusChange(r.id, '已批准')} className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded-md hover:bg-green-100 transition-colors" title="批准">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => handleStatusChange(r.id, '已驳回', prompt('请输入驳回理由:') || '')} className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors" title="驳回">
                              <XCircle size={18} />
                            </button>
                          </div>
                        ) : (
                          // Optional: Show lock or info icon if they can view but not approve
                          r.status === '待审批' && (
                             <span className="text-xs text-gray-400 italic">无审批权</span>
                          )
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {visibleRequests.length === 0 && (
                 <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                     暂无申请记录
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">提交新申请</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">类型</label>
                <select className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"
                  value={newRequest.type} onChange={e => setNewRequest({...newRequest, type: e.target.value as RequestType})}>
                  <option value="资金">资金申请</option>
                  <option value="请假">请假</option>
                  <option value="调班">调班</option>
                  <option value="暂休">志愿者暂休</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 flex justify-between">
                  详情描述
                  <button type="button" onClick={polish} disabled={isPolishing} className="text-purple-600 text-xs flex items-center gap-1 hover:underline disabled:opacity-50">
                    <Sparkles size={12} /> {isPolishing ? 'AI 润色中...' : 'AI 润色'}
                  </button>
                </label>
                <textarea required rows={4} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"
                  placeholder="请输入具体申请内容..."
                  value={newRequest.content || ''} onChange={e => setNewRequest({...newRequest, content: e.target.value})} />
              </div>
              {newRequest.type === '资金' && (
                <div>
                   <label className="block text-sm font-medium text-gray-700">金额 (元)</label>
                   <input type="number" className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"
                     value={newRequest.amount || ''} onChange={e => setNewRequest({...newRequest, amount: Number(e.target.value)})} />
                </div>
              )}
              {/* Added support for date inputs for '暂休' type */}
              {(newRequest.type === '请假' || newRequest.type === '调班' || newRequest.type === '暂休') && (
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700">开始日期</label>
                     <input type="date" required={newRequest.type === '暂休'} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"
                       value={newRequest.startDate || ''} onChange={e => setNewRequest({...newRequest, startDate: e.target.value})} />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700">结束日期</label>
                     <input type="date" required={newRequest.type === '暂休'} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"
                       value={newRequest.endDate || ''} onChange={e => setNewRequest({...newRequest, endDate: e.target.value})} />
                   </div>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg">提交申请</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. Progress Tracking
const ProgressManagement = ({ user }: { user: User }) => {
  const [progress, setProgress] = useState<Progress[]>(db.getProgress());
  const [birds] = useState<Bird[]>(db.getBirds());
  const [showForm, setShowForm] = useState(false);
  const [newProgress, setNewProgress] = useState<Partial<Progress>>({});
  const [isPolishing, setIsPolishing] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProgress.content && newProgress.bird_id) {
      db.createProgress({ ...newProgress, volunteer_id: user.id } as any);
      setProgress(db.getProgress());
      setShowForm(false);
      setNewProgress({});
    }
  };

  const polish = async () => {
    if (!newProgress.content) return;
    setIsPolishing(true);
    const polished = await polishContent(newProgress.content, 'progress');
    setNewProgress({ ...newProgress, content: polished });
    setIsPolishing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">帮扶记录</h2>
          <p className="text-sm text-gray-500 mt-1">记录每一次志愿服务与小候鸟的成长</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
          <FileEdit size={18} /> 写记录
        </button>
      </div>

      <div className="grid gap-4">
        {progress.map(p => {
          const bird = birds.find(b => b.id === p.bird_id);
          const volunteer = db.getUsers().find(u => u.id === p.volunteer_id);
          return (
            <div key={p.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                 <h4 className="font-bold text-gray-900 flex items-center gap-2">
                   <BirdIcon size={16} className="text-orange-500"/> 
                   {bird?.name || '未知儿童'}
                 </h4>
                 <span className="text-xs text-gray-400 flex items-center gap-1">
                   <Calendar size={12} /> {p.date}
                 </span>
              </div>
              <p className="text-gray-700 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                "{p.content}"
              </p>
              <div className="mt-3 flex justify-end">
                <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                  记录人: {volunteer?.name || p.volunteer_id}
                </span>
              </div>
            </div>
          );
        })}
        {progress.length === 0 && (
           <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
             暂无帮扶记录，开始您的第一次服务吧！
           </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">新增帮扶记录</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">关联小候鸟</label>
                <select required className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"
                  value={newProgress.bird_id || ''} onChange={e => setNewProgress({...newProgress, bird_id: e.target.value})}>
                  <option value="">-- 请选择 --</option>
                  {birds.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 flex justify-between">
                  记录内容
                  <button type="button" onClick={polish} disabled={isPolishing} className="text-purple-600 text-xs flex items-center gap-1 hover:underline disabled:opacity-50">
                    <Sparkles size={12} /> {isPolishing ? 'AI 润色中...' : 'AI 润色'}
                  </button>
                </label>
                <textarea required rows={5} className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"
                  placeholder="今天发生了什么？小候鸟有什么变化？"
                  value={newProgress.content || ''} onChange={e => setNewProgress({...newProgress, content: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg">保存记录</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 6. Dashboard
const Dashboard = ({ user, setActiveTab }: { user: User, setActiveTab: (tab: string) => void }) => {
  const birds = db.getBirds();
  const myBirds = birds.filter(b => b.assigned_volunteer_id === user.id);
  const requests = db.getRequests();
  const pendingRequests = requests.filter(r => r.status === '待审批' && (user.role !== 'volunteer' || r.applicant_id === user.id));
  const progress = db.getProgress();

  return (
     <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">欢迎回来, {user.name} 👋</h2>
          <p className="text-sm text-gray-500 mt-1">今天是 {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => setActiveTab('birds')} className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-md cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1">
             <div className="flex justify-between items-center mb-4">
               <div className="bg-white/20 p-2 rounded-lg"><BirdIcon size={24} /></div>
               <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">总档案</span>
             </div>
             <div className="text-4xl font-bold mb-1">{birds.length}</div>
             <div className="text-blue-100 text-sm">位小候鸟受助中</div>
          </div>
          
          <div onClick={() => setActiveTab('requests')} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all hover:border-blue-300">
             <div className="flex justify-between items-center mb-4">
               <div className="bg-orange-100 text-orange-600 p-2 rounded-lg"><Gavel size={24} /></div>
               <span className="text-sm font-medium text-gray-500">待办事项</span>
             </div>
             <div className="text-4xl font-bold text-gray-800 mb-1">{pendingRequests.length}</div>
             <div className="text-gray-500 text-sm">条申请待处理/审批</div>
          </div>

          <div onClick={() => setActiveTab('progress')} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all hover:border-green-300">
             <div className="flex justify-between items-center mb-4">
               <div className="bg-green-100 text-green-600 p-2 rounded-lg"><Activity size={24} /></div>
               <span className="text-sm font-medium text-gray-500">本月服务</span>
             </div>
             <div className="text-4xl font-bold text-gray-800 mb-1">{progress.length}</div>
             <div className="text-gray-500 text-sm">次帮扶记录已提交</div>
          </div>
        </div>

        {/* Quick Actions or Recent Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Star className="text-yellow-400" size={18}/> 我的小候鸟</h3>
              {myBirds.length > 0 ? (
                <ul className="space-y-3">
                  {myBirds.map(b => (
                    <li key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                      <span className="font-medium text-gray-700">{b.name}</span>
                      <span className="text-xs text-gray-400">{b.info.substring(0, 20)}...</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400 text-sm text-center py-6">暂无分配的小候鸟</div>
              )}
           </div>

           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Clock className="text-blue-400" size={18}/> 最近动态</h3>
              {progress.length > 0 ? (
                <div className="space-y-4">
                   {progress.slice(0, 3).map(p => (
                     <div key={p.id} className="flex gap-3 items-start">
                        <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm text-gray-800 line-clamp-2">{p.content}</p>
                          <p className="text-xs text-gray-400 mt-1">{p.date}</p>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm text-center py-6">暂无动态</div>
              )}
           </div>
        </div>
     </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Check for session on load
  useEffect(() => {
    const currentUser = db.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Check for default password on login
  useEffect(() => {
    if (user) {
      // Demo accounts that are exempted from forced password change
      const demoAccounts = ['00000', '00001', '00002'];
      const isDemo = demoAccounts.includes(user.username);

      if (user.password === 'ZCFE2026' && !isDemo) {
        setShowPasswordModal(true);
      } else {
        setShowPasswordModal(false);
      }
    }
  }, [user]);

  const handleLogout = () => {
    db.logout();
    setUser(null);
    setActiveTab('dashboard');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert("密码长度至少需6位");
      return;
    }
    if (user) {
      db.changePassword(user.id, newPassword);
      // Refresh user to update state
      const updatedUser = db.getCurrentUser();
      setUser(updatedUser);
      setShowPasswordModal(false);
      setNewPassword('');
      alert("密码修改成功！");
    }
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Layout user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
      {activeTab === 'dashboard' && <Dashboard user={user} setActiveTab={setActiveTab} />}
      {activeTab === 'users' && user.role === 'admin' && <UserManagement />}
      {activeTab === 'org' && user.role === 'admin' && <OrgChart />}
      {activeTab === 'birds' && <BirdManagement user={user} />}
      {activeTab === 'requests' && <RequestManagement user={user} />}
      {activeTab === 'progress' && <ProgressManagement user={user} />}
      
      {/* Fallback for unauthorized access to Users tab */}
      {activeTab === 'users' && user.role !== 'admin' && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
           <AlertCircle size={48} className="mb-4 text-red-400" />
           <p>您没有权限访问此页面</p>
        </div>
      )}

      {/* Force Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex flex-col items-center mb-6">
               <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                 <Lock size={24} />
               </div>
               <h3 className="text-xl font-bold text-gray-900">首次登录需修改密码</h3>
               <p className="text-sm text-gray-500 text-center mt-2">为了您的账户安全，请修改初始默认密码。</p>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                <input 
                  type="password" 
                  required 
                  minLength={6}
                  className="w-full border-gray-300 rounded-lg shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入至少6位新密码"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                确认修改
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;