# Supabase 配置指南

## 第一步：创建 Supabase 项目

1. 访问 https://supabase.com/ 并注册/登录
2. 点击 "New Project" 创建新项目
3. 填写项目名称和数据库密码
4. 等待项目初始化完成

## 第二步：获取 API 凭证

1. 进入项目后，点击左侧菜单的 "Settings" > "API"
2. 复制以下两个值：
   - `Project URL` (例如: https://xxxxx.supabase.co)
   - `anon public` key (一长串字符)

## 第三步：配置环境变量

在项目根目录创建 `.env.local` 文件，添加：

```env
NEXT_PUBLIC_SUPABASE_URL=你的_Project_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_public_key
```

**重要：** 不要将 `.env.local` 文件提交到 Git！它已在 `.gitignore` 中。

## 第四步：创建数据库表

在 Supabase 项目中，点击左侧菜单的 "SQL Editor"，执行以下 SQL：

```sql
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
  task_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- 建议表
CREATE TABLE suggestions (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_adopted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
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
  proposal_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  option TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
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

-- 启用实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE questions;
ALTER PUBLICATION supabase_realtime ADD TABLE suggestions;
ALTER PUBLICATION supabase_realtime ADD TABLE replies;
ALTER PUBLICATION supabase_realtime ADD TABLE proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE feedbacks;
```

## 第五步：重启开发服务器

配置完成后，重启 `npm run dev`，数据将自动同步到云端！

## 常见问题

**Q: 为什么要用 Supabase？**
A: Supabase 是开源的 Firebase 替代品，提供免费的云数据库和实时同步功能。

**Q: 数据安全吗？**
A: 数据存储在 Supabase 的云端，使用行级安全策略（RLS）保护。当前配置为公开访问（适合教学项目）。

**Q: 免费额度够用吗？**
A: Supabase 免费计划提供 500MB 数据库和每月 2GB 传输，对于班级管理系统完全够用。
