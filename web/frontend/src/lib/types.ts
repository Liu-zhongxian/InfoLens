export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error?: string;
  message?: string;
}

export interface NewsItem {
  title: string;
  platform: string;
  platform_name: string;
  rank: number;
  timestamp?: string;
  url?: string;
  mobile_url?: string;
  avg_rank?: number;
  count?: number;
  date?: string;
}

export interface NewsListResponse {
  items: NewsItem[];
  total: number;
  platform?: string;
}

export interface TrendingTopic {
  keyword: string;
  frequency: number;
  matched_news: number;
  trend: string;
  weight_score: number;
}

export interface TrendingResponse {
  topics: TrendingTopic[];
  generated_at: string;
  mode: string;
  extract_mode: string;
  total_keywords: number;
  description: string;
}

export interface SystemStatus {
  system: {
    version: string;
    project_root: string;
  };
  data: {
    total_storage: string;
    oldest_record: string | null;
    latest_record: string | null;
  };
  cache: Record<string, unknown>;
  health: string;
}

export interface SchedulerStatus {
  period_key: string | null;
  period_name: string | null;
  day_plan: string | null;
  collect: boolean;
  analyze: boolean;
  push: boolean;
  report_mode: string;
  ai_mode: string;
  filter_method: string;
  frequency_file: string | null;
  interests_file: string | null;
}

export interface ConfigData {
  crawler: {
    enable_crawler: boolean;
    use_proxy: boolean;
    request_interval: number;
    retry_times: number;
    platforms: string[];
  };
  push: {
    enable_notification: boolean;
    enabled_channels: string[];
    message_batch_size: number;
  };
  keywords: {
    word_groups: Record<string, unknown>[];
    total_groups: number;
  };
  weights: {
    rank_weight: number;
    frequency_weight: number;
    hotness_weight: number;
  };
}

export interface RSSItem {
  title: string;
  url?: string;
  feed_id?: string;
  feed_name?: string;
  published?: string;
  summary?: string;
}

export interface RSSListResponse {
  items: Record<string, unknown>[];
  total: number;
}

export interface SearchResult {
  results: Record<string, unknown>[];
  total: number;
  query: string;
  search_mode: string;
}

export interface AnalyticsResult {
  result: Record<string, unknown>;
  analysis_type: string;
}

export interface TaskStatus {
  id: string;
  type: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  message: string;
  result: unknown;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface TaskProgressEvent {
  type: "task_progress" | "task_created";
  task_id: string;
  task_type?: string;
  status?: string;
  progress?: number;
  message?: string;
  error?: string;
}
