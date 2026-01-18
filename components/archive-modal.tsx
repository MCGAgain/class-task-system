'use client'

import * as React from "react"
import { RotateCcw, Trash2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/store"
import { formatRelativeTime } from "@/lib/utils"

interface ArchiveModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ArchiveModal({ isOpen, onClose }: ArchiveModalProps) {
  const { archivedTasks, restoreTask, deleteTask, showNotification } = useAppStore()
  
  const handleRestore = (id: string) => {
    restoreTask(id)
    showNotification('任务已恢复', 'success')
  }
  
  const handleDelete = (id: string) => {
    if (confirm('确定要永久删除此任务吗？此操作不可恢复。')) {
      deleteTask(id)
      showNotification('任务已永久删除', 'info')
    }
  }
  
  const handleClearAll = () => {
    if (confirm('确定要清空所有历史任务吗？此操作不可恢复。')) {
      archivedTasks.forEach(task => deleteTask(task.id))
      showNotification('历史任务已清空', 'info')
    }
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="历史任务"
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {archivedTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无历史任务
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAll}
              >
                清空全部
              </Button>
            </div>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {archivedTasks.map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="success">已完成</Badge>
                      </div>
                      <h4 className="font-medium truncate">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        完成于 {formatRelativeTime(task.updated_at)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRestore(task.id)}
                        title="恢复任务"
                        className="text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(task.id)}
                        title="永久删除"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
