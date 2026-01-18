import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Task, Question, Suggestion, TaskStatus, Feedback } from '@/types'

// 超级管理员固定账号
export const SUPER_ADMIN: User = {
  id: 'super-admin-001',
  studentId: 'admin',
  password: 'admin123',
  name: '超级管理员',
  role: 'super_admin',
  created_at: '2024-01-01T00:00:00.000Z',
}

interface AppState {
  // 用户状态
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  
  // 所有注册用户
  users: User[]
  setUsers: (users: User[]) => void
  addUser: (user: User) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
  getUserByStudentId: (studentId: string) => User | undefined
  
  // 任务状态
  tasks: Task[]
  archivedTasks: Task[]
  setTasks: (tasks: Task[]) => void
  setArchivedTasks: (tasks: Task[]) => void
  
  // 任务操作
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  archiveTask: (id: string) => void
  restoreTask: (id: string) => void
  togglePinTask: (id: string) => void
  updateTaskStatus: (id: string, status: TaskStatus) => void
  
  // 提问操作
  addQuestion: (taskId: string, question: Question) => void
  
  // 意见操作
  addSuggestion: (taskId: string, suggestion: Suggestion) => void
  
  // 反馈操作
  feedbacks: Feedback[]
  addFeedback: (feedback: Feedback) => void
  updateFeedback: (id: string, updates: Partial<Feedback>) => void
  deleteFeedback: (id: string) => void
  
  // 通知状态
  notification: { message: string; type: 'success' | 'error' | 'info' } | null
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void
  clearNotification: () => void
  
  // 搜索
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  // 加载状态
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

// 任务排序函数：置顶优先，然后按时间倒序
const sortTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    // 置顶任务优先
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    // 同为置顶或同为非置顶，按时间倒序
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 用户状态
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      
      // 所有注册用户
      users: [],
      setUsers: (users) => set({ users }),
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (id, updates) => set((state) => ({
        users: state.users.map((u) => 
          u.id === id ? { ...u, ...updates } : u
        )
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter((u) => u.id !== id)
      })),
      getUserByStudentId: (studentId) => {
        // 检查是否是超级管理员
        if (studentId === SUPER_ADMIN.studentId) {
          return SUPER_ADMIN
        }
        return get().users.find((u) => u.studentId === studentId)
      },
      
      // 任务状态
      tasks: [],
      archivedTasks: [],
      setTasks: (tasks) => set({ tasks: sortTasks(tasks) }),
      setArchivedTasks: (tasks) => set({ archivedTasks: tasks }),
      
      // 任务操作
      addTask: (task) => set((state) => ({ 
        tasks: sortTasks([task, ...state.tasks])
      })),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: sortTasks(state.tasks.map((t) => 
          t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
        ))
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        archivedTasks: state.archivedTasks.filter((t) => t.id !== id)
      })),
      
      archiveTask: (id) => set((state) => {
        const task = state.tasks.find((t) => t.id === id)
        if (!task) return state
        return {
          tasks: state.tasks.filter((t) => t.id !== id),
          archivedTasks: [{ ...task, is_archived: true, status: 'completed' as TaskStatus }, ...state.archivedTasks]
        }
      }),
      
      restoreTask: (id) => set((state) => {
        const task = state.archivedTasks.find((t) => t.id === id)
        if (!task) return state
        return {
          archivedTasks: state.archivedTasks.filter((t) => t.id !== id),
          tasks: sortTasks([{ ...task, is_archived: false, status: 'pending' as TaskStatus }, ...state.tasks])
        }
      }),
      
      togglePinTask: (id) => set((state) => ({
        tasks: sortTasks(state.tasks.map((t) => 
          t.id === id ? { ...t, is_pinned: !t.is_pinned } : t
        ))
      })),
      
      updateTaskStatus: (id, status) => set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === id ? { ...t, status } : t
        )
      })),
      
      // 提问操作
      addQuestion: (taskId, question) => set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === taskId 
            ? { ...t, questions: [...(t.questions || []), question] }
            : t
        )
      })),
      
      // 意见操作
      addSuggestion: (taskId, suggestion) => set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === taskId 
            ? { ...t, suggestions: [...(t.suggestions || []), suggestion] }
            : t
        )
      })),
      
      // 反馈操作
      feedbacks: [],
      addFeedback: (feedback) => set((state) => ({ 
        feedbacks: [feedback, ...state.feedbacks] 
      })),
      updateFeedback: (id, updates) => set((state) => ({
        feedbacks: state.feedbacks.map((f) => 
          f.id === id ? { ...f, ...updates, updated_at: new Date().toISOString() } : f
        )
      })),
      deleteFeedback: (id) => set((state) => ({
        feedbacks: state.feedbacks.filter((f) => f.id !== id)
      })),
      
      // 通知状态
      notification: null,
      showNotification: (message, type) => set({ notification: { message, type } }),
      clearNotification: () => set({ notification: null }),
      
      // 搜索
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      // 加载状态
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'campus-task-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        tasks: state.tasks,
        archivedTasks: state.archivedTasks,
        feedbacks: state.feedbacks,
      }),
    }
  )
)
