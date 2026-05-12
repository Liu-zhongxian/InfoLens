"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState("keyword");
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [relatedResults, setRelatedResults] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [relatedTitle, setRelatedTitle] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setRelatedResults([]);
    setRelatedTitle(null);
    try {
      const res = await api.search.news({
        query,
        search_mode: searchMode,
        limit: 100,
        include_url: true,
      });
      if (res.success && res.data) {
        const data = res.data as { results: Record<string, unknown>[]; total: number };
        setResults(data.results);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleFindRelated(title: string) {
    setRelatedTitle(title);
    try {
      const res = await api.search.related({
        reference_title: title,
        limit: 20,
      });
      if (res.success && res.data) {
        const data = res.data as { related_news: Record<string, unknown>[] };
        setRelatedResults(data.related_news || []);
      }
    } catch {
      setRelatedResults([]);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">搜索</h1>

      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="输入关键词搜索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="border border-gray-300 rounded px-4 py-2 text-sm flex-1 max-w-lg"
        />
        <select
          value={searchMode}
          onChange={(e) => setSearchMode(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="keyword">关键词匹配</option>
          <option value="fuzzy">模糊搜索</option>
          <option value="entity">实体搜索</option>
        </select>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="bg-indigo-600 text-white px-6 py-2 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "搜索中..." : "搜索"}
        </button>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          {results.length > 0 && (
            <>
              <p className="text-sm text-gray-500 mb-3">
                找到 {total} 条结果
              </p>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium w-16">排名</th>
                      <th className="text-left px-4 py-3 font-medium">标题</th>
                      <th className="text-left px-4 py-3 font-medium w-28">平台</th>
                      <th className="text-left px-4 py-3 font-medium w-20">分数</th>
                      <th className="text-left px-4 py-3 font-medium w-24">相关</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400">
                          {(item.rank as number) || i + 1}
                        </td>
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
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {(item.platform_name as string) || (item.platform as string) || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {item.score != null ? (item.score as number).toFixed(2) : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleFindRelated(item.title as string)}
                            className="text-indigo-600 text-xs hover:underline"
                          >
                            查找相关
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!loading && results.length === 0 && query && (
            <p className="text-gray-400">未找到匹配结果</p>
          )}
        </div>

        {relatedTitle && (
          <div className="w-80 shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold mb-2">相关新闻</h3>
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                基于: {relatedTitle}
              </p>
              {relatedResults.length > 0 ? (
                <div className="space-y-2">
                  {relatedResults.map((item, i) => (
                    <div key={i} className="text-sm">
                      {item.url ? (
                        <a
                          href={item.url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-indigo-600 text-sm"
                        >
                          {item.title as string}
                        </a>
                      ) : (
                        <span>{item.title as string}</span>
                      )}
                      <span className="text-xs text-gray-400 ml-2">
                        {item.platform_name as string}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">未找到相关新闻</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
