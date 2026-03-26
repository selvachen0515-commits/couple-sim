import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '情侣沟通模拟器',
  description: '模拟情侣对话场景，了解不同沟通方式的结局',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#fdf8f5]">
        {children}
      </body>
    </html>
  )
}
