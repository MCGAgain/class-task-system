'use client'

import * as React from "react"
import { X, MessageSquarePlus, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppStore } from "@/store"
import type { FeedbackType, Feedback } from "@/types"

interface FeedbackFormProps {
  isOpen: boolean
  onClose: () => void
}

const feedbackTypes: { value: FeedbackType; label: string; description: string }[] = [
  { value: 'suggestion', label: '建议', description: '对班级管理的改进建议' },
  { value: 'complaint', label: '投诉', description: '反馈不满意的地方' },
  { value: 'question', label: '咨询', description: '询问班级相关事宜' },
  { value: 'other', label: '其他', description: '其他类型反馈' },
]

export function FeedbackForm({ isOpen, onClose }: FeedbackFormProps) {
  const { currentUser, addFeedback, showNotification } = useAppStore()
  
  const [type, setType] = React.useState<FeedbackType>('suggestion')
  const [content, setContent] = React.useState('')
  const [isAnonymous, setIsAnonymous] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  // ESC 关闭
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) {
      showNotification('请先登录后再提交反馈', 'error')
      return
    }
    
    if (!content.trim()) {
      showNotification('请输入反馈内容', 'error')
      return
    }
    
    setIsSubmitting(true)
    
    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const feedback: Feedback = {
      id: crypto.randomUUID(),
      user_id: currentUser.id,
      user_name: isAnonymous ? '匿名用户' : currentUser.name,
      student_id: isAnonymous ? '***' : currentUser.studentId,
      type,
      content: content.trim(),
      is_anonymous: isAnonymous,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    addFeedback(feedback)
    showNotification('反馈提交成功，感谢您的意见！', 'success')
    
    // 重置表单
    setType('suggestion')
    setContent('')
    setIsAnonymous(false)
    setIsSubmitting(false)
    onClose()
  }
  
  const resetAndClose = () => {
    setType('suggestion')
    setContent('')
    setIsAnonymous(false)
    onClose()
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={resetAndClose}
      />
      
      {/* 弹窗 */}
      <div className="relative w-full max-w-md mx-4 bg-card rounded-xl shadow-2xl animate-modal-in">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquarePlus className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">提交反馈</h2>
          </div>
          <button
            onClick={resetAndClose}
            className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 反馈类型选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">反馈类型</label>
            <div className="grid grid-cols-2 gap-2">
              {feedbackTypes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setType(item.value)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    type === item.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </button>
              ))}
            </div>
          </div>
          
          {/* 反馈内容 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">反馈内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请详细描述您的反馈..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/500
            </p>
          </div>
          
          {/* 匿名选项 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-input accent-primary"
            />
            <span className="text-sm">匿名提交（管理员将不会看到您的身份信息）</span>
          </label>
          
          {/* 提交按钮 */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="flex-1 gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  提交反馈
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
