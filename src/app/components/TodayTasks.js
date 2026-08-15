// src/app/components/TodayTasks.js
// 【役割】1週間カレンダーから「今日の日付」のデータだけを抽出して表示するコンポーネント（読み取り専用）

'use client';

import { useMemo } from 'react';
import { useLogicalDate } from '@/app/context/DateContext';

// 時間帯の定義と表示用ラベル
const PERIODS = [
    { key: 'morning', label: 'あさ' },
    { key: 'afternoon', label: 'ひる' },
    { key: 'night', label: 'よる' },
];

/* ★ busySlots = [] を props に追加 */
export default function TodayTasks({ calendarSlots }) {
    // 日付 Context から一括取得
    const { todayStr, formattedToday } = useLogicalDate();

    // 指定した時間帯(periodKey)の今日のタスクデータを取得するヘルパー関数
    const getTodayTaskForPeriod = (periodKey) => {
        const slot = calendarSlots.find(
            (s) => s.date === todayStr && s.period === periodKey
        );
        return slot?.weekly_tasks || null;
    };

    return (
        <div>
            {/* 本日の日付表示バッジ */}
            <div className="flex items-center justify-between mb-2">
                <span
                    className="inline-block -rotate-5 mt-3 mb-3
                    text-[11px] font-bold text-sky-700 
                    bg-sky-100 px-4.5 py-1.5 rounded-sm shadow-sm"
                >
                    {formattedToday} の予定
                </span>
            </div>

            {/* 朝・昼・夜 の 3分割カード */}
            <div className="flex-1 flex flex-col justify-around gap-2.5 min-h-0 overflow-y-auto">
                {PERIODS.map((period) => {
                    const task = getTodayTaskForPeriod(period.key);
                    return (
                        <div
                            key={period.key}
                            className="p-2 sm:p-2.5 rounded-xl 
                            flex flex-col justify-center gap-4 text-xs h-auto shrink-0"
                        >
                            {/* 上段：時間帯名 */}
                            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                                <span className="underline underline-offset-3 decoration-slate-300 decoration-2">
                                    {period.label}
                                </span>
                            </div>

                            {/* 下段：タスク表示エリア */}
                            <div className="w-full pl-1">
                                {task?.title === '予定あり' ? (
                                    <div className="flex items-start gap-1.5">
                                        <span className="ml-1.5 w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0 inline-block translate-y-[1px]"></span>
                                        <span className="pl-1.5 text-slate-500 text-xs leading-none break-words">
                                            予定あり
                                        </span>
                                    </div>
                                ) : task ? (
                                    <div className="flex items-start gap-1.5">
                                        <span
                                            className="font-md text-slate-700 text-xs leading-snug break-words flex-1 px-4 py-1.5"
                                            style={{ backgroundColor: task.color || '#3b82f6' }}
                                        >
                                            {task.title}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-[11px] text-slate-500 italic px-5">お休み</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}