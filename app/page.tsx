'use client'

import * as React from "react"
import { ClipboardList, LogIn } from "lucide-react"
import { Header } from "@/components/header"
import { TaskCard } from "@/components/task-card"
import { TaskForm } from "@/components/task-form"
import { LoginForm } from "@/components/login-form"
import { ArchiveModal } from "@/components/archive-modal"
import { UserManageModal } from "@/components/user-manage-modal"
import { FeedbackForm } from "@/components/feedback-form"
import { FeedbackDetailModal } from "@/components/feedback-detail-modal"
import { NotificationCenter } from "@/components/notification-center"
import { ProposalPage } from "@/components/proposal-page"
import { Toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { PageLoader } from "@/components/ui/spinner"
import { useAppStore } from "@/store"
import { subscribeToTable } from "@/lib/supabase-sync"
import type { Task, Proposal } from "@/types"

export default function HomePage() {
  const { 
    currentUser, 
    tasks, 
    proposals, 
    searchQuery, 
    isLoading, 
    setIsLoading, 
    addTask, 
    initializeFromSupabase,
    syncAllData
  } = useAppStore()
  
  const [currentView, setCurrentView] = React.useState<'tasks' | 'proposals'>('tasks')
  const [showTaskForm, setShowTaskForm] = React.useState(false)
  const [showLoginForm, setShowLoginForm] = React.useState(false)
  const [showArchiveModal, setShowArchiveModal] = React.useState(false)
  const [showUserManageModal, setShowUserManageModal] = React.useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = React.useState(false)
  const [showNotificationCenter, setShowNotificationCenter] = React.useState(false)
  const [showFeedbackDetail, setShowFeedbackDetail] = React.useState(false)
  const [selectedFeedbackId, setSelectedFeedbackId] = React.useState<string | null>(null)
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [mounted, setMounted] = React.useState(false)
  
  // 处理客户端挂载和 Supabase 初始化
  React.useEffect(() => {
    const initialize = async () => {
      setMounted(true)
      
      // 从 Supabase 加载数据
      await initializeFromSupabase()
      
      // 如果没有配置 Supabase,初始化示例任务(仅首次)
      const hasInitialized = localStorage.getItem('tasks-initialized')
      const currentTasks = useAppStore.getState().tasks
      if (!hasInitialized && currentTasks.length === 0) {
      const demoTasks: Task[] = [
        {
          id: crypto.randomUUID(),
          title: '期末考试时间安排通知',
          description: '各位同学请注意，本学期期末考试将于1月20日至1月25日进行。请及时查看教务系统获取具体考试科目和时间安排。如有任何疑问，可在下方提问区留言。',
          status: 'in_progress',
          is_pinned: true,
          is_archived: false,
          created_by: 'admin',
          creator_name: '班委小明',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          questions: [
            {
              id: crypto.randomUUID(),
              task_id: '',
              user_id: 'user1',
              user_name: '同学A',
              content: '请问高数考试是在哪个教室？',
              created_at: new Date(Date.now() - 3600000).toISOString(),
            }
          ],
          suggestions: [],
        },
        {
          id: crypto.randomUUID(),
          title: '班级聚餐报名',
          description: '为庆祝学期结束，班级将于1月26日晚上6点举办聚餐活动。请有意参加的同学在本周五前在下方意见区回复确认。费用AA制，预计每人50元左右。',
          status: 'pending',
          is_pinned: false,
          is_archived: false,
          created_by: 'admin',
          creator_name: '生活委员',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString(),
          questions: [],
          suggestions: [
            {
              id: crypto.randomUUID(),
              task_id: '',
              user_id: 'user2',
              user_name: '同学B',
              content: '我参加！',
              created_at: new Date(Date.now() - 7200000).toISOString(),
            },
            {
              id: crypto.randomUUID(),
              task_id: '',
              user_id: 'user3',
              user_name: '同学C',
              content: '我也参加，可以换个时间吗？26号晚上我有事',
              created_at: new Date(Date.now() - 3600000).toISOString(),
            }
          ],
        },
        {
          id: crypto.randomUUID(),
          title: '教材收集通知',
          description: '请各位同学将本学期不再使用的教材整理好，下周一统一收集捐赠给学弟学妹。有意捐赠的同学请在意见区留下你的书目清单。',
          status: 'pending',
          is_pinned: false,
          is_archived: false,
          created_by: 'admin',
          creator_name: '学习委员',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          updated_at: new Date(Date.now() - 259200000).toISOString(),
          questions: [],
          suggestions: [],
        },
      ]
      
      demoTasks.forEach(task => addTask(task))
      localStorage.setItem('tasks-initialized', 'true')
      }
    }
    
    initialize()
  }, [initializeFromSupabase, addTask])
  
  // 实时同步
  React.useEffect(() => {
    const tables = ['tasks', 'questions', 'suggestions', 'replies', 'proposals', 'votes', 'notifications', 'feedbacks']
    const subscriptions = tables.map(table => 
      subscribeToTable(table, () => {
        syncAllData()
      })
    )

    return () => {
      subscriptions.forEach(sub => sub?.unsubscribe())
    }
  }, [syncAllData])
  
  // 过滤任务/提案
  const filteredItems = React.useMemo(() => {
    if (currentView === 'tasks') {
      if (!searchQuery.trim()) return tasks
      const query = searchQuery.toLowerCase()
      return tasks.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      )
    } else {
      return proposals // 提案页面自己处理搜索
    }
  }, [currentView, tasks, proposals, searchQuery])
  
  const handleNewTask = () => {
    setEditingTask(null)
    setShowTaskForm(true)
  }
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }
  
  const handleCloseTaskForm = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }
  
  const handleNavigateFromNotification = (linkType?: string, linkId?: string) => {
    if (linkType === 'task' && linkId) {
      setCurrentView('tasks')
      // 滚动到指定任务
      setTimeout(() => {
        const taskElement = document.getElementById(`task-${linkId}`)
        if (taskElement) {
          taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // 高亮效果
          taskElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2')
          setTimeout(() => {
            taskElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2')
          }, 2000)
        }
      }, 100)
    } else if (linkType === 'proposal' && linkId) {
      setCurrentView('proposals')
      // 滚动到指定提案
      setTimeout(() => {
        const proposalElement = document.getElementById(`proposal-${linkId}`)
        if (proposalElement) {
          proposalElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // 高亮效果
          proposalElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2')
          setTimeout(() => {
            proposalElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2')
          }, 2000)
        }
      }, 100)
    } else if (linkType === 'feedback' && linkId) {
      // 打开反馈详情弹窗
      setSelectedFeedbackId(linkId)
      setShowFeedbackDetail(true)
    }
  }
  
  // 避免服务端渲染不一致
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader />
      </div>
    )
  }
  
  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin'
  
  return (
    <div className="min-h-screen bg-background">
      {/* Toast 通知 */}
      <Toast />
      
      {/* 顶部导航 */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onNewTask={handleNewTask}
        onManageUsers={() => setShowUserManageModal(true)}
        onViewArchive={() => setShowArchiveModal(true)}
        onLogin={() => setShowLoginForm(true)}
        onFeedback={() => setShowFeedbackForm(true)}
        onNotification={() => setShowNotificationCenter(true)}
      />
      
      {/* 主内容区 */}
      <main className="container py-6">
        {currentView === 'tasks' ? (
          <>
            {/* 未登录提示 */}
            {!currentUser && (
              <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium">欢迎访问班级任务管理系统</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    登录后可以提问、提交意见，管理员可以发布和管理任务
                  </p>
                </div>
                <Button onClick={() => setShowLoginForm(true)} className="gap-2 flex-shrink-0">
                  <LogIn className="w-4 h-4" />
                  登录
                </Button>
              </div>
            )}
            
            {/* 任务列表 */}
            {isLoading ? (
              <PageLoader />
            ) : (filteredItems as Task[]).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ClipboardList className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? '未找到匹配的任务' : '暂无任务'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {searchQuery 
                    ? '尝试使用其他关键词搜索'
                    : isAdmin 
                      ? '点击「发布任务」按钮创建第一个任务吧'
                      : '管理员还没有发布任何任务'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(filteredItems as Task[]).map((task, index) => (
                  <div
                    key={task.id}
                    id={`task-${task.id}`}
                    className="animate-fade-in transition-all"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TaskCard
                      task={task}
                      onEdit={isAdmin ? handleEditTask : undefined}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <ProposalPage />
        )}
      </main>
      
      {/* 底部版权 */}
      <footer className="border-t py-6 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>班级任务管理系统 - 协作 · 高效 · 简洁</p>
        </div>
      </footer>
      
      {/* 弹窗 */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={handleCloseTaskForm}
        editTask={editingTask}
      />
      
      <LoginForm
        isOpen={showLoginForm}
        onClose={() => setShowLoginForm(false)}
      />
      
      <ArchiveModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
      />
      
      <UserManageModal
        isOpen={showUserManageModal}
        onClose={() => setShowUserManageModal(false)}
      />
      
      <FeedbackForm
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
      />
      
      <NotificationCenter
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
        onNavigate={handleNavigateFromNotification}
      />
      
      <FeedbackDetailModal
        isOpen={showFeedbackDetail}
        onClose={() => {
          setShowFeedbackDetail(false)
          setSelectedFeedbackId(null)
        }}
        feedbackId={selectedFeedbackId || ''}
      />
    </div>
  )
}
