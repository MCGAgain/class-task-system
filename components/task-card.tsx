'use client'

import * as React from "react"
import { Pin, PinOff, Trash2, CheckCircle, Clock, PlayCircle, MessageCircle, Lightbulb, ChevronDown, ChevronUp, Edit3 } from "lucide-react"
import { cn, formatRelativeTime } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/store"
import type { Task, TaskStatus, Question, Suggestion } from "@/types"

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { currentUser, togglePinTask, updateTaskStatus, archiveTask, addQuestion, addSuggestion, showNotification } = useAppStore()
  
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [questionInput, setQuestionInput] = React.useState('')
  const [suggestionInput, setSuggestionInput] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isRemoving, setIsRemoving] = React.useState(false)
  
  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin'
  
  const statusConfig: Record<TaskStatus, { label: string; variant: 'secondary' | 'warning' | 'success'; icon: React.ReactNode }> = {
    pending: { label: '待完成', variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
    in_progress: { label: '进行中', variant: 'warning', icon: <PlayCircle className="w-3 h-3" /> },
    completed: { label: '已完成', variant: 'success', icon: <CheckCircle className="w-3 h-3" /> },
  }
  
  const handleStatusChange = (status: TaskStatus) => {
    updateTaskStatus(task.id, status)
    showNotification(`任务状态已更新为「${statusConfig[status].label}」`, 'success')
  }
  
  const handleComplete = () => {
    setIsRemoving(true)
    setTimeout(() => {
      archiveTask(task.id)
      showNotification('任务已完成并归档', 'success')
    }, 300)
  }
  
  const handleTogglePin = () => {
    togglePinTask(task.id)
    showNotification(task.is_pinned ? '已取消置顶' : '已置顶', 'success')
  }
  
  const handleSubmitQuestion = () => {
    if (!questionInput.trim() || !currentUser) return
    setIsSubmitting(true)
    
    const question: Question = {
      id: crypto.randomUUID(),
      task_id: task.id,
      user_id: currentUser.id,
      user_name: currentUser.name,
      content: questionInput.trim(),
      created_at: new Date().toISOString(),
    }
    
    setTimeout(() => {
      addQuestion(task.id, question)
      setQuestionInput('')
      setIsSubmitting(false)
      showNotification('提问已提交', 'success')
    }, 300)
  }
  
  const handleSubmitSuggestion = () => {
    if (!suggestionInput.trim() || !currentUser) return
    setIsSubmitting(true)
    
    const suggestion: Suggestion = {
      id: crypto.randomUUID(),
      task_id: task.id,
      user_id: currentUser.id,
      user_name: currentUser.name,
      content: suggestionInput.trim(),
      created_at: new Date().toISOString(),
    }
    
    setTimeout(() => {
      addSuggestion(task.id, suggestion)
      setSuggestionInput('')
      setIsSubmitting(false)
      showNotification('意见已提交', 'success')
    }, 300)
  }
  
  return (
    <Card 
      className={cn(
        "card-hover overflow-hidden",
        task.is_pinned && "pinned-highlight",
        isRemoving && "animate-fade-out"
      )}
    >
      {/* 任务头部 */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {task.is_pinned && (
                <Badge variant="warning" className="gap-1">
                  <Pin className="w-3 h-3" />
                  置顶
                </Badge>
              )}
              <Badge variant={statusConfig[task.status].variant} className="gap-1">
                {statusConfig[task.status].icon}
                {statusConfig[task.status].label}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1 truncate">{task.title}</h3>
            <p className="text-sm text-muted-foreground">
              {task.creator_name || '管理员'} · {formatRelativeTime(task.created_at)}
            </p>
          </div>
          
          {/* 管理员操作按钮 */}
          {isAdmin && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleTogglePin}
                title={task.is_pinned ? '取消置顶' : '置顶'}
              >
                {task.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </Button>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(task)}
                  title="编辑"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleComplete}
                className="text-success hover:text-success hover:bg-success/10"
                title="完成"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* 任务详情 */}
        <div className="mt-3 text-sm text-foreground/80 whitespace-pre-wrap">
          {task.description}
        </div>
        
        {/* 状态切换（管理员可见） */}
        {isAdmin && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">状态：</span>
            <div className="flex gap-1">
              {(['pending', 'in_progress'] as TaskStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={cn(
                    "px-2 py-1 text-xs rounded-md transition-all duration-200",
                    task.status === status
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {statusConfig[status].label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 展开/收起按钮 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-2 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors border-t"
      >
        <MessageCircle className="w-4 h-4" />
        <span>
          提问 ({task.questions?.length || 0}) · 意见 ({task.suggestions?.length || 0})
        </span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {/* 展开内容 */}
      {isExpanded && (
        <CardContent className="pt-4 space-y-6 animate-fade-in border-t">
          {/* 提问区 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-4 h-4 text-primary" />
              <h4 className="font-medium text-sm">提问区</h4>
            </div>
            
            {/* 提问列表 */}
            {task.questions && task.questions.length > 0 && (
              <div className="space-y-2 mb-3">
                {task.questions.map((q) => (
                  <div key={q.id} className="p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{q.user_name}</span>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(q.created_at)}</span>
                    </div>
                    <p className="text-sm text-foreground/80">{q.content}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* 提问输入 */}
            {currentUser && (
              <div className="space-y-2">
                <Textarea
                  placeholder="输入你的提问..."
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  maxLength={200}
                  className="min-h-[80px]"
                />
                <Button
                  size="sm"
                  onClick={handleSubmitQuestion}
                  disabled={!questionInput.trim() || isSubmitting}
                  isLoading={isSubmitting}
                >
                  提交提问
                </Button>
              </div>
            )}
          </div>
          
          {/* 意见区 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-accent" />
              <h4 className="font-medium text-sm">意见建议</h4>
            </div>
            
            {/* 意见列表 */}
            {task.suggestions && task.suggestions.length > 0 && (
              <div className="space-y-2 mb-3">
                {task.suggestions.map((s) => (
                  <div key={s.id} className="p-3 bg-accent/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{s.user_name}</span>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(s.created_at)}</span>
                    </div>
                    <p className="text-sm text-foreground/80">{s.content}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* 意见输入 */}
            {currentUser && (
              <div className="space-y-2">
                <Textarea
                  placeholder="输入你的意见建议..."
                  value={suggestionInput}
                  onChange={(e) => setSuggestionInput(e.target.value)}
                  maxLength={200}
                  className="min-h-[80px]"
                />
                <Button
                  size="sm"
                  variant="accent"
                  onClick={handleSubmitSuggestion}
                  disabled={!suggestionInput.trim() || isSubmitting}
                  isLoading={isSubmitting}
                >
                  提交意见
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
