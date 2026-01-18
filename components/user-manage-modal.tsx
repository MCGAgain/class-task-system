'use client'

import * as React from "react"
import { UserPlus, Trash2, Shield, ShieldCheck, Users, Key, Search, RotateCcw } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppStore, SUPER_ADMIN } from "@/store"
import type { User } from "@/types"

interface UserManageModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UserManageModal({ isOpen, onClose }: UserManageModalProps) {
  const { users, updateUser, deleteUser, showNotification } = useAppStore()
  
  const [searchQuery, setSearchQuery] = React.useState('')
  const [editingUser, setEditingUser] = React.useState<User | null>(null)
  const [newPassword, setNewPassword] = React.useState('')
  const [showAddAdmin, setShowAddAdmin] = React.useState(false)
  const [adminForm, setAdminForm] = React.useState({ studentId: '', name: '', password: '' })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  
  // 过滤用户
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery.trim()) return users
    const query = searchQuery.toLowerCase()
    return users.filter(u => 
      u.studentId.includes(query) || 
      u.name.toLowerCase().includes(query)
    )
  }, [users, searchQuery])
  
  // 管理员列表
  const adminUsers = users.filter(u => u.role === 'admin')
  const normalUsers = users.filter(u => u.role === 'user')
  
  const handleResetPassword = (user: User) => {
    setEditingUser(user)
    setNewPassword('')
  }
  
  const confirmResetPassword = () => {
    if (!editingUser || !newPassword) return
    
    if (newPassword.length < 6) {
      showNotification('密码至少6位', 'error')
      return
    }
    
    updateUser(editingUser.id, { password: newPassword })
    showNotification(`已重置「${editingUser.name}」的密码`, 'success')
    setEditingUser(null)
    setNewPassword('')
  }
  
  const handleToggleAdmin = (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    updateUser(user.id, { role: newRole })
    showNotification(
      newRole === 'admin' 
        ? `已将「${user.name}」设为管理员` 
        : `已取消「${user.name}」的管理员权限`,
      'success'
    )
  }
  
  const handleDeleteUser = (user: User) => {
    if (confirm(`确定要删除用户「${user.name}」吗？此操作不可恢复。`)) {
      deleteUser(user.id)
      showNotification(`已删除用户「${user.name}」`, 'info')
    }
  }
  
  const handleAddAdmin = () => {
    const newErrors: Record<string, string> = {}
    
    if (!adminForm.studentId.trim()) {
      newErrors.studentId = '请输入学号'
    } else if (users.find(u => u.studentId === adminForm.studentId)) {
      newErrors.studentId = '该学号已存在'
    }
    
    if (!adminForm.name.trim()) {
      newErrors.name = '请输入姓名'
    }
    
    if (!adminForm.password || adminForm.password.length < 6) {
      newErrors.password = '密码至少6位'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    const { addUser } = useAppStore.getState()
    const newAdmin: User = {
      id: crypto.randomUUID(),
      studentId: adminForm.studentId.trim(),
      password: adminForm.password,
      name: adminForm.name.trim(),
      role: 'admin',
      created_at: new Date().toISOString(),
    }
    
    addUser(newAdmin)
    showNotification(`已添加管理员「${newAdmin.name}」`, 'success')
    setShowAddAdmin(false)
    setAdminForm({ studentId: '', name: '', password: '' })
    setErrors({})
  }
  
  const roleLabels = {
    super_admin: '超级管理员',
    admin: '管理员',
    user: '普通用户',
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="用户管理"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索学号或姓名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* 统计信息 */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>总用户: {users.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>管理员: {adminUsers.length}</span>
          </div>
        </div>
        
        {/* 添加管理员 */}
        {!showAddAdmin ? (
          <Button onClick={() => setShowAddAdmin(true)} className="w-full gap-2">
            <UserPlus className="w-4 h-4" />
            添加管理员账号
          </Button>
        ) : (
          <Card className="p-4 space-y-3">
            <h4 className="font-medium">添加管理员</h4>
            <Input
              placeholder="学号"
              value={adminForm.studentId}
              onChange={(e) => setAdminForm(prev => ({ ...prev, studentId: e.target.value }))}
            />
            {errors.studentId && <p className="text-xs text-destructive">{errors.studentId}</p>}
            <Input
              placeholder="姓名"
              value={adminForm.name}
              onChange={(e) => setAdminForm(prev => ({ ...prev, name: e.target.value }))}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            <Input
              type="password"
              placeholder="密码（至少6位）"
              value={adminForm.password}
              onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                setShowAddAdmin(false)
                setAdminForm({ studentId: '', name: '', password: '' })
                setErrors({})
              }}>
                取消
              </Button>
              <Button size="sm" onClick={handleAddAdmin}>
                确认添加
              </Button>
            </div>
          </Card>
        )}
        
        {/* 用户列表 */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
          {/* 超级管理员 */}
          <Card className="p-3 flex items-center justify-between bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{SUPER_ADMIN.name}</p>
                <p className="text-xs text-muted-foreground">账号: {SUPER_ADMIN.studentId}</p>
              </div>
            </div>
            <Badge variant="default">站长</Badge>
          </Card>
          
          {/* 其他用户 */}
          {filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {searchQuery ? '未找到匹配的用户' : '暂无注册用户'}
            </p>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    user.role === 'admin' ? 'bg-primary/10' : 'bg-secondary'
                  }`}>
                    <Shield className={`w-5 h-5 ${
                      user.role === 'admin' ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">学号: {user.studentId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {roleLabels[user.role]}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleResetPassword(user)}
                    title="重置密码"
                  >
                    <Key className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleToggleAdmin(user)}
                    title={user.role === 'admin' ? '取消管理员' : '设为管理员'}
                    className={user.role === 'admin' ? 'text-warning' : 'text-primary'}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDeleteUser(user)}
                    title="删除用户"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
        
        {/* 重置密码弹窗 */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-foreground/20" onClick={() => setEditingUser(null)} />
            <Card className="relative z-10 p-5 w-full max-w-sm animate-modal-in">
              <h4 className="font-medium mb-4">重置密码 - {editingUser.name}</h4>
              <Input
                type="password"
                placeholder="请输入新密码（至少6位）"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                  取消
                </Button>
                <Button onClick={confirmResetPassword} className="flex-1">
                  确认重置
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Modal>
  )
}
