import { User, Bird, Request, Progress, Role, UserStatus } from '../types';

// Storage Keys
const KEYS = {
  USERS: 'lmb_users',
  BIRDS: 'lmb_birds',
  REQUESTS: 'lmb_requests',
  PROGRESS: 'lmb_progress',
  CURRENT_USER: 'lmb_current_user',
};

// Default Admin Credentials
const DEFAULT_ADMIN = {
  username: '00000',
  password: 'ZCFE2026', // In a real app, verify hash. Here we store plain for demo simplicity or mock hash.
};

// Helper to simulate ID generation
const generateId = () => Math.random().toString(36).substr(2, 9);

class MockDB {
  constructor() {
    this.init();
  }

  init() {
    // --- 1. Initialize Users ---
    const usersStr = localStorage.getItem(KEYS.USERS);
    let users: User[] = usersStr ? JSON.parse(usersStr) : [];
    let dataModified = false;

    // Define all demo users
    const demoUsers: User[] = [
        // Admin
        { id: 'admin_00', username: DEFAULT_ADMIN.username, password: DEFAULT_ADMIN.password, role: 'admin', name: '超级管理员', status: 'normal' },
        
        // Team 1: Leader Zhang
        { id: 'leader_01', username: '00001', password: 'ZCFE2026', role: 'leader', name: '张领班', status: 'normal' },
        { id: 'vol_02', username: '00002', password: 'ZCFE2026', role: 'volunteer', name: '李志愿者', status: 'normal', leaderId: 'leader_01' },
        { id: 'vol_04', username: '00004', password: 'ZCFE2026', role: 'volunteer', name: '赵一', status: 'normal', leaderId: 'leader_01' },
        { id: 'vol_05', username: '00005', password: 'ZCFE2026', role: 'volunteer', name: '钱二', status: 'normal', leaderId: 'leader_01' },
        { id: 'vol_06', username: '00006', password: 'ZCFE2026', role: 'volunteer', name: '孙三', status: 'normal', leaderId: 'leader_01' },

        // Team 2: Leader Wang
        { id: 'leader_02', username: '00003', password: 'ZCFE2026', role: 'leader', name: '王领班', status: 'normal' },
        { id: 'vol_07', username: '00007', password: 'ZCFE2026', role: 'volunteer', name: '李四', status: 'normal', leaderId: 'leader_02' },
        { id: 'vol_08', username: '00008', password: 'ZCFE2026', role: 'volunteer', name: '周五', status: 'normal', leaderId: 'leader_02' },
        { id: 'vol_10', username: '00010', password: 'ZCFE2026', role: 'volunteer', name: '郑七', status: 'suspended', suspensionEndDate: '2025-01-01', leaderId: 'leader_02' },

        // Unassigned / Others
        { id: 'vol_09', username: '00009', password: 'ZCFE2026', role: 'volunteer', name: '吴六', status: 'normal', leaderId: undefined },
    ];

    demoUsers.forEach(u => {
        if (!users.some(existing => existing.username === u.username)) {
            users.push(u);
            dataModified = true;
        }
    });

    // Backfill status for existing users if missing (migration)
    users = users.map(u => ({
      ...u,
      status: u.status || 'normal'
    }));
    
    // Always save to ensure backfill is persisted
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));

    // --- 2. Initialize Birds (if empty) ---
    const birdsStr = localStorage.getItem(KEYS.BIRDS);
    let birds: Bird[] = birdsStr ? JSON.parse(birdsStr) : [];
    
    // Add demo birds if they don't exist
    const demoBirds = [
      { id: 'bird_01', name: '小明', info: '8岁，父母在外务工，性格内向，喜爱绘画。', assigned_volunteer_id: 'vol_02' },
      { id: 'bird_02', name: '小红', info: '10岁，目前随祖父母居住，学习成绩优异，需要课外书籍支持。', assigned_volunteer_id: null },
      { id: 'bird_03', name: '小强', info: '6岁，活泼好动，需要周末陪伴。', assigned_volunteer_id: 'vol_02' },
      { id: 'bird_04', name: '小兰', info: '9岁，非常懂事，希望能有志愿者辅导数学作业。', assigned_volunteer_id: 'vol_04' },
      { id: 'bird_05', name: '小刚', info: '11岁，体育特长生，需要运动装备支持。', assigned_volunteer_id: 'vol_05' },
      { id: 'bird_06', name: '小梅', info: '7岁，有些自闭倾向，需要心理疏导和耐心陪伴。', assigned_volunteer_id: null },
      { id: 'bird_07', name: '小丁', info: '12岁，初中生，需要英语辅导。', assigned_volunteer_id: 'vol_07' },
      { id: 'bird_08', name: '小宝', info: '5岁，学龄前，需要看护。', assigned_volunteer_id: 'vol_08' },
    ];
    
    let birdsModified = false;
    demoBirds.forEach(demoBird => {
      if (!birds.some(b => b.name === demoBird.name)) {
        birds.push({ ...demoBird, id: generateId() });
        birdsModified = true;
      }
    });
    
    if (birdsModified) {
      localStorage.setItem(KEYS.BIRDS, JSON.stringify(birds));
    }

    // --- 3. Initialize Requests (if empty) ---
    const requestsStr = localStorage.getItem(KEYS.REQUESTS);
    let requests: Request[] = requestsStr ? JSON.parse(requestsStr) : [];

    if (requests.length === 0) {
      requests = [
        { 
          id: generateId(), 
          type: '资金', 
          content: '购买绘画教材和颜料，用于周末的美术辅导活动。', 
          status: '待审批', 
          applicant_id: 'vol_02', // Volunteer asks Leader 01
          amount: 200 
        },
        { 
          id: generateId(), 
          type: '请假', 
          content: '家中急事，需请假三天。', 
          status: '待审批', 
          applicant_id: 'leader_01', // Leader 01 asks Admin
          startDate: '2023-11-01',
          endDate: '2023-11-03'
        },
        { 
          id: generateId(), 
          type: '调班', 
          content: '下周二无法参加，希望能调整到周三。', 
          status: '已批准', 
          applicant_id: 'vol_02',
          approver_id: 'leader_01'
        },
        {
          id: generateId(),
          type: '资金',
          content: '为小兰购买一套数学辅导书。',
          status: '待审批',
          applicant_id: 'vol_04', // 赵一 asks Leader 01
          amount: 150
        },
        {
          id: generateId(),
          type: '请假',
          content: '身体不适，申请休假一周。',
          status: '待审批',
          applicant_id: 'vol_07', // 李四 asks Leader 02
          startDate: '2023-11-10',
          endDate: '2023-11-17'
        }
      ];
      localStorage.setItem(KEYS.REQUESTS, JSON.stringify(requests));
    }
    
    // --- 4. Initialize Progress (if empty) ---
    const progressStr = localStorage.getItem(KEYS.PROGRESS);
    if (!progressStr && birds.length > 0) {
      // Find Little Ming's ID if possible, otherwise use first
      const littleMing = birds.find(b => b.name === '小明') || birds[0];
      const littleLan = birds.find(b => b.name === '小兰') || birds[3];
      
      const initialProgress: Progress[] = [];

      if (littleMing) {
        initialProgress.push({
            id: generateId(),
            bird_id: littleMing.id,
            volunteer_id: 'vol_02',
            content: '今天带小明去公园写生，他画了一棵大树，心情看起来很不错。',
            date: new Date().toISOString().split('T')[0]
        });
      }

      if (littleLan) {
        initialProgress.push({
            id: generateId(),
            bird_id: littleLan.id,
            volunteer_id: 'vol_04',
            content: '辅导了小兰的期中考试错题，她对几何部分掌握得很快。',
            date: new Date().toISOString().split('T')[0]
        });
      }
      
      if(initialProgress.length > 0) {
         localStorage.setItem(KEYS.PROGRESS, JSON.stringify(initialProgress));
      }
    }
  }

  // --- Users ---
  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  }

  findUser(username: string): User | undefined {
    return this.getUsers().find(u => u.username === username);
  }

  // New method to auto-generate the next 5-digit username
  getNextUsername(): string {
    const users = this.getUsers();
    let maxId = 0;
    users.forEach(u => {
      // Parse integer from username, fallback to 0 if not a number
      const num = parseInt(u.username, 10);
      if (!isNaN(num) && num > maxId) {
        maxId = num;
      }
    });
    // Increment and pad with zeros
    const nextId = maxId + 1;
    return nextId.toString().padStart(5, '0');
  }

  createUser(user: Omit<User, 'id' | 'status'>): User {
    const users = this.getUsers();
    if (users.find(u => u.username === user.username)) {
      throw new Error('Username already exists');
    }
    const newUser: User = { ...user, id: generateId(), status: 'normal' };
    users.push(newUser);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      
      // Update session if self
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === id) {
        const updatedCurrentUser = { ...currentUser, ...updates };
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(updatedCurrentUser));
      }
    }
  }

  changePassword(userId: string, newPassword: string) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].password = newPassword;
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      
      // Update current session if it matches
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.password = newPassword;
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(currentUser));
      }
    }
  }

  // --- Birds ---
  getBirds(): Bird[] {
    return JSON.parse(localStorage.getItem(KEYS.BIRDS) || '[]');
  }

  createBird(bird: Omit<Bird, 'id'>): Bird {
    const birds = this.getBirds();
    const newBird = { ...bird, id: generateId() };
    birds.push(newBird);
    localStorage.setItem(KEYS.BIRDS, JSON.stringify(birds));
    return newBird;
  }

  updateBird(id: string, updates: Partial<Bird>) {
    const birds = this.getBirds();
    const index = birds.findIndex(b => b.id === id);
    if (index !== -1) {
      birds[index] = { ...birds[index], ...updates };
      localStorage.setItem(KEYS.BIRDS, JSON.stringify(birds));
    }
  }

  assignBird(birdId: string, volunteerId: string | null) {
    const birds = this.getBirds();
    const index = birds.findIndex(b => b.id === birdId);
    if (index !== -1) {
      birds[index].assigned_volunteer_id = volunteerId;
      localStorage.setItem(KEYS.BIRDS, JSON.stringify(birds));
    }
  }

  // --- Requests ---
  getRequests(): Request[] {
    return JSON.parse(localStorage.getItem(KEYS.REQUESTS) || '[]');
  }

  createRequest(req: Omit<Request, 'id' | 'status'>): Request {
    const requests = this.getRequests();
    const newReq: Request = { ...req, id: generateId(), status: '待审批' };
    requests.push(newReq);
    localStorage.setItem(KEYS.REQUESTS, JSON.stringify(requests));
    return newReq;
  }

  updateRequestStatus(id: string, status: '已批准' | '已驳回', approverId: string, rejectionReason?: string) {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index !== -1) {
      const request = requests[index];
      request.status = status;
      request.approver_id = approverId;
      if (rejectionReason) {
        request.rejectionReason = rejectionReason;
      }

      // --- Logic for Temporary Leave (暂休) ---
      // If approved, suspend the user account and set the end date
      if (request.type === '暂休' && status === '已批准') {
         const applicantId = request.applicant_id;
         const users = this.getUsers();
         const userIdx = users.findIndex(u => u.id === applicantId);
         
         if (userIdx !== -1) {
            users[userIdx].status = 'suspended';
            users[userIdx].suspensionEndDate = request.endDate; // Assuming endDate is present for '暂休'
            localStorage.setItem(KEYS.USERS, JSON.stringify(users));
            // Force logout if it's the current user? Usually approval happens by another user, so no need.
         }
      }

      localStorage.setItem(KEYS.REQUESTS, JSON.stringify(requests));
    }
  }

  // --- Progress ---
  getProgress(): Progress[] {
    return JSON.parse(localStorage.getItem(KEYS.PROGRESS) || '[]');
  }

  createProgress(prog: Omit<Progress, 'id' | 'date'>): Progress {
    const progressList = this.getProgress();
    const newProg: Progress = { 
      ...prog, 
      id: generateId(), 
      date: new Date().toISOString().split('T')[0] 
    };
    progressList.push(newProg);
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progressList));
    return newProg;
  }

  // --- Auth Session ---
  login(username: string, password: string): { user: User | null, error?: string } {
    const user = this.findUser(username);
    if (!user) {
      return { user: null, error: '工号或密码错误' };
    }
    
    if (user.password !== password) {
      return { user: null, error: '工号或密码错误' };
    }

    // Check Status
    if (user.status === 'banned') {
      if (user.banReason) {
        return { user: null, error: `账户已被管理员停用。\n原因: ${user.banReason}` };
      } else {
        return { user: null, error: '账户已被管理员停用，请联系管理员。' };
      }
    }

    if (user.status === 'suspended') {
      const today = new Date().toISOString().split('T')[0];
      // If no end date or end date is in the past, reactivate automatically
      if (!user.suspensionEndDate || today > user.suspensionEndDate) {
        user.status = 'normal';
        user.suspensionEndDate = undefined;
        this.updateUser(user.id, { status: 'normal', suspensionEndDate: undefined });
      } else {
        return { user: null, error: `账户暂时休眠中 (直至 ${user.suspensionEndDate})，请于休假结束后尝试登录。` };
      }
    }

    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    return { user };
  }

  logout() {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }

  getCurrentUser(): User | null {
    const u = localStorage.getItem(KEYS.CURRENT_USER);
    return u ? JSON.parse(u) : null;
  }
}

export const db = new MockDB();