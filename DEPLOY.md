# 班级任务管理系统 - 部署指南

## 超级管理员账号

```
账号: admin
密码: admin123
```

> 首次部署后请立即修改密码！可在 `store/index.ts` 文件中修改 `SUPER_ADMIN` 对象的 password 字段。

---

## 部署方式

### 方式一：Vercel 部署（推荐，最简单）

1. **注册 Vercel 账号**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录

2. **上传项目到 GitHub**
   ```bash
   cd /Users/Zhuanz/alitest
   git init
   git add .
   git commit -m "初始化班级任务管理系统"
   ```
   - 在 GitHub 创建新仓库
   - 推送代码到 GitHub

3. **在 Vercel 导入项目**
   - 在 Vercel 控制台点击 "New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Deploy"
   - 等待部署完成，获得访问链接

### 方式二：服务器部署（Node.js）

1. **准备服务器**
   - 需要：Linux 服务器（Ubuntu/CentOS）
   - 安装 Node.js 18+
   ```bash
   # Ubuntu
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **上传项目文件**
   ```bash
   # 使用 scp 上传
   scp -r /Users/Zhuanz/alitest user@your-server:/home/user/
   ```

3. **在服务器上构建和运行**
   ```bash
   cd /home/user/alitest
   npm install
   npm run build
   npm run start
   ```

4. **使用 PM2 保持运行**
   ```bash
   npm install -g pm2
   pm2 start npm --name "task-manager" -- start
   pm2 save
   pm2 startup
   ```

5. **配置 Nginx 反向代理**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### 方式三：Docker 部署

1. **创建 Dockerfile**（已包含在项目中）
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **构建和运行**
   ```bash
   docker build -t task-manager .
   docker run -d -p 3000:3000 task-manager
   ```

---

## 数据存储说明

当前版本使用 **浏览器 localStorage** 存储数据：
- 优点：无需数据库配置，开箱即用
- 缺点：数据存储在每个用户的浏览器中，不能跨设备同步

如需多设备数据同步，可以：
1. 使用 Supabase 云数据库
2. 或搭建自己的后端服务

---

## 常见问题

### Q: 数据丢失了怎么办？
A: localStorage 数据存储在浏览器中，清除浏览器数据会导致丢失。建议定期备份。

### Q: 如何添加管理员？
A: 使用超级管理员账号登录后，在"用户管理"中可以将已注册的用户设为管理员。

### Q: 忘记密码怎么办？
A: 联系超级管理员，在用户管理中重置密码。

---

## 技术栈

- **前端框架**: Next.js 14
- **UI 样式**: Tailwind CSS
- **状态管理**: Zustand
- **图标**: Lucide React
- **语言**: TypeScript
