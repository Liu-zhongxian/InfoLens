"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useWebSocket } from "@/lib/ws";
import type { NewsListResponse, TaskStatus } from "@/lib/types";

export default function NewsPage() {
  const [data, setData] = useState<NewsListResponse | null>(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [crawlTask, setCrawlTask] = useState<TaskStatus | null>(null);
  const { subscribe } = useWebSocket("tasks");

  async function loadNews(d?: string) {
    setLoading(true);
    try {
      const res = d
        ? await api.news.byDate(d, { limit: 100 })
        : await api.news.latest({ limit: 100 });
      if (res.success && res.data) setData(res.data as NewsListResponse);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    const unsub = subscribe((event: unknown) => {
      const msg = event as {
        type: string;
        task_id: string;
        task_type?: string;
        status?: string;
        progress?: number;
        message?: string;
      };
      if (msg.task_type === "crawl") {
        setCrawlTask((prev) => ({
          id: msg.task_id,
          type: "crawl",
          status: (msg.status as TaskStatus["status"]) || prev?.status || "pending",
          progress: msg.progress ?? prev?.progress ?? 0,
          message: msg.message ?? prev?.message ?? "",
          result: prev?.result ?? null,
          error: prev?.error ?? null,
          created_at: prev?.created_at || new Date().toISOString(),
          completed_at: prev?.completed_at ?? null,
        }));
        if (msg.status === "completed") {
          loadNews();
        }
      }
    });
    return unsub;
  }, [subscribe]);

  const handleCrawl = useCallback(async () => {
    const res = await api.news.crawl({ save_to_local: true, include_url: true });
    if (res.success && res.data) {
      const taskData = res.data as { task_id: string };
      setCrawlTask({
        id: taskData.task_id,
        type: "crawl",
        status: "pending",
        progress: 0,
        message: "任务已提交",
        result: null,
        error: null,
        created_at: new Date().toISOString(),
        completed_at: null,
      });
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">新闻流</h1>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
          <button
            onClick={() => loadNews(date || undefined)}
            className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-700"
          >
            查询
          </button>
          <button
            onClick={handleCrawl}
            disabled={crawlTask?.status === "running"}
            className="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {crawlTask?.status === "running" ? "爬取中..." : "立即爬取"}
          </button>
        </div>
      </div>

      {crawlTask && (
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              爬取任务
              <span className="text-gray-400 ml-2 text-xs">#{crawlTask.id}</span>
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                crawlTask.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : crawlTask.status === "failed"
                  ? "bg-red-100 text-red-700"
                  : crawlTask.status === "running"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {crawlTask.status === "pending" && "等待中"}
              {crawlTask.status === "running" && "运行中"}
              {crawlTask.status === "completed" && "已完成"}
              {crawlTask.status === "failed" && "失败"}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full rounded-full transition-all ${
                crawlTask.status === "failed" ? "bg-red-500" : "bg-green-500"
              }`}
              style={{ width: `${crawlTask.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">
            {crawlTask.message || `${crawlTask.progress}%`}
          </p>
          {crawlTask.error && (
            <p className="text-xs text-red-500 mt-1">{crawlTask.error}</p>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">加载中...</p>
      ) : data?.items && data.items.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium w-16">排名</th>
                <th className="text-left px-4 py-3 font-medium">标题</th>
                <th className="text-left px-4 py-3 font-medium w-32">平台</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.items.map((item) => (
                <tr key={`${item.platform}-${item.title}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{item.rank}</td>
                  <td className="px-4 py-3">
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{item.platform_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">暂无数据</p>
      )}
    </div>
  );
}
