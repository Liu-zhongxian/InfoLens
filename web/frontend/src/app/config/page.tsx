"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ConfigData, SchedulerStatus } from "@/lib/types";

export default function ConfigPage() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [scheduler, setScheduler] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [configRes, schedulerRes] = await Promise.all([
          api.config.get(),
          api.config.scheduler(),
        ]);
        if (configRes.success && configRes.data) setConfig(configRes.data as ConfigData);
        if (schedulerRes.success && schedulerRes.data) setScheduler(schedulerRes.data as SchedulerStatus);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="text-gray-400 max-w-7xl mx-auto px-6 py-8">加载中...</p>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">系统配置</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 爬虫配置 */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold mb-3">爬虫配置</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">启用爬虫</dt><dd>{config?.crawler?.enable_crawler ? "是" : "否"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">使用代理</dt><dd>{config?.crawler?.use_proxy ? "是" : "否"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">请求间隔</dt><dd>{config?.crawler?.request_interval}s</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">平台数量</dt><dd>{config?.crawler?.platforms?.length || 0}</dd></div>
          </dl>
        </div>

        {/* 推送配置 */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold mb-3">推送配置</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">启用通知</dt><dd>{config?.push?.enable_notification ? "是" : "否"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">消息批次大小</dt><dd>{config?.push?.message_batch_size}</dd></div>
            <div><dt className="text-gray-500 mb-1">已启用渠道</dt><dd className="flex flex-wrap gap-1">{config?.push?.enabled_channels?.map(c => <span key={c} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs">{c}</span>) || "无"}</dd></div>
          </dl>
        </div>

        {/* 调度状态 */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold mb-3">调度状态</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">当前时段</dt><dd>{scheduler?.period_name || "无"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">日计划</dt><dd>{scheduler?.day_plan || "无"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">采集</dt><dd>{scheduler?.collect ? "✓" : "✗"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">分析</dt><dd>{scheduler?.analyze ? "✓" : "✗"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">推送</dt><dd>{scheduler?.push ? "✓" : "✗"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">报告模式</dt><dd>{scheduler?.report_mode}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">筛选方式</dt><dd>{scheduler?.filter_method}</dd></div>
          </dl>
        </div>

        {/* 关键词配置 */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold mb-3">关键词配置</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">词组数量</dt><dd>{config?.keywords?.total_groups || 0}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">排名权重</dt><dd>{config?.weights?.rank_weight}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">频次权重</dt><dd>{config?.weights?.frequency_weight}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">热度权重</dt><dd>{config?.weights?.hotness_weight}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
