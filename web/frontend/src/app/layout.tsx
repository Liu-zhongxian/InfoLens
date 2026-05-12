import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InfoLens - AI 新闻聚合与分析平台",
  description: "AI 驱动的多平台新闻聚合、分析与智能推送平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-indigo-600">InfoLens</span>
            <span className="text-sm text-gray-400">信透</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="/" className="hover:text-indigo-600 transition-colors">仪表盘</a>
            <a href="/news" className="hover:text-indigo-600 transition-colors">新闻</a>
            <a href="/rss" className="hover:text-indigo-600 transition-colors">RSS</a>
            <a href="/search" className="hover:text-indigo-600 transition-colors">搜索</a>
            <a href="/analytics" className="hover:text-indigo-600 transition-colors">分析</a>
            <a href="/notifications" className="hover:text-indigo-600 transition-colors">通知</a>
            <a href="/config" className="hover:text-indigo-600 transition-colors">配置</a>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
