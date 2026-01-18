# 跨设备数据同步测试指南

本文档提供完整的跨设备数据同步测试方案,无需实际 Supabase 凭证即可理解测试流程。

## 测试环境准备

### 前置条件
- ✅ Supabase 项目已创建并配置
- ✅ `.env.local` 文件已设置正确的凭证
- ✅ 数据库表已通过 `SUPABASE_SETUP.md` 中的 SQL 创建
- ✅ 开发服务器已重启

### 测试设备
- **设备 A**: 电脑 (Chrome/Safari 浏览器)
- **设备 B**: 手机 (移动浏览器或扫描二维码访问)

---

## 测试用例 1: 账号注册与跨设备登录

### 目标
验证在电脑上注册的账号可以在手机上登录,并保持用户信息一致。

### 测试步骤

#### 在设备 A (电脑) 上:
1. 打开应用: `http://localhost:3000`
2. 点击右上角「登录」按钮
3. 选择「新用户注册」标签
4. 填写注册信息:
   ```
   学号: 202412345
   姓名: 测试用户A
   密码: test123456
   角色: 普通用户
   ```
5. 点击「注册」按钮
6. 验证注册成功提示
7. 验证自动登录,右上角显示用户名「测试用户A」

#### 在设备 B (手机) 上:
1. 打开同一应用 URL (可通过局域网 IP 访问,如 `http://192.168.x.x:3000`)
2. 点击「登录」按钮
3. 使用相同学号和密码登录:
   ```
   学号: 202412345
   密码: test123456
   ```
4. 点击「登录」按钮

### 预期结果
- ✅ 设备 B 成功登录,无「没有找到该账号」提示
- ✅ 设备 B 显示用户名「测试用户A」
- ✅ 用户角色、创建时间等信息一致

### 失败场景 (修复前)
- ❌ 设备 B 提示「没有找到该账号,请先注册」
- ❌ 原因: localStorage 只存储在本地,未同步到云端

---

## 测试用例 2: 任务创建与实时同步

### 目标
验证在一台设备创建的任务可以在另一台设备实时看到。

### 测试步骤

#### 在设备 A (电脑) 上:
1. 使用管理员账号登录 (学号: `超级管理员`, 密码: `suse25101020216`)
2. 点击「发布任务」按钮
3. 填写任务信息:
   ```
   标题: 期末考试注意事项
   描述: 请同学们准时参加考试,携带学生证和文具
   状态: 进行中
   ```
4. 点击「发布」
5. 验证任务出现在任务列表

#### 在设备 B (手机) 上:
1. 刷新页面 (或等待实时更新)
2. 查看任务列表

### 预期结果
- ✅ 设备 B 任务列表显示新创建的任务「期末考试注意事项」
- ✅ 任务详情(标题、描述、状态、创建时间)完全一致
- ✅ 任务创建者显示为「超级管理员」

### 高级验证 (实时订阅)
如果实现了实时订阅 (`subscribeToTable`):
- ✅ 设备 B 无需刷新页面,新任务自动出现
- ✅ 有动画效果展示新增任务

---

## 测试用例 3: 提问与回复同步

### 目标
验证在不同设备上对任务的提问和回复可以实时同步。

### 测试步骤

#### 在设备 B (手机) 上:
1. 使用普通用户账号登录 (测试用户A)
2. 找到任务「期末考试注意事项」
3. 点击「提问」按钮
4. 输入问题: `请问考试可以带计算器吗?`
5. 点击「提交」

#### 在设备 A (电脑) 上:
1. 刷新页面
2. 打开任务「期末考试注意事项」
3. 查看「提问区」

### 预期结果
- ✅ 设备 A 可以看到设备 B 提交的问题
- ✅ 问题显示提问者「测试用户A」和时间戳
- ✅ 管理员可以在设备 A 回复该问题

#### 在设备 A 回复后:
1. 点击问题下方「回复」按钮
2. 输入回复: `可以携带不具有编程功能的计算器`
3. 点击「提交」

#### 在设备 B (手机) 上:
1. 刷新页面
2. 查看该问题

### 预期结果
- ✅ 设备 B 可以看到管理员的回复
- ✅ 收到通知提示「您的问题有新回复」

---

## 测试用例 4: 提案投票同步

### 目标
验证提案创建、投票和状态变更可以跨设备同步。

### 测试步骤

#### 在设备 A (电脑) 上:
1. 使用普通用户登录
2. 切换到「提案投票」标签
3. 点击「发起提案」
4. 填写提案信息:
   ```
   标题: 建议增加自习室开放时间
   描述: 希望图书馆自习室延长至晚上10点
   ```
