export type Role = 'admin' | 'leader' | 'volunteer';
export type UserStatus = 'normal' | 'suspended' | 'banned';

export interface User {
  id: string;
  username: string; // 5 digit "00001"
  password: string; // Hashed in real app, simulated here
  role: Role;
  name: string;
  status: UserStatus;
  suspensionEndDate?: string; // ISO Date string YYYY-MM-DD
  banReason?: string; // Reason for being banned
  leaderId?: string; // ID of the Leader this volunteer reports to (only for role='volunteer')
}

export interface Bird {
  id: string;
  name: string;
  info: string;
  assigned_volunteer_id: string | null;
}

export type RequestType = '资金' | '请假' | '调班' | '暂休';
export type RequestStatus = '待审批' | '已批准' | '已驳回';

export interface Request {
  id: string;
  type: RequestType;
  content: string;
  status: RequestStatus;
  applicant_id: string;
  approver_id?: string;
  
  // New specific fields
  amount?: number;        // For '资金'
  startDate?: string;     // For '请假', '暂休'
  endDate?: string;       // For '请假', '暂休'
  rejectionReason?: string; // For '已驳回'
}

export interface Progress {
  id: string;
  bird_id: string;
  volunteer_id: string;
  content: string;
  date: string;
}

// Helper for UI
export interface PopulatedBird extends Bird {
  volunteerName?: string;
}

export interface PopulatedRequest extends Request {
  applicantName: string;
  approverName?: string;
}

export interface PopulatedProgress extends Progress {
  volunteerName: string;
  birdName: string;
}