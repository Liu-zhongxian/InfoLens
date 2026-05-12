"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { TrendingResponse } from "@/lib/types";

type Tab = "trending" | "trend" | "sentiment" | "insights" | "aggregate" | "report";

const TABS: { key: Tab; label: string }[] = [
  { key: "trending", label: "热点话题" },
  { key: "trend", label: "趋势分析" },
  { key: "sentiment", label: "情感分析" },
  { key: "insights", label: "数据洞察" },
  { key: "aggregate", label: "新闻聚合" },
  { key: "report", label: "摘要报告" },
];

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("trending");

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">分析</h1>
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "trending" && <TrendingTab />}
      {tab === "trend" && <TrendTab />}
      {tab === "sentiment" && <SentimentTab />}
      {tab === "insights" && <InsightsTab />}
      {tab === "aggregate" && <AggregateTab />}
      {tab === "report" && <ReportTab />}
    </div>
  );
}

function TrendingTab() {
  const [data, setData] = useState<TrendingResponse | null>(null);
  const [mode, setMode] = useState("current");
  const [extractMode, setExtractMode] = useState("keywords");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.analytics.trending({ top_n: 30, mode, extract_mode: extractMode });
        if (res.success && res.data) setData(res.data as TrendingResponse);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [mode, extractMode]);

  const maxFreq = data?.topics?.[0]?.frequency || 1;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm">
          <option value="current">最新批次</option>
          <option value="daily">当日累计</option>
        </select>
        <select value={extractMode} onChange={(e) => setExtractMode(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm">
          <option value="keywords">预设关键词</option>
          <option value="auto_extract">自动提取</option>
        </select>
      </div>
      {loading ? (
        <p className="text-gray-400">加载中...</p>
      ) : data?.topics && data.topics.length > 0 ? (
        <div className="space-y-3">
          {data.topics.map((t, i) => (
            <div key={t.keyword} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm w-6">{i + 1}</span>
                  <span className="font-medium">{t.keyword}</span>
                </div>
                <span className="text-sm text-gray-500">{t.frequency} 次 / {t.matched_news} 条</span>
              </div>
              <div className="ml-9">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(t.frequency / maxFreq) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">暂无数据</p>
      )}
      {data && <p className="text-xs text-gray-400 mt-6">{data.description} | 生成于 {data.generated_at}</p>}
    </div>
  );
}

function TrendTab() {
  const [topic, setTopic] = useState("");
  const [analysisType, setAnalysisType] = useState("trend");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await api.analytics.trend({ topic, analysis_type: analysisType });
      if (res.success && res.data) setResult(res.data as Record<string, unknown>);
    } finally {
      setLoading(false);
    }
  }, [topic, analysisType]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input type="text" placeholder="输入话题关键词..." value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAnalyze()} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64" />
        <select value={analysisType} onChange={(e) => setAnalysisType(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm">
          <option value="trend">热度趋势</option>
          <option value="lifecycle">生命周期</option>
          <option value="viral">爆火检测</option>
          <option value="predict">趋势预测</option>
        </select>
        <button onClick={handleAnalyze} disabled={loading || !topic.trim()} className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "分析中..." : "分析"}
        </button>
      </div>
      {result ? <ResultDisplay data={result} /> : <p className="text-gray-400">输入话题关键词开始分析</p>}
    </div>
  );
}

function SentimentTab() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.analytics.sentiment({ topic: topic || undefined, limit: 50 });
      if (res.success && res.data) setResult(res.data as Record<string, unknown>);
    } finally {
      setLoading(false);
    }
  }, [topic]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input type="text" placeholder="话题关键词（可选）..." value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAnalyze()} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64" />
        <button onClick={handleAnalyze} disabled={loading} className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "分析中..." : "分析情感"}
        </button>
      </div>
      {result ? <ResultDisplay data={result} /> : <p className="text-gray-400">可选输入话题关键词，点击分析</p>}
    </div>
  );
}

function InsightsTab() {
  const [insightType, setInsightType] = useState("platform_compare");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.analytics.insights({ insight_type: insightType, topic: topic || undefined });
      if (res.success && res.data) setResult(res.data as Record<string, unknown>);
    } finally {
      setLoading(false);
    }
  }, [insightType, topic]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <select value={insightType} onChange={(e) => setInsightType(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm">
          <option value="platform_compare">平台对比</option>
          <option value="platform_activity">平台活跃度</option>
          <option value="keyword_cooccur">关键词共现</option>
        </select>
        <input type="text" placeholder="话题关键词（可选）..." value={topic} onChange={(e) => setTopic(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48" />
        <button onClick={handleAnalyze} disabled={loading} className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "分析中..." : "分析"}
        </button>
      </div>
      {result ? <ResultDisplay data={result} /> : <p className="text-gray-400">选择洞察类型开始分析</p>}
    </div>
  );
}

function AggregateTab() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState(0.7);

  const handleLoad = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.analytics.aggregate({ similarity_threshold: threshold, limit: 50 });
      if (res.success && res.data) setResult(res.data as Record<string, unknown>);
    } finally {
      setLoading(false);
    }
  }, [threshold]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-600">相似度阈值:</label>
        <input type="number" min={0} max={1} step={0.1} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-24" />
        <button onClick={handleLoad} disabled={loading} className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "聚合中..." : "开始聚合"}
        </button>
      </div>
      {result ? <ResultDisplay data={result} /> : <p className="text-gray-400">设置相似度阈值后开始聚合</p>}
    </div>
  );
}

function ReportTab() {
  const [reportType, setReportType] = useState("daily");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.analytics.report({ report_type: reportType });
      if (res.success && res.data) setResult(res.data as Record<string, unknown>);
    } finally {
      setLoading(false);
    }
  }, [reportType]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm">
          <option value="daily">每日摘要</option>
          <option value="weekly">每周摘要</option>
        </select>
        <button onClick={handleGenerate} disabled={loading} className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "生成中..." : "生成报告"}
        </button>
      </div>
      {result ? <ResultDisplay data={result} /> : <p className="text-gray-400">选择报告类型后生成</p>}
    </div>
  );
}

function ResultDisplay({ data }: { data: Record<string, unknown> }) {
  const markdown = data.markdown_report as string | undefined;
  if (markdown) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">{markdown}</pre>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono overflow-auto max-h-[600px]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
