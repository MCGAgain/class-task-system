'use client'

import * as React from "react"
import { Search, Plus, LogOut, User, Settings, Archive, ChevronDown, MessageSquarePlus, Mail, List, Vote } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/store"

interface HeaderProps {
  currentView: 'tasks' | 'proposals'
  onViewChange: (view: 'tasks' | 'proposals') => void
  onNewTask: () => void
  onManageUsers?: () => void
  onViewArchive?: () => void
  onLogin?: () => void
  onFeedback?: () => void
  onNotification?: () => void
}

export function Header({ currentView, onViewChange, onNewTask, onManageUsers, onViewArchive, onLogin, onFeedback, onNotification }: HeaderProps) {
  const { currentUser, setCurrentUser, searchQuery, setSearchQuery, showNotification, notifications } = useAppStore()
  const [showUserMenu, setShowUserMenu] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  
  // 实时计算未读数量
  const unreadCount = React.useMemo(() => {
    if (!currentUser) return 0
    return notifications.filter(n => n.user_id === currentUser.id && !n.is_read).length
  }, [notifications, currentUser])
  
  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin'
  const isSuperAdmin = currentUser?.role === 'super_admin'
  
  // 点击外部关闭菜单
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleLogout = () => {
    setCurrentUser(null)
    showNotification('已退出登录', 'info')
  }
  
  const roleLabels = {
    super_admin: '超级管理员',
    admin: '管理员',
    user: '普通用户',
  }
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo + 页面切换 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-foreground">班级任务管理</h1>
              <p className="text-xs text-muted-foreground">协作 · 高效 · 简洁</p>
            </div>
          </div>
          
          {/* 页面切换滑动按钮 */}
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
            <button
              onClick={() => onViewChange('tasks')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                currentView === 'tasks'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">任务列表</span>
            </button>
            <button
              onClick={() => onViewChange('proposals')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                currentView === 'proposals'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Vote className="w-4 h-4" />
              <span className="hidden sm:inline">提案投票</span>
            </button>
          </div>
        </div>
        
        {/* 搜索框 */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={currentView === 'tasks' ? "搜索任务..." : "搜索提案..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* 右侧操作区 */}
        <div className="flex items-center gap-3">
          {/* 通知按钮 */}
          {currentUser && onNotification && (
            <button
              onClick={onNotification}
              className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Mail className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px]"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </button>
          )}
          
          {/* 发布按钮（仅管理员） */}
          {isAdmin && currentView === 'tasks' && (
            <Button onClick={onNewTask} className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">发布任务</span>
            </Button>
          )}
          
          {/* 用户菜单 */}
          {currentUser ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                  "hover:bg-secondary",
                  showUserMenu && "bg-secondary"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{roleLabels[currentUser.role]}</p>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform duration-200",
                  showUserMenu && "rotate-180"
                )} />
              </button>
              
              {/* 下拉菜单 */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-card rounded-xl border shadow-lg animate-fade-in">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">学号: {currentUser.studentId}</p>
                  </div>
                  
                  {/* 历史任务（管理员可见） */}
                  {isAdmin && onViewArchive && (
                    <button
                      onClick={() => {
                        onViewArchive()
                        setShowUserMenu(false)
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-secondary transition-colors"
                    >
                      <Archive className="w-4 h-4" />
                      历史任务
                    </button>
                  )}
                  
                  {/* 用户管理（超级管理员可见） */}
                  {isSuperAdmin && onManageUsers && (
                    <button
                      onClick={() => {
                        onManageUsers()
                        setShowUserMenu(false)
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-secondary transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      用户管理
                    </button>
                  )}
                  
                  {/* 提交反馈（所有登录用户可见） */}
                  {onFeedback && (
                    <button
                      onClick={() => {
                        onFeedback()
                        setShowUserMenu(false)
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-secondary transition-colors"
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                      提交反馈
                    </button>
                  )}
                  
                  <div className="border-t mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button variant="outline" onClick={onLogin}>
              登录
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
