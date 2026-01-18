import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Task, Question, Suggestion, TaskStatus, Feedback, Reply, Proposal, Vote, Notification, VoteOption } from '@/types'

// 超级管理员固定账号
export const SUPER_ADMIN: User = {
  id: 'super-admin-001',
  studentId: '超级管理员',
  password: 'suse25101020216',
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
  addReplyToQuestion: (taskId: string, questionId: string, reply: Reply) => void
  
  // 意见操作
  addSuggestion: (taskId: string, suggestion: Suggestion) => void
  addReplyToSuggestion: (taskId: string, suggestionId: string, reply: Reply) => void
  adoptSuggestion: (taskId: string, suggestionId: string) => Proposal | null
  
  // 提案操作
  proposals: Proposal[]
  addProposal: (proposal: Proposal) => void
  updateProposal: (id: string, updates: Partial<Proposal>) => void
  deleteProposal: (id: string) => void
  startVoting: (proposalId: string) => void
  addVote: (proposalId: string, vote: Vote) => void
  checkProposalStatus: (proposalId: string) => void
  
  // 通知操作
  notifications: Notification[]
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  deleteNotification: (id: string) => void
  getUnreadCount: () => number
  
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
      
      addReplyToQuestion: (taskId, questionId, reply) => set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === taskId 
            ? {
                ...t,
                questions: t.questions?.map((q) =>
                  q.id === questionId
                    ? { ...q, replies: [...(q.replies || []), reply] }
                    : q
                )
              }
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
      
      addReplyToSuggestion: (taskId, suggestionId, reply) => set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === taskId 
            ? {
                ...t,
                suggestions: t.suggestions?.map((s) =>
                  s.id === suggestionId
                    ? { ...s, replies: [...(s.replies || []), reply] }
                    : s
                )
              }
            : t
        )
      })),
      
      adoptSuggestion: (taskId, suggestionId) => {
        const state = get()
        const task = state.tasks.find((t) => t.id === taskId)
        const suggestion = task?.suggestions?.find((s) => s.id === suggestionId)
        
        if (!task || !suggestion || !state.currentUser) return null
        
        // 标记建议为已收纳
        set((state) => ({
          tasks: state.tasks.map((t) => 
            t.id === taskId 
              ? {
                  ...t,
                  suggestions: t.suggestions?.map((s) =>
                    s.id === suggestionId
                      ? { ...s, is_adopted: true }
                      : s
                  )
                }
              : t
          )
        }))
        
        // 创建提案
        const proposal: Proposal = {
          id: crypto.randomUUID(),
          suggestion_id: suggestionId,
          task_id: taskId,
          content: suggestion.content,
          submitted_by: suggestion.user_id,
          submitter_name: suggestion.user_name,
          status: 'pending',
          votes: [],
          created_at: new Date().toISOString(),
        }
        
        get().addProposal(proposal)
        
        // 给提交者发送通知
        const notification: Notification = {
          id: crypto.randomUUID(),
          user_id: suggestion.user_id,
          type: 'suggestion_adopted',
          title: '您的建议已被收纳',
          content: `您在任务"${task.title}"中的建议已被收纳为提案`,
          is_read: false,
          link_type: 'proposal',
          link_id: proposal.id,
          created_at: new Date().toISOString(),
        }
        get().addNotification(notification)
        
        return proposal
      },
      
      // 提案操作
      proposals: [],
      addProposal: (proposal) => set((state) => ({ 
        proposals: [proposal, ...state.proposals] 
      })),
      
      updateProposal: (id, updates) => set((state) => ({
        proposals: state.proposals.map((p) => 
          p.id === id ? { ...p, ...updates } : p
        )
      })),
      
      deleteProposal: (id) => set((state) => ({
        proposals: state.proposals.filter((p) => p.id !== id)
      })),
      
      startVoting: (proposalId) => {
        const proposal = get().proposals.find((p) => p.id === proposalId)
        if (!proposal) return
        
        const now = new Date().toISOString()
        get().updateProposal(proposalId, {
          status: 'voting',
          voting_started_at: now,
        })
        
        // 通知建议提交者投票开始
        const notification: Notification = {
          id: crypto.randomUUID(),
          user_id: proposal.submitted_by,
          type: 'voting_started',
          title: '提案投票已开始',
          content: `您的提案已开始投票，请关注投票进度`,
          is_read: false,
          link_type: 'proposal',
          link_id: proposalId,
          created_at: now,
        }
        get().addNotification(notification)
      },
      
      addVote: (proposalId, vote) => {
        const proposal = get().proposals.find((p) => p.id === proposalId)
        if (!proposal) return
        
        // 检查是否已投票
        const hasVoted = proposal.votes.some((v) => v.user_id === vote.user_id)
        if (hasVoted) return
        
        set((state) => ({
          proposals: state.proposals.map((p) => 
            p.id === proposalId 
              ? { ...p, votes: [...p.votes, vote] }
              : p
          )
        }))
        
        // 检查投票状态
        get().checkProposalStatus(proposalId)
      },
      
      checkProposalStatus: (proposalId) => {
        const state = get()
        const proposal = state.proposals.find((p) => p.id === proposalId)
        if (!proposal || proposal.status !== 'voting') return
        
        // 获取所有管理员
        const allAdmins = state.users.filter((u) => u.role === 'admin' || u.role === 'super_admin')
        const totalAdmins = allAdmins.length
        
        // 统计投票
        const totalVotes = proposal.votes.length
        const approveVotes = proposal.votes.filter((v) => v.option === 'approve').length
        
        // 检查是否达到60%投票率
        const votingRate = totalVotes / totalAdmins
        if (votingRate >= 0.6) {
          // 检查是否2/3以上支持
          const approvalRate = approveVotes / totalVotes
          const newStatus = approvalRate >= 2/3 ? 'approved' : 'rejected'
          const now = new Date().toISOString()
          
          // 设置自动删除时间
          let autoDeleteAt: string
          if (newStatus === 'rejected') {
            // 未通过：3天后删除
            autoDeleteAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          } else {
            // 已通过：7天后删除
            autoDeleteAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
          
          get().updateProposal(proposalId, { 
            status: newStatus,
            approved_at: newStatus === 'approved' ? now : undefined,
            auto_delete_at: autoDeleteAt
          })
          
          // 通知提交者
          const notification: Notification = {
            id: crypto.randomUUID(),
            user_id: proposal.submitted_by,
            type: 'proposal_status_changed',
            title: newStatus === 'approved' ? '提案投票通过' : '提案投票未通过',
            content: newStatus === 'approved' 
              ? '恭喜！您的提案已获得通过，将公示7天' 
              : '很遗憾，您的提案未能通过，将在3天后自动删除',
            is_read: false,
            link_type: 'proposal',
            link_id: proposalId,
            created_at: now,
          }
          get().addNotification(notification)
        }
      },
      
      // 通知操作
      notifications: [],
      addNotification: (notification) => set((state) => ({ 
        notifications: [notification, ...state.notifications] 
      })),
      
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => 
          n.id === id ? { ...n, is_read: true } : n
        )
      })),
      
      markAllNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true }))
      })),
      
      deleteNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      })),
      
      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.is_read).length
      },
      
      // 反馈操作
      feedbacks: [],
      addFeedback: (feedback) => {
        set((state) => ({ 
          feedbacks: [feedback, ...state.feedbacks] 
        }))
        
        // 给超级管理员发送通知
        const notification: Notification = {
          id: crypto.randomUUID(),
          user_id: SUPER_ADMIN.id,
          type: 'feedback_received',
          title: '收到新反馈',
          content: `收到来自${feedback.is_anonymous ? '匿名用户' : feedback.user_name}的${feedback.type === 'suggestion' ? '建议' : feedback.type === 'complaint' ? '投诉' : feedback.type === 'question' ? '咨询' : '其他'}`,
          is_read: false,
          link_type: 'feedback',
          link_id: feedback.id,
          created_at: new Date().toISOString(),
        }
        get().addNotification(notification)
      },
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
        proposals: state.proposals,
        notifications: state.notifications,
      }),
    }
  )
)
