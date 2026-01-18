'use client'

import * as React from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/store"
import type { Task, NewTaskData } from "@/types"

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  editTask?: Task | null
}

export function TaskForm({ isOpen, onClose, editTask }: TaskFormProps) {
  const { currentUser, addTask, updateTask, showNotification } = useAppStore()
  
  const [formData, setFormData] = React.useState<NewTaskData>({
    title: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<{ title?: string; description?: string }>({})
  
  // 当编辑任务变化时，填充表单
  React.useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title,
        description: editTask.description,
      })
    } else {
      setFormData({ title: '', description: '' })
    }
    setErrors({})
  }, [editTask, isOpen])
  
  const validate = (): boolean => {
    const newErrors: { title?: string; description?: string } = {}
    
    if (!formData.title.trim()) {
      newErrors.title = '请输入任务标题'
    } else if (formData.title.length > 50) {
      newErrors.title = '标题不能超过50个字符'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '请输入任务详情'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate() || !currentUser) return
    
    setIsSubmitting(true)
    
    // 模拟网络请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (editTask) {
      // 更新任务
      updateTask(editTask.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
      })
      showNotification('任务已更新', 'success')
    } else {
      // 新建任务
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: 'pending',
        is_pinned: false,
        is_archived: false,
        created_by: currentUser.id,
        creator_name: currentUser.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        questions: [],
        suggestions: [],
      }
      
      addTask(newTask)
      showNotification('新任务已发布', 'info')
    }
    
    setIsSubmitting(false)
    setFormData({ title: '', description: '' })
    onClose()
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTask ? '编辑任务' : '发布新任务'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            任务标题 <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="请输入任务标题（50字以内）"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            maxLength={50}
          />
          {errors.title && (
            <p className="text-xs text-destructive mt-1">{errors.title}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            任务详情 <span className="text-destructive">*</span>
          </label>
          <Textarea
            placeholder="请输入任务详情描述..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            maxLength={500}
            showCount
            className="min-h-[150px]"
          />
          {errors.description && (
            <p className="text-xs text-destructive mt-1">{errors.description}</p>
          )}
        </div>
        
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            type="submit"
            className="flex-1"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {editTask ? '保存修改' : '发布任务'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
