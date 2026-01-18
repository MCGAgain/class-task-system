-- 完全重建数据库表结构
-- 先删除所有表(如果存在),然后重新创建

-- 1. 删除所有依赖表(有外键的表必须先删除)
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS feedbacks CASCADE;
DROP TABLE IF EXISTS replies CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS suggestions CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. 重新创建所有表(使用TEXT类型的ID,与代码保持一致)

-- 用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 任务表
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL,
  creator_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 提问表
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建议表
CREATE TABLE suggestions (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_adopted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 回复表
CREATE TABLE replies (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL,
  parent_type TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  reply_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 提案表
CREATE TABLE proposals (
  id TEXT PRIMARY KEY,
  suggestion_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  content TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  submitter_name TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  voting_started_at TIMESTAMPTZ,
  auto_delete_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
);

-- 投票表
CREATE TABLE votes (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  option TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 通知表
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  link_type TEXT,
  link_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 反馈表
CREATE TABLE feedbacks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending',
  reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 启用实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE questions;
ALTER PUBLICATION supabase_realtime ADD TABLE suggestions;
ALTER PUBLICATION supabase_realtime ADD TABLE replies;
ALTER PUBLICATION supabase_realtime ADD TABLE proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE feedbacks;

-- 4. 插入超级管理员账号(用于测试)
INSERT INTO users (id, student_id, password, name, role, created_at)
VALUES (
  'super-admin-001',
  '超级管理员',
  'suse25101020216',
  '超级管理员',
  'super_admin',
  NOW()
)
ON CONFLICT (student_id) DO NOTHING;
