// src/app/components/TodayTasks.js
// 【役割】1週間カレンダーから「今日の日付」のデータだけを抽出して表示するコンポーネント（読み取り専用）

'use client';

import { useMemo } from 'react';

// 時間帯の定義と表示用ラベル
const PERIODS = [
  { key: 'morning', label: '午前', icon: '🌅' },
  { key: 'afternoon', label: '午後', icon: '☀️' },
  { key: 'night', label: '夜', icon: '🌙' },
];

export default function TodayTasks({ calendarSlots }) {
  // 1. 本日の日付文字列 ('YYYY-MM-DD' 形式) を取得
  const todayStr = useMemo(() => {
    const now = new Date();
    // 日本時間の年・月・日を正しくフォーマット
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // 2. 本日の日付のフォーマット表示用 (例: "8月11日 (火)")
  const formattedToday = useMemo(() => {
    const now = new Date();
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    return `${now.getMonth() + 1}月${now.getDate()}日 (${dayNames[now.getDay()]})`;
  }, []);

  // 3. 指定した時間帯(periodKey)の今日のタスクデータを取得するヘルパー関数
  const getTodayTaskForPeriod = (periodKey) => {
    const slot = calendarSlots.find(
      (s) => s.date === todayStr && s.period === periodKey
    );
    return slot?.weekly_tasks || null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* 見出し */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          今日絶対やること
        </h2>
        <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          {formattedToday}
        </span>
      </div>

      {/* 午前・午後・夜 の 3分割表示カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PERIODS.map((period) => {
          const task = getTodayTaskForPeriod(period.key);

          return (
            <div
              key={period.key}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between transition hover:border-slate-300"
            >
              {/* 時間帯ヘッダー */}
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500">
                <span>{period.icon}</span>
                <span>{period.label}</span>
              </div>

              {/* タスク内容表示エリア */}
              <div className="mt-1">
                {task ? (
                  <div className="flex items-center gap-2.5">
                    {/* タスク設定色付き丸バッジ */}
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: task.color || '#3b82f6' }}
                    />
                    <span className="font-semibold text-slate-800 text-sm line-clamp-1">
                      {task.title}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    予定なし
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}