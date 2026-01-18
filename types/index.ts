// 用户角色类型
export type UserRole = 'super_admin' | 'admin' | 'user'

// 任务状态类型
export type TaskStatus = 'pending' | 'in_progress' | 'completed'

// 用户类型
export interface User {
  id: string
  studentId: string  // 学号（超级管理员为固定账号）
  password: string   // 密码
  name: string
  role: UserRole
  created_at: string
}

// 任务类型
export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  is_pinned: boolean
  is_archived: boolean
  created_by: string
  creator_name?: string
  created_at: string
  updated_at: string
  questions?: Question[]
  suggestions?: Suggestion[]
}

// 提问类型
export interface Question {
  id: string
  task_id: string
  user_id: string
  user_name: string
  content: string
  created_at: string
  replies?: Reply[]  // 回复列表
}

// 意见建议类型
export interface Suggestion {
  id: string
  task_id: string
  user_id: string
  user_name: string
  content: string
  created_at: string
  replies?: Reply[]  // 回复列表
  is_adopted?: boolean  // 是否被收纳为提案
}

// 回复类型
export interface Reply {
  id: string
  parent_id: string  // 父级ID（提问或建议的ID）
  parent_type: 'question' | 'suggestion'
  user_id: string
  user_name: string
  content: string
  reply_to?: string  // 回复谁的用户名（嵌套回复）
  created_at: string
}

// 新建任务表单数据
export interface NewTaskData {
  title: string
  description: string
}

// 登录表单数据
export interface LoginData {
  studentId: string
  password: string
}

// 注册表单数据
export interface RegisterData {
  studentId: string
  password: string
  name: string
}

// 反馈类型
export type FeedbackType = 'suggestion' | 'complaint' | 'question' | 'other'

// 学生反馈
export interface Feedback {
  id: string
  user_id: string
  user_name: string
  student_id: string
  type: FeedbackType
  content: string
  is_anonymous: boolean
  status: 'pending' | 'read' | 'resolved'
  reply?: string
  created_at: string
  updated_at: string
}

// 提案状态类型
export type ProposalStatus = 'pending' | 'voting' | 'approved' | 'rejected'

// 投票选项类型
export type VoteOption = 'approve' | 'reject' | 'abstain'

// 提案类型
export interface Proposal {
  id: string
  suggestion_id: string  // 原建议ID
  task_id: string
  content: string
  submitted_by: string
  submitter_name: string
  status: ProposalStatus
  votes: Vote[]
  created_at: string
  voting_started_at?: string  // 投票开始时间
  auto_delete_at?: string  // 自动删除时间（投票未通过后3天，已通过后7天）
  approved_at?: string  // 通过时间（用于计算7天公示期）
}

// 投票类型
export interface Vote {
  id: string
  proposal_id: string
  user_id: string
  user_name: string
  option: VoteOption
  created_at: string
}

// 通知类型
export type NotificationType = 
  | 'feedback_received'      // 收到反馈（超管）
  | 'reply_received'         // 收到回复
  | 'suggestion_adopted'     // 建议被收纳
  | 'proposal_status_changed' // 提案状态变化
  | 'voting_started'         // 投票开始

// 通知
export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  content: string
  is_read: boolean
  link_type?: 'task' | 'proposal' | 'feedback'  // 跳转类型
  link_id?: string  // 跳转目标ID
  created_at: string
}
