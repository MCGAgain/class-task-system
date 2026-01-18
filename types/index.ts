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
}

// 意见建议类型
export interface Suggestion {
  id: string
  task_id: string
  user_id: string
  user_name: string
  content: string
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
