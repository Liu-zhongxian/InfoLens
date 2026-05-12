"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface FeedStatus {
  feeds: Record<string, unknown>;
  available_dates: string[];
  total_items: number;
}

export default function RSSPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [feedStatus, setFeedStatus] = useState<FeedStatus | null>(null);
  const [keyword, setKeyword] = useState("");
  const [days, setDays] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);

  async function loadLatest() {
    setLoading(true);
    setSearchMode(false);
    try {
      const res = await api.rss.latest({ days, limit: 100 });
      if (res.success && res.data) {
        const data = res.data as { items: Record<string, unknown>[] };
        setItems(data.items);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadFeedsStatus() {
    try {
      const res = await api.rss.feedsStatus();
      if (res.success && res.data) setFeedStatus(res.data as FeedStatus);
    } catch {
      // ignore
    }
  }

  async function handleSearch() {
    if (!keyword.trim()) return;
    setLoading(true);
    setSearchMode(true);
    try {
      const res = await api.rss.search({ keyword, days: 7, limit: 100 });
      if (res.success && res.data) {
        const data = res.data as { items: Record<string, unknown>[] };
        setItems(data.items);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLatest();
    loadFeedsStatus();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">RSS 订阅</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="搜索 RSS..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48"
          />
          <button
            onClick={handleSearch}
            className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-700"
          >
            搜索
          </button>
          <select
            value={days}
            onChange={(e) => {
              setDays(Number(e.target.value));
              if (!searchMode) loadLatest();
            }}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            <option value={1}>今天</option>
            <option value={3}>近3天</option>
            <option value={7}>近7天</option>
            <option value={30}>近30天</option>
          </select>
          {searchMode && (
            <button
              onClick={loadLatest}
              className="text-sm text-indigo-600 hover:underline"
            >
              返回最新
            </button>
          )}
        </div>
      </div>

      {feedStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">总条目数</p>
            <p className="text-xl font-semibold">{feedStatus.total_items}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">可用日期</p>
            <p className="text-xl font-semibold">{feedStatus.available_dates?.length || 0} 天</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">RSS 源</p>
            <p className="text-xl font-semibold">{Object.keys(feedStatus.feeds || {}).length} 个</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">加载中...</p>
      ) : items.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium">标题</th>
                <th className="text-left px-4 py-3 font-medium w-40">来源</th>
                <th className="text-left px-4 py-3 font-medium w-36">发布时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {item.url ? (
                      <a
                        href={item.url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-indigo-600"
                      >
                        {item.title as string}
                      </a>
                    ) : (
                      item.title as string
                    )}
                    {item.summary && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                        {item.summary as string}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {(item.feed_name as string) || (item.feed_id as string) || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {(item.published as string) || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">暂无 RSS 数据</p>
      )}
    </div>
  );
}
