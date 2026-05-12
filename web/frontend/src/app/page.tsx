"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { SystemStatus, TrendingResponse, NewsListResponse } from "@/lib/types";

function StatusCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [trending, setTrending] = useState<TrendingResponse | null>(null);
  const [news, setNews] = useState<NewsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [statusRes, trendingRes, newsRes] = await Promise.all([
          api.system.status(),
          api.news.trending({ top_n: 10 }),
          api.news.latest({ limit: 20 }),
        ]);
        if (statusRes.success && statusRes.data) setStatus(statusRes.data as SystemStatus);
        if (trendingRes.success && trendingRes.data) setTrending(trendingRes.data as TrendingResponse);
        if (newsRes.success && newsRes.data) setNews(newsRes.data as NewsListResponse);
      } catch {
        setError("无法连接到后端服务");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <p className="text-sm text-gray-400 mt-2">请确保后端服务已启动 (localhost:8000)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatusCard
          label="系统状态"
          value={status?.health || "未知"}
          sub={`v${status?.system?.version || "?"}`}
        />
        <StatusCard
          label="数据存储"
          value={status?.data?.total_storage || "0 MB"}
          sub={`${status?.data?.oldest_record || "无"} ~ ${status?.data?.latest_record || "无"}`}
        />
        <StatusCard
          label="热点话题"
          value={String(trending?.topics?.length || 0)}
          sub={trending?.description || ""}
        />
        <StatusCard
          label="最新新闻"
          value={String(news?.total || 0)}
          sub="当前批次"
        />
      </div>

      {trending?.topics && trending.topics.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">热点话题 Top 10</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">#</th>
                  <th className="text-left px-4 py-3 font-medium">关键词</th>
                  <th className="text-right px-4 py-3 font-medium">频次</th>
                  <th className="text-right px-4 py-3 font-medium">匹配新闻</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trending.topics.map((t, i) => (
                  <tr key={t.keyword} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{t.keyword}</td>
                    <td className="px-4 py-3 text-right">{t.frequency}</td>
                    <td className="px-4 py-3 text-right">{t.matched_news}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {news?.items && news.items.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">最新新闻</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">排名</th>
                  <th className="text-left px-4 py-3 font-medium">标题</th>
                  <th className="text-left px-4 py-3 font-medium">平台</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {news.items.map((item) => (
                  <tr key={`${item.platform}-${item.title}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 w-16">{item.rank}</td>
                    <td className="px-4 py-3">
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">
                          {item.title}
                        </a>
                      ) : (
                        item.title
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 w-32">{item.platform_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
