import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '班级任务管理系统 - 协作高效简洁',
  description: '轻量化校园班级工作任务协同管理平台，用于班委、导助发布日常工作任务，全体学生查看与互动。',
  keywords: ['班级管理', '任务协作', '校园工具', '班委', '学生'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
