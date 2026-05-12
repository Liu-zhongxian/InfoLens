import type { ApiResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    return { success: false, data: null, error: `HTTP ${res.status}` };
  }
  return res.json();
}

export const api = {
  system: {
    status: () => fetchApi("/api/system/status"),
    version: () => fetchApi("/api/system/version"),
    doctor: () => fetchApi("/api/system/doctor"),
  },
  news: {
    latest: (params?: {
      platforms?: string;
      limit?: number;
      include_url?: boolean;
    }) => {
      const sp = new URLSearchParams();
      if (params?.platforms) sp.set("platforms", params.platforms);
      if (params?.limit) sp.set("limit", String(params.limit));
      if (params?.include_url) sp.set("include_url", "true");
      return fetchApi(`/api/news/latest?${sp}`);
    },
    byDate: (
      date: string,
      params?: { platforms?: string; limit?: number }
    ) => {
      const sp = new URLSearchParams();
      if (params?.platforms) sp.set("platforms", params.platforms);
      if (params?.limit) sp.set("limit", String(params.limit));
      return fetchApi(`/api/news/date/${date}?${sp}`);
    },
    trending: (params?: {
      top_n?: number;
      mode?: string;
      extract_mode?: string;
    }) => {
      const sp = new URLSearchParams();
      if (params?.top_n) sp.set("top_n", String(params.top_n));
      if (params?.mode) sp.set("mode", params.mode);
      if (params?.extract_mode) sp.set("extract_mode", params.extract_mode);
      return fetchApi(`/api/news/trending?${sp}`);
    },
    crawl: (params?: {
      platforms?: string;
      save_to_local?: boolean;
      include_url?: boolean;
    }) => {
      const sp = new URLSearchParams();
      if (params?.platforms) sp.set("platforms", params.platforms);
      if (params?.save_to_local) sp.set("save_to_local", "true");
      if (params?.include_url) sp.set("include_url", "true");
      return fetchApi(`/api/news/crawl?${sp}`, { method: "POST" });
    },
  },
  config: {
    get: (section?: string) =>
      fetchApi(`/api/config?section=${section || "all"}`),
    raw: () => fetchApi("/api/config/raw"),
    update: (yamlContent: string) =>
      fetchApi("/api/config", {
        method: "PUT",
        body: JSON.stringify({ yaml_content: yamlContent }),
      }),
    scheduler: () => fetchApi("/api/config/scheduler"),
  },
  rss: {
    latest: (params?: {
      feeds?: string;
      days?: number;
      limit?: number;
      include_summary?: boolean;
    }) => {
      const sp = new URLSearchParams();
      if (params?.feeds) sp.set("feeds", params.feeds);
      if (params?.days) sp.set("days", String(params.days));
      if (params?.limit) sp.set("limit", String(params.limit));
      if (params?.include_summary) sp.set("include_summary", "true");
      return fetchApi(`/api/rss/latest?${sp}`);
    },
    search: (params: {
      keyword: string;
      feeds?: string;
      days?: number;
      limit?: number;
    }) => {
      const sp = new URLSearchParams();
      sp.set("keyword", params.keyword);
      if (params.feeds) sp.set("feeds", params.feeds);
      if (params.days) sp.set("days", String(params.days));
      if (params.limit) sp.set("limit", String(params.limit));
      return fetchApi(`/api/rss/search?${sp}`);
    },
    feedsStatus: () => fetchApi("/api/rss/feeds/status"),
  },
  search: {
    news: (params: {
      query: string;
      search_mode?: string;
      platforms?: string;
      limit?: number;
      sort_by?: string;
      threshold?: number;
      include_url?: boolean;
      include_rss?: boolean;
    }) => {
      const sp = new URLSearchParams();
      sp.set("query", params.query);
      if (params.search_mode) sp.set("search_mode", params.search_mode);
      if (params.platforms) sp.set("platforms", params.platforms);
      if (params.limit) sp.set("limit", String(params.limit));
      if (params.sort_by) sp.set("sort_by", params.sort_by);
      if (params.threshold) sp.set("threshold", String(params.threshold));
      if (params.include_url) sp.set("include_url", "true");
      if (params.include_rss) sp.set("include_rss", "true");
      return fetchApi(`/api/search?${sp}`);
    },
    related: (params: {
      reference_title: string;
      threshold?: number;
      limit?: number;
    }) => {
      const sp = new URLSearchParams();
      sp.set("reference_title", params.reference_title);
      if (params.threshold) sp.set("threshold", String(params.threshold));
      if (params.limit) sp.set("limit", String(params.limit));
      return fetchApi(`/api/search/related?${sp}`);
    },
  },
  analytics: {
    trending: (params?: {
      top_n?: number;
      mode?: string;
      extract_mode?: string;
    }) => {
      const sp = new URLSearchParams();
      if (params?.top_n) sp.set("top_n", String(params.top_n));
      if (params?.mode) sp.set("mode", params.mode);
      if (params?.extract_mode) sp.set("extract_mode", params.extract_mode);
      return fetchApi(`/api/analytics/trending?${sp}`);
    },
    trend: (params: {
      topic: string;
      analysis_type?: string;
      start_date?: string;
      end_date?: string;
      granularity?: string;
      threshold?: number;
      time_window?: number;
      lookahead_hours?: number;
      confidence_threshold?: number;
    }) => {
      const sp = new URLSearchParams();
      sp.set("topic", params.topic);
      if (params.analysis_type) sp.set("analysis_type", params.analysis_type);
      if (params.start_date) sp.set("start_date", params.start_date);
      if (params.end_date) sp.set("end_date", params.end_date);
      if (params.granularity) sp.set("granularity", params.granularity);
      if (params.threshold) sp.set("threshold", String(params.threshold));
      if (params.time_window) sp.set("time_window", String(params.time_window));
      if (params.lookahead_hours) sp.set("lookahead_hours", String(params.lookahead_hours));
      if (params.confidence_threshold) sp.set("confidence_threshold", String(params.confidence_threshold));
      return fetchApi(`/api/analytics/trend?${sp}`);
    },
    insights: (params: {
      insight_type?: string;
      topic?: string;
      start_date?: string;
      end_date?: string;
      min_frequency?: number;
      top_n?: number;
    }) => {
      const sp = new URLSearchParams();
      if (params.insight_type) sp.set("insight_type", params.insight_type);
      if (params.topic) sp.set("topic", params.topic);
      if (params.start_date) sp.set("start_date", params.start_date);
      if (params.end_date) sp.set("end_date", params.end_date);
      if (params.min_frequency) sp.set("min_frequency", String(params.min_frequency));
      if (params.top_n) sp.set("top_n", String(params.top_n));
      return fetchApi(`/api/analytics/insights?${sp}`);
    },
    sentiment: (params?: {
      topic?: string;
      platforms?: string;
      start_date?: string;
      end_date?: string;
      limit?: number;
      sort_by_weight?: boolean;
      include_url?: boolean;
    }) => {
      const sp = new URLSearchParams();
      if (params?.topic) sp.set("topic", params.topic);
      if (params?.platforms) sp.set("platforms", params.platforms);
      if (params?.start_date) sp.set("start_date", params.start_date);
      if (params?.end_date) sp.set("end_date", params.end_date);
      if (params?.limit) sp.set("limit", String(params.limit));
      if (params?.sort_by_weight !== undefined) sp.set("sort_by_weight", String(params.sort_by_weight));
      if (params?.include_url) sp.set("include_url", "true");
      return fetchApi(`/api/analytics/sentiment?${sp}`);
    },
    aggregate: (params?: {
      start_date?: string;
      end_date?: string;
      platforms?: string;
      similarity_threshold?: number;
      limit?: number;
      include_url?: boolean;
    }) => {
      const sp = new URLSearchParams();
      if (params?.start_date) sp.set("start_date", params.start_date);
      if (params?.end_date) sp.set("end_date", params.end_date);
      if (params?.platforms) sp.set("platforms", params.platforms);
      if (params?.similarity_threshold) sp.set("similarity_threshold", String(params.similarity_threshold));
      if (params?.limit) sp.set("limit", String(params.limit));
      if (params?.include_url) sp.set("include_url", "true");
      return fetchApi(`/api/analytics/aggregate?${sp}`);
    },
    compare: (params: {
      period1_start: string;
      period1_end: string;
      period2_start: string;
      period2_end: string;
      topic?: string;
      compare_type?: string;
      platforms?: string;
      top_n?: number;
    }) => {
      const sp = new URLSearchParams();
      sp.set("period1_start", params.period1_start);
      sp.set("period1_end", params.period1_end);
      sp.set("period2_start", params.period2_start);
      sp.set("period2_end", params.period2_end);
      if (params.topic) sp.set("topic", params.topic);
      if (params.compare_type) sp.set("compare_type", params.compare_type);
      if (params.platforms) sp.set("platforms", params.platforms);
      if (params.top_n) sp.set("top_n", String(params.top_n));
      return fetchApi(`/api/analytics/compare?${sp}`);
    },
    report: (params?: {
      report_type?: string;
      start_date?: string;
      end_date?: string;
    }) => {
      const sp = new URLSearchParams();
      if (params?.report_type) sp.set("report_type", params.report_type);
      if (params?.start_date) sp.set("start_date", params.start_date);
      if (params?.end_date) sp.set("end_date", params.end_date);
      return fetchApi(`/api/analytics/report?${sp}`);
    },
  },
  tasks: {
    list: () => fetchApi("/api/tasks"),
    get: (taskId: string) => fetchApi(`/api/tasks/${taskId}`),
  },
  notification: {
    channels: () => fetchApi("/api/notification/channels"),
    test: (channels?: string[]) => {
      const sp = new URLSearchParams();
      if (channels) channels.forEach((c) => sp.append("channels", c));
      return fetchApi(`/api/notification/test?${sp}`, { method: "POST" });
    },
    send: (message: string, title?: string, channels?: string[]) => {
      const sp = new URLSearchParams();
      sp.set("message", message);
      if (title) sp.set("title", title);
      if (channels) channels.forEach((c) => sp.append("channels", c));
      return fetchApi(`/api/notification/send?${sp}`, { method: "POST" });
    },
  },
};
