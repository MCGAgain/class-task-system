'use client'

import * as React from "react"
import { X, MessageSquarePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store"
import type { Feedback } from "@/types"

interface FeedbackDetailModalProps {
  isOpen: boolean
  onClose: () => void
  feedbackId: string
}

export function FeedbackDetailModal({ isOpen, onClose, feedbackId }: FeedbackDetailModalProps) {
  const { feedbacks, currentUser, updateFeedback, showNotification } = useAppStore()
  const [replyText, setReplyText] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin'
  
  const feedback = React.useMemo(() => {
    return feedbacks.find(f => f.id === feedbackId)
  }, [feedbacks, feedbackId])

  // 当反馈变更时，初始化回复内容
  React.useEffect(() => {
    if (feedback?.reply) {
      setReplyText(feedback.reply)
    } else {
      setReplyText('')
    }
  }, [feedback])
  
  // ESC 关闭
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])
  
  if (!isOpen || !feedback) return null
  
  const typeLabels = {
    suggestion: '建议',
    complaint: '投诉',
    question: '咨询',
    other: '其他',
  }
  
  const statusLabels = {
    pending: '待处理',
    read: '已查看',
    resolved: '已解决',
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* 弹窗 */}
      <div className="relative w-full max-w-2xl bg-card rounded-xl shadow-2xl animate-modal-in max-h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquarePlus className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">反馈详情</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">提交者</p>
              <p className="font-medium">{feedback.user_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">学号</p>
              <p className="font-medium">{feedback.student_id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">反馈类型</p>
              <p className="font-medium">{typeLabels[feedback.type]}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">状态</p>
              <p className="font-medium">{statusLabels[feedback.status]}</p>
            </div>
          </div>
          
          {/* 分隔线 */}
          <div className="border-t" />
          
          {/* 反馈内容 */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">反馈内容</p>
            <div className="p-4 bg-secondary/30 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{feedback.content}</p>
            </div>
          </div>
          
          {/* 回复内容（如果有） */}
          {feedback.reply && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">管理员回复</p>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm whitespace-pre-wrap">{feedback.reply}</p>
              </div>
            </div>
          )}
          
          {/* 管理员回复表单 */}
          {isAdmin && feedback.status !== 'resolved' && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-muted-foreground font-medium">管理员处理</p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="输入回复内容..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateFeedback(feedback.id, { status: 'resolved' })
                    showNotification('已标记为解决', 'success')
                  }}
                >
                  直接标记为解决
                </Button>
                <Button
                  size="sm"
                  disabled={!replyText.trim() || isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true)
                    updateFeedback(feedback.id, { 
                      reply: replyText.trim(),
                      status: 'resolved'
                    })
                    setIsSubmitting(false)
                    showNotification('已提交回复并解决', 'success')
                  }}
                >
                  提交回复并解决
                </Button>
              </div>
            </div>
          )}

          {/* 时间信息 */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>提交时间: {new Date(feedback.created_at).toLocaleString('zh-CN')}</p>
            {feedback.updated_at !== feedback.created_at && (
              <p>更新时间: {new Date(feedback.updated_at).toLocaleString('zh-CN')}</p>
            )}
          </div>
        </div>
        
        {/* 底部操作 */}
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </div>
  )
}
