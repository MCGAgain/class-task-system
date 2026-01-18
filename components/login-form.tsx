'use client'

import * as React from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppStore, SUPER_ADMIN } from "@/store"
import type { User } from "@/types"

interface LoginFormProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginForm({ isOpen, onClose }: LoginFormProps) {
  const { setCurrentUser, users, addUser, getUserByStudentId, showNotification } = useAppStore()
  
  const [mode, setMode] = React.useState<'login' | 'register'>('login')
  const [formData, setFormData] = React.useState({
    studentId: '',
    password: '',
    name: '',
    confirmPassword: '',
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  
  // 重置表单
  React.useEffect(() => {
    if (isOpen) {
      setFormData({ studentId: '', password: '', name: '', confirmPassword: '' })
      setErrors({})
      setMode('login')
    }
  }, [isOpen])
  
  const validateLogin = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.studentId.trim()) {
      newErrors.studentId = '请输入学号'
    }
    
    if (!formData.password) {
      newErrors.password = '请输入密码'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const validateRegister = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.studentId.trim()) {
      newErrors.studentId = '请输入学号'
    } else if (!/^\d{6,12}$/.test(formData.studentId)) {
      newErrors.studentId = '学号应为6-12位数字'
    } else if (getUserByStudentId(formData.studentId)) {
      newErrors.studentId = '该学号已注册'
    }
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名'
    } else if (formData.name.length < 2 || formData.name.length > 20) {
      newErrors.name = '姓名长度应为2-20个字符'
    }
    
    if (!formData.password) {
      newErrors.password = '请输入密码'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少6位'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleLogin = async () => {
    if (!validateLogin()) return
    
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 检查超级管理员
    if (formData.studentId === SUPER_ADMIN.studentId) {
      if (formData.password === SUPER_ADMIN.password) {
        setCurrentUser(SUPER_ADMIN)
        showNotification(`欢迎回来，${SUPER_ADMIN.name}`, 'success')
        onClose()
      } else {
        setErrors({ password: '密码错误' })
      }
      setIsSubmitting(false)
      return
    }
    
    // 检查普通用户
    const user = getUserByStudentId(formData.studentId)
    if (user) {
      if (user.password === formData.password) {
        setCurrentUser(user)
        showNotification(`欢迎回来，${user.name}`, 'success')
        onClose()
      } else {
        setErrors({ password: '密码错误' })
      }
    } else {
      setErrors({ studentId: '该学号未注册，请先注册' })
    }
    
    setIsSubmitting(false)
  }
  
  const handleRegister = async () => {
    if (!validateRegister()) return
    
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const newUser: User = {
      id: crypto.randomUUID(),
      studentId: formData.studentId.trim(),
      password: formData.password,
      name: formData.name.trim(),
      role: 'user',
      created_at: new Date().toISOString(),
    }
    
    addUser(newUser)
    setCurrentUser(newUser)
    showNotification('注册成功！', 'success')
    onClose()
    
    setIsSubmitting(false)
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'login') {
      handleLogin()
    } else {
      handleRegister()
    }
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? '登录' : '注册'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {mode === 'login' ? '学号/账号' : '学号'}
          </label>
          <Input
            placeholder={mode === 'login' ? '请输入学号' : '请输入你的学号（6-12位数字）'}
            value={formData.studentId}
            onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
          />
          {errors.studentId && (
            <p className="text-xs text-destructive mt-1">{errors.studentId}</p>
          )}
        </div>
        
        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium mb-2">姓名</label>
            <Input
              placeholder="请输入你的真实姓名"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name}</p>
            )}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-2">密码</label>
          <Input
            type="password"
            placeholder={mode === 'login' ? '请输入密码' : '请设置密码（至少6位）'}
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          />
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password}</p>
          )}
        </div>
        
        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium mb-2">确认密码</label>
            <Input
              type="password"
              placeholder="请再次输入密码"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        )}
        
        <Button
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {mode === 'login' ? '登录' : '注册'}
        </Button>
        
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setErrors({})
            }}
            className="text-sm text-primary hover:underline"
          >
            {mode === 'login' ? '没有账号？立即注册' : '已有账号？立即登录'}
          </button>
        </div>
        
        {mode === 'login' && (
          <div className="pt-3 border-t text-center">
            <p className="text-xs text-muted-foreground">
              首次使用请先注册，管理员账号请联系站长获取
            </p>
          </div>
        )}
      </form>
    </Modal>
  )
}
