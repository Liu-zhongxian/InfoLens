"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useWebSocket } from "@/lib/ws";
import type { TaskStatus } from "@/lib/types";

interface ChannelInfo {
  name: string;
  channel_id: string;
  configured: boolean;
  source: string;
}

interface ChannelsData {
  enabled: boolean;
  channels: ChannelInfo[];
}

export default function NotificationsPage() {
  const [channels, setChannels] = useState<ChannelsData | null>(null);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("InfoLens 通知");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [task, setTask] = useState<TaskStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { subscribe } = useWebSocket("tasks");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.notification.channels();
        if (res.success && res.data) {
          const data = res.data as ChannelsData;
          setChannels(data);
          setSelectedChannels(
            data.channels.filter((c) => c.configured).map((c) => c.channel_id)
          );
        }
      } finally {
        setLoading(false);
      }
    }
    load();
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
        error?: string;
      };
      if (msg.task_type === "send_notification") {
        setTask((prev) => ({
          id: msg.task_id,
          type: "send_notification",
          status: (msg.status as TaskStatus["status"]) || prev?.status || "pending",
          progress: msg.progress ?? prev?.progress ?? 0,
          message: msg.message ?? prev?.message ?? "",
          result: prev?.result ?? null,
          error: msg.error ?? prev?.error ?? null,
          created_at: prev?.created_at || new Date().toISOString(),
          completed_at: prev?.completed_at ?? null,
        }));
      }
    });
    return unsub;
  }, [subscribe]);

  const handleTest = useCallback(async () => {
    setTask(null);
    const res = await api.notification.test(
      selectedChannels.length > 0 ? selectedChannels : undefined
    );
    if (res.success && res.data) {
      const data = res.data as { task_id: string };
      setTask({
        id: data.task_id,
        type: "send_notification",
        status: "pending",
        progress: 0,
        message: "任务已提交",
        result: null,
        error: null,
        created_at: new Date().toISOString(),
        completed_at: null,
      });
    }
  }, [selectedChannels]);

  const handleSend = useCallback(async () => {
    if (!message.trim()) return;
    setTask(null);
    const res = await api.notification.send(
      message,
      title,
      selectedChannels.length > 0 ? selectedChannels : undefined
    );
    if (res.success && res.data) {
      const data = res.data as { task_id: string };
      setTask({
        id: data.task_id,
        type: "send_notification",
        status: "pending",
        progress: 0,
        message: "任务已提交",
        result: null,
        error: null,
        created_at: new Date().toISOString(),
        completed_at: null,
      });
    }
  }, [message, title, selectedChannels]);

  const toggleChannel = (id: string) => {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">通知管理</h1>

      {channels && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">通知渠道</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {channels.channels.map((ch) => (
              <div
                key={ch.channel_id}
                className={`bg-white rounded-lg border p-4 cursor-pointer transition-colors ${
                  selectedChannels.includes(ch.channel_id)
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-gray-200"
                } ${!ch.configured ? "opacity-50" : ""}`}
                onClick={() => ch.configured && toggleChannel(ch.channel_id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{ch.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      ch.configured
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {ch.configured ? "已配置" : "未配置"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{ch.source}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-semibold mb-4">发送测试通知</h3>
          <p className="text-sm text-gray-500 mb-4">
            向已选渠道发送一条测试消息，验证配置是否正确。
          </p>
          <button
            onClick={handleTest}
            disabled={task?.status === "running" || task?.status === "pending"}
            className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {task?.status === "running" ? "发送中..." : "发送测试"}
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-semibold mb-4">自定义通知</h3>
          <input
            type="text"
            placeholder="通知标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-full mb-3"
          />
          <textarea
            placeholder="消息内容（支持 Markdown）"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-full mb-3 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || task?.status === "running"}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            发送通知
          </button>
        </div>
      </div>

      {task && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              通知任务
              <span className="text-gray-400 ml-2 text-xs">#{task.id}</span>
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                task.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : task.status === "failed"
                  ? "bg-red-100 text-red-700"
                  : task.status === "running"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {task.status === "pending" && "等待中"}
              {task.status === "running" && "运行中"}
              {task.status === "completed" && "已完成"}
              {task.status === "failed" && "失败"}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full rounded-full transition-all ${
                task.status === "failed" ? "bg-red-500" : "bg-indigo-500"
              }`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">
            {task.message || `${task.progress}%`}
          </p>
          {task.error && (
            <p className="text-xs text-red-500 mt-1">{task.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