5. 点击「提交」

#### 在设备 B (手机) 上:
1. 使用另一个普通用户登录
2. 切换到「提案投票」标签
3. 找到提案「建议增加自习室开放时间」
4. 点击「赞成」按钮

#### 在设备 A (电脑) 上:
1. 刷新页面
2. 查看该提案的投票统计

### 预期结果
- ✅ 设备 A 显示赞成票数增加 1
- ✅ 投票进度条更新
- ✅ 提案发起人收到投票通知

---

## 测试用例 5: 通知系统同步

### 目标
验证通知在多设备间同步,已读状态保持一致。

### 测试步骤

#### 在设备 A (电脑) 上:
1. 使用管理员账号登录
2. 创建新任务或回复某个问题 (触发通知)

#### 在设备 B (手机) 上:
1. 使用被通知的用户登录
2. 查看右上角通知图标
3. 验证有未读通知徽章 (红点显示数量)
4. 点击通知图标打开通知中心
5. 点击某条通知,标记为已读

#### 在设备 A (电脑) 上:
1. 使用相同用户登录
2. 查看通知中心

### 预期结果
- ✅ 设备 A 显示相同的通知列表
- ✅ 在设备 B 标记为已读的通知,在设备 A 也显示为已读
- ✅ 未读通知数量一致

---

## 测试用例 6: 意见反馈同步

### 目标
验证学生提交的意见反馈可以跨设备查看和处理。

### 测试步骤

#### 在设备 B (手机) 上:
1. 使用普通用户登录
2. 点击顶部菜单「意见反馈」
3. 填写反馈信息:
   ```
   反馈类型: 功能建议
   反馈内容: 希望增加作业提醒功能
   ```
4. 点击「提交」

#### 在设备 A (电脑) 上:
1. 使用超级管理员登录
2. 打开通知中心
3. 查看新收到的反馈通知
4. 点击查看反馈详情
5. 填写处理意见并更新状态

#### 在设备 B (手机) 上:
1. 打开通知中心
2. 查看反馈处理结果

### 预期结果
- ✅ 管理员可以在设备 A 看到设备 B 提交的反馈
- ✅ 管理员的处理意见在设备 B 可见
- ✅ 反馈状态(待处理→已处理)同步更新

---

## 测试用例 7: 数据一致性压力测试

### 目标
验证多设备并发操作时数据一致性。

### 测试步骤

#### 同时在两台设备上:
1. 登录相同的管理员账号
2. 设备 A: 创建任务 X
3. 设备 B: 创建任务 Y
4. 设备 A: 编辑任务 Y 的描述
5. 设备 B: 删除任务 X
6. 刷新两台设备

### 预期结果
- ✅ 两台设备最终显示相同的任务列表
- ✅ 任务 Y 显示最新的编辑内容
- ✅ 任务 X 已被删除,不再显示
- ✅ 无数据丢失或重复

---

## 测试用例 8: 离线场景与数据恢复

### 目标
验证网络中断后恢复时的数据同步行为。

### 测试步骤

#### 在设备 A (电脑) 上:
1. 登录管理员账号
2. 关闭网络连接 (断开 WiFi 或禁用网络)
3. 尝试创建新任务

#### 预期行为 (优雅降级):
- ⚠️ 显示警告: "当前未连接到 Supabase,数据仅保存在本地"
- ⚠️ 任务保存到 localStorage
- ⚠️ 任务在当前设备可见,但其他设备不可见

#### 恢复网络后:
1. 重新连接网络
2. 刷新页面

#### 预期结果:
- ✅ 应用重新从 Supabase 加载数据
- ⚠️ 离线期间创建的数据可能丢失 (除非实现了冲突解决)
- ℹ️ 建议: 显示「同步状态」指示器,提醒用户当前是否在线

---

## 自动化测试脚本示例

### 使用 Playwright 模拟跨设备测试

