'use client'

import * as React from "react"
import { X, Mail, MailOpen, Trash2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store"
import type { Notification } from "@/types"

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  onNavigate?: (linkType?: string, linkId?: string) => void
}

export function NotificationCenter({ isOpen, onClose, onNavigate }: NotificationCenterProps) {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    deleteNotification,
    currentUser 
  } = useAppStore()
  
  // 过滤当前用户的通知
  const userNotifications = React.useMemo(() => {
    if (!currentUser) return []
    return notifications.filter(n => n.user_id === currentUser.id)
  }, [notifications, currentUser])
  
  const unreadCount = userNotifications.filter(n => !n.is_read).length
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markNotificationAsRead(notification.id)
    }
    
    // 对于反馈类型的通知，不关闭通知中心，而是打开详情弹窗
    if (notification.link_type === 'feedback' && notification.link_id) {
      onNavigate?.('feedback', notification.link_id)
      // 不关闭通知中心，让用户看到详情
      return
    }
    
    if (notification.link_type && notification.link_id) {
      onNavigate?.(notification.link_type, notification.link_id)
      onClose()
    }
  }
  
  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead()
  }
  
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteNotification(id)
  }
  
  // ESC 关闭
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* 通知面板 */}
      <div className="relative w-full max-w-lg mx-4 bg-card rounded-xl shadow-2xl animate-modal-in max-h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">通知中心</h2>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {unreadCount} 条未读
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="gap-1 text-xs"
              >
                <Check className="w-3 h-3" />
                全部已读
              </Button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* 通知列表 */}
        <div className="flex-1 overflow-y-auto p-2">
          {userNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <MailOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">暂无通知</p>
            </div>
          ) : (
            <div className="space-y-2">
              {userNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "p-3 rounded-lg border transition-all cursor-pointer group",
                    notification.is_read
                      ? "bg-background hover:bg-secondary/50"
                      : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                      notification.is_read ? "bg-muted" : "bg-primary"
                    )} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <button
                          onClick={(e) => handleDelete(e, notification.id)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded hover:bg-destructive/10 flex items-center justify-center transition-all"
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.created_at).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
