'use client'

import * as React from "react"
import { ThumbsUp, ThumbsDown, Minus, Play, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store"
import type { Proposal, VoteOption } from "@/types"

export function ProposalPage() {
  const { 
    proposals, 
    currentUser, 
    users,
    tasks,
    startVoting,
    addVote,
    showNotification 
  } = useAppStore()
  
  const [selectedProposal, setSelectedProposal] = React.useState<string | null>(null)
  
  const isSuperAdmin = currentUser?.role === 'super_admin'
  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin'
  
  // 自动清理过期的提案（被拒绝3天后或已通过7天后）
  React.useEffect(() => {
    const checkExpired = () => {
      const now = Date.now()
      proposals.forEach((proposal) => {
        if ((proposal.status === 'rejected' || proposal.status === 'approved') && proposal.auto_delete_at) {
          if (new Date(proposal.auto_delete_at).getTime() < now) {
            useAppStore.getState().deleteProposal(proposal.id)
          }
        }
      })
    }
    
    const interval = setInterval(checkExpired, 60000) // 每分钟检查一次
    checkExpired() // 立即检查一次
    
    return () => clearInterval(interval)
  }, [proposals])
  
  const handleStartVoting = (proposalId: string) => {
    startVoting(proposalId)
    showNotification('投票已开始', 'success')
  }
  
  const handleVote = (proposalId: string, option: VoteOption) => {
    if (!currentUser) return
    
    const vote = {
      id: crypto.randomUUID(),
      proposal_id: proposalId,
      user_id: currentUser.id,
      user_name: currentUser.name,
      option,
      created_at: new Date().toISOString(),
    }
    
    addVote(proposalId, vote)
    showNotification('投票成功', 'success')
  }
  
  const getProposalTask = (taskId: string) => {
    return tasks.find(t => t.id === taskId)
  }
  
  const getVotingProgress = (proposal: Proposal) => {
    const allAdmins = users.filter((u) => u.role === 'admin' || u.role === 'super_admin')
    const totalAdmins = allAdmins.length
    const totalVotes = proposal.votes.length
    const approveVotes = proposal.votes.filter((v) => v.option === 'approve').length
    const rejectVotes = proposal.votes.filter((v) => v.option === 'reject').length
    const abstainVotes = proposal.votes.filter((v) => v.option === 'abstain').length
    
    const votingRate = totalAdmins > 0 ? (totalVotes / totalAdmins) * 100 : 0
    const approvalRate = totalVotes > 0 ? (approveVotes / totalVotes) * 100 : 0
    
    return {
      totalAdmins,
      totalVotes,
      approveVotes,
      rejectVotes,
      abstainVotes,
      votingRate,
      approvalRate,
      hasVoted: proposal.votes.some(v => v.user_id === currentUser?.id),
    }
  }
  
  const getStatusBadge = (proposal: Proposal) => {
    switch (proposal.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-600 text-xs font-medium">
            <Clock className="w-3 h-3" />
            未审批
          </span>
        )
      case 'voting':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            投票中
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-600 text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            已通过
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 text-red-600 text-xs font-medium">
            <XCircle className="w-3 h-3" />
            未通过
          </span>
        )
    }
  }
  
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">提案投票</h2>
        <p className="text-sm text-muted-foreground mt-1">
          所有被收纳的建议将在此处公示并进行投票
        </p>
      </div>
      
      {proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <ThumbsUp className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">暂无提案</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            管理员收纳的建议将在此处显示
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const task = getProposalTask(proposal.task_id)
            const progress = getVotingProgress(proposal)
            
            return (
              <div
                key={proposal.id}
                id={`proposal-${proposal.id}`}
                className="p-4 rounded-xl border bg-card transition-all hover:shadow-md"
              >
                {/* 提案头部 */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(proposal)}
                      {proposal.status === 'rejected' && proposal.auto_delete_at && (
                        <span className="text-xs text-muted-foreground">
                          将于 {new Date(proposal.auto_delete_at).toLocaleDateString('zh-CN')} 自动删除
                        </span>
                      )}
                      {proposal.status === 'approved' && proposal.auto_delete_at && (
                        <span className="text-xs text-green-600">
                          公示至 {new Date(proposal.auto_delete_at).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">
                      来自任务: {task?.title || '未知任务'}
                    </h3>
                    <p className="text-base">{proposal.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      提交者: {proposal.submitter_name} · {new Date(proposal.created_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                
                {/* 投票进度 */}
                {proposal.status === 'voting' && (
                  <div className="my-4 p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">投票进度</span>
                      <span className="text-sm text-muted-foreground">
                        {progress.totalVotes}/{progress.totalAdmins} ({progress.votingRate.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-background rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progress.votingRate}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-green-600" />
                        <span>通过: {progress.approveVotes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsDown className="w-3 h-3 text-red-600" />
                        <span>反对: {progress.rejectVotes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Minus className="w-3 h-3 text-gray-600" />
                        <span>弃权: {progress.abstainVotes}</span>
                      </div>
                    </div>
                    {progress.votingRate >= 60 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        支持率: {progress.approvalRate.toFixed(0)}% {progress.approvalRate >= 66.67 ? '(已达2/3)' : '(需≥66.67%)'}
                      </p>
                    )}
                  </div>
                )}
                
                {/* 操作按钮 */}
                <div className="flex items-center gap-2 pt-3 border-t">
                  {proposal.status === 'pending' && isSuperAdmin && (
                    <Button
                      size="sm"
                      onClick={() => handleStartVoting(proposal.id)}
                      className="gap-1"
                    >
                      <Play className="w-3 h-3" />
                      发起投票
                    </Button>
                  )}
                  
                  {proposal.status === 'voting' && isAdmin && !progress.hasVoted && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleVote(proposal.id, 'approve')}
                        className="gap-1 bg-green-600 hover:bg-green-700"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        通过
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleVote(proposal.id, 'reject')}
                        className="gap-1"
                      >
                        <ThumbsDown className="w-3 h-3" />
                        反对
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVote(proposal.id, 'abstain')}
                        className="gap-1"
                      >
                        <Minus className="w-3 h-3" />
                        弃权
                      </Button>
                    </div>
                  )}
                  
                  {proposal.status === 'voting' && progress.hasVoted && (
                    <span className="text-sm text-muted-foreground">已投票</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
