"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { SchedulerStatus } from "@/lib/types";

export default function SchedulerPage() {
  const [scheduler, setScheduler] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [now, setNow] = useState(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadScheduler = useCallback(async () => {
    try {
      const res = await api.config.scheduler();
      if (res.success && res.data) {
        setScheduler(res.data as SchedulerStatus);
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScheduler();
    intervalRef.current = setInterval(loadScheduler, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadScheduler]);

  // Update clock every second for the timeline bar
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  if (loading) return <p className="text-gray-400 max-w-7xl mx-auto px-6 py-8">加载中...</p>;

  const hour = now.getHours();
  const minute = now.getMinutes();
  const dayProgress = ((hour * 60 + minute) / 1440) * 100;

  const ops = [
    { label: "采集", active: scheduler?.collect ?? false },
    { label: "分析", active: scheduler?.analyze ?? false },
    { label: "推送", active: scheduler?.push ?? false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">调度状态</h1>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              更新于 {lastUpdated.toLocaleTimeString("zh-CN")}
            </span>
          )}
          <a
            href="/config"
            className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            编辑调度配置 →
          </a>
        </div>
      </div>

      {/* Current status overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">当前时段</p>
          <p className="text-lg font-semibold">{scheduler?.period_name || "未激活"}</p>
          {scheduler?.period_key && (
            <p className="text-xs text-gray-400 mt-1">{scheduler.period_key}</p>
          )}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">日计划</p>
          <p className="text-lg font-semibold">{scheduler?.day_plan || "无"}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">报告模式</p>
          <p className="text-lg font-semibold">{scheduler?.report_mode || "无"}</p>
        </div>
      </div>

      {/* Timeline bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">今日时间线</h2>
          <span className="text-sm text-gray-500">
            {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}
          </span>
        </div>
        <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
          {/* Hour markers */}
          {Array.from({ length: 24 }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full border-l border-gray-200"
              style={{ left: `${(i / 24) * 100}%` }}
            >
              {i % 6 === 0 && (
                <span className="absolute -top-0 left-1 text-[10px] text-gray-400">
                  {String(i).padStart(2, "0")}:00
                </span>
              )}
            </div>
          ))}
          {/* Current time indicator */}
          <div
            className="absolute top-0 h-full bg-indigo-500/20 transition-all duration-1000"
            style={{ width: `${dayProgress}%` }}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-indigo-600 transition-all duration-1000"
            style={{ left: `${dayProgress}%` }}
          />
        </div>
      </div>

      {/* Operation status */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold mb-4">运行状态</h2>
        <div className="grid grid-cols-3 gap-4">
          {ops.map((op) => (
            <div key={op.label} className="text-center">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-lg font-bold mb-2 ${
                  op.active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {op.active ? "ON" : "OFF"}
              </div>
              <p className="text-sm font-medium">{op.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detail info */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="font-semibold mb-3">详细信息</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">AI 模式</dt>
            <dd>{scheduler?.ai_mode || "关闭"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">筛选方式</dt>
            <dd>{scheduler?.filter_method || "无"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">词频文件</dt>
            <dd className="truncate ml-4">{scheduler?.frequency_file || "默认"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">兴趣文件</dt>
            <dd className="truncate ml-4">{scheduler?.interests_file || "默认"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
