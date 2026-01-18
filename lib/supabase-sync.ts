import { supabase, isSupabaseConfigured } from './supabase'
import type { 
  User, 
  Task, 
  Question, 
  Suggestion, 
  Reply,
  Proposal, 
  Vote, 
  Notification, 
  Feedback 
} from '@/types'

// ==================== 用户操作 ====================

export async function syncUsers() {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('Error syncing users:', error)
    return []
  }
  return data || []
}

export async function addUserToSupabase(user: User) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('users').insert([user])
  if (error) console.error('Error adding user:', error)
}

export async function updateUserInSupabase(id: string, updates: Partial<User>) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('users').update(updates).eq('id', id)
  if (error) console.error('Error updating user:', error)
}

export async function deleteUserFromSupabase(id: string) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) console.error('Error deleting user:', error)
}

// ==================== 任务操作 ====================

export async function syncTasks() {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('Error syncing tasks:', error)
    return []
  }
  return data || []
}

export async function addTaskToSupabase(task: Task) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('tasks').insert([task])
  if (error) console.error('Error adding task:', error)
}

export async function updateTaskInSupabase(id: string, updates: Partial<Task>) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('tasks').update(updates).eq('id', id)
  if (error) console.error('Error updating task:', error)
}

export async function deleteTaskFromSupabase(id: string) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) console.error('Error deleting task:', error)
}

// ==================== 提问操作 ====================

export async function syncQuestions() {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase.from('questions').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('Error syncing questions:', error)
    return []
  }
  return data || []
}

export async function addQuestionToSupabase(question: Question) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('questions').insert([question])
  if (error) console.error('Error adding question:', error)
}

// ==================== 建议操作 ====================

export async function syncSuggestions() {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('Error syncing suggestions:', error)
    return []
  }
  return data || []
}

export async function addSuggestionToSupabase(suggestion: Suggestion) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('suggestions').insert([suggestion])
  if (error) console.error('Error adding suggestion:', error)
}

export async function updateSuggestionInSupabase(id: string, updates: Partial<Suggestion>) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('suggestions').update(updates).eq('id', id)
  if (error) console.error('Error updating suggestion:', error)
}

// ==================== 回复操作 ====================

export async function syncReplies() {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase.from('replies').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('Error syncing replies:', error)
    return []
  }
  return data || []
}

export async function addReplyToSupabase(reply: Reply) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('replies').insert([reply])
  if (error) console.error('Error adding reply:', error)
}

// ==================== 提案操作 ====================

export async function syncProposals() {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase.from('proposals').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('Error syncing proposals:', error)
    return []
  }
  return data || []
}

export async function addProposalToSupabase(proposal: Proposal) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('proposals').insert([proposal])
  if (error) console.error('Error adding proposal:', error)
}

export async function updateProposalInSupabase(id: string, updates: Partial<Proposal>) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('proposals').update(updates).eq('id', id)
  if (error) console.error('Error updating proposal:', error)
}

export async function deleteProposalFromSupabase(id: string) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('proposals').delete().eq('id', id)
  if (error) console.error('Error deleting proposal:', error)
}

// ==================== 投票操作 ====================

export async function syncVotes() {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase.from('votes').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('Error syncing votes:', error)
    return []
  }
  return data || []
}

export async function addVoteToSupabase(vote: Vote) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('votes').insert([vote])
  if (error) console.error('Error adding vote:', error)
}

// ==================== 通知操作 ====================

export async function syncNotifications() {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('Error syncing notifications:', error)
    return []
  }
  return data || []
}

export async function addNotificationToSupabase(notification: Notification) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('notifications').insert([notification])
  if (error) console.error('Error adding notification:', error)
}

export async function updateNotificationInSupabase(id: string, updates: Partial<Notification>) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('notifications').update(updates).eq('id', id)
  if (error) console.error('Error updating notification:', error)
}

export async function deleteNotificationFromSupabase(id: string) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('notifications').delete().eq('id', id)
  if (error) console.error('Error deleting notification:', error)
}

// ==================== 反馈操作 ====================

export async function syncFeedbacks() {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('Error syncing feedbacks:', error)
    return []
  }
  return data || []
}

export async function addFeedbackToSupabase(feedback: Feedback) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('feedbacks').insert([feedback])
  if (error) console.error('Error adding feedback:', error)
}

export async function updateFeedbackInSupabase(id: string, updates: Partial<Feedback>) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('feedbacks').update(updates).eq('id', id)
  if (error) console.error('Error updating feedback:', error)
}

export async function deleteFeedbackFromSupabase(id: string) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('feedbacks').delete().eq('id', id)
  if (error) console.error('Error deleting feedback:', error)
}

// ==================== 实时订阅 ====================

export function subscribeToTable(tableName: string, callback: (payload: any) => void) {
  if (!isSupabaseConfigured()) return null
  
  const subscription = supabase
    .channel(`${tableName}-changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, callback)
    .subscribe()
  
  return subscription
}