```typescript
// tests/cross-device-sync.spec.ts
import { test, expect } from '@playwright/test'

test.describe('跨设备数据同步', () => {
  test('在浏览器 A 注册账号,在浏览器 B 登录', async ({ browser }) => {
    // 创建两个浏览器上下文模拟不同设备
    const contextA = await browser.newContext()
    const contextB = await browser.newContext()
    
    const pageA = await contextA.newPage()
    const pageB = await contextB.newPage()
    
    // 设备 A: 注册
    await pageA.goto('http://localhost:3000')
    await pageA.click('text=登录')
    await pageA.click('text=新用户注册')
    await pageA.fill('input[name="studentId"]', '202499999')
    await pageA.fill('input[name="name"]', '自动测试用户')
    await pageA.fill('input[name="password"]', 'auto123456')
    await pageA.click('button:has-text("注册")')
    await expect(pageA.locator('text=自动测试用户')).toBeVisible()
    
    // 设备 B: 登录
    await pageB.goto('http://localhost:3000')
    await pageB.click('text=登录')
    await pageB.fill('input[name="studentId"]', '202499999')
    await pageB.fill('input[name="password"]', 'auto123456')
    await pageB.click('button:has-text("登录")')
    await expect(pageB.locator('text=自动测试用户')).toBeVisible()
    
    await contextA.close()
    await contextB.close()
  })
  
  test('在设备 A 创建任务,在设备 B 可见', async ({ browser }) => {
    const contextA = await browser.newContext()
    const contextB = await browser.newContext()
    
    const pageA = await contextA.newPage()
    const pageB = await contextB.newPage()
    
    // 登录管理员
    await pageA.goto('http://localhost:3000')
    await pageA.click('text=登录')
    await pageA.fill('input[name="studentId"]', '超级管理员')
    await pageA.fill('input[name="password"]', 'suse25101020216')
    await pageA.click('button:has-text("登录")')
    
    // 创建任务
    const taskTitle = `自动测试任务 ${Date.now()}`
    await pageA.click('text=发布任务')
    await pageA.fill('input[name="title"]', taskTitle)
    await pageA.fill('textarea[name="description"]', '这是自动化测试创建的任务')
    await pageA.click('button:has-text("发布")')
    
    // 设备 B 验证
    await pageB.goto('http://localhost:3000')
    await pageB.waitForTimeout(1000) // 等待同步
    await expect(pageB.locator(`text=${taskTitle}`)).toBeVisible()
    
    await contextA.close()
    await contextB.close()
  })
})
```

---

## 故障排查

### 问题 1: 手机无法访问 localhost:3000

**原因**: localhost 是本地回环地址,仅电脑自己可访问

**解决方案**:
1. 查看电脑内网 IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```
2. 使用内网 IP 访问,如: `http://192.168.1.100:3000`
3. 确保手机和电脑在同一 WiFi 网络

### 问题 2: 数据未同步,仍显示「没有该账号」

**可能原因**:
- Supabase 凭证未配置或配置错误
- 数据库表未创建
- 开发服务器未重启

**解决方案**:
1. 检查 `.env.local` 文件是否存在且内容正确
2. 在 Supabase Dashboard 验证表是否创建成功
3. 重启开发服务器: `npm run dev`
4. 打开浏览器控制台,查看是否有 Supabase 错误日志

### 问题 3: 数据同步有延迟

**预期行为**:
- 当前实现: 需要刷新页面才能看到其他设备的更新
- 原因: 未启用实时订阅

**升级方案**:
在 `app/page.tsx` 中添加实时订阅:

```typescript
React.useEffect(() => {
  if (!currentUser) return
  
  const unsubscribe = subscribeToTable('tasks', () => {
    // 任务表有更新,重新加载
    initializeFromSupabase()
  })
  
  return unsubscribe
}, [currentUser])
```

---

## 测试检查清单

配置 Supabase 后,请依次验证以下功能:

- [ ] **用户注册与登录**
  - [ ] 电脑注册,手机可登录
  - [ ] 用户信息完整同步
  
- [ ] **任务管理**
  - [ ] 创建任务跨设备可见
  - [ ] 编辑任务跨设备更新
  - [ ] 删除任务跨设备移除
  - [ ] 任务置顶/归档状态同步
  
- [ ] **提问与回复**
  - [ ] 提问跨设备可见
  - [ ] 回复跨设备可见
  - [ ] 触发通知正常
  
- [ ] **提案投票**
  - [ ] 创建提案跨设备可见
  - [ ] 投票结果实时更新
  - [ ] 提案状态(待投票/已通过/未通过)同步
  
- [ ] **通知系统**
  - [ ] 通知跨设备显示
  - [ ] 已读状态同步
  - [ ] 通知数量徽章准确
  
- [ ] **意见反馈**
  - [ ] 提交反馈跨设备可见
  - [ ] 管理员处理结果同步

---

## 总结

完成上述测试后,您的应用应实现:
- ✅ 真正的跨设备数据互通
- ✅ 电脑和手机账号统一
- ✅ 实时或准实时的数据同步
- ✅ 多用户协作无冲突

如遇到问题,请查看:
1. 浏览器控制台错误日志
2. Supabase Dashboard 的日志面板
3. 网络请求是否正常 (Network 标签)
