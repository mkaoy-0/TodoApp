// src/app/components/TaskContainer.js
// 【役割】外枠のデザイン（背景、角丸、エリア枠幅）とタブ切り替えを一元管理する親コンポーネント

'use client';

import { useState, useMemo } from 'react';
import TodayTasks from './TodayTasks';
import WeeklyTaskManager from './WeeklyTaskManager';
import WeeklyCalendar from './WeeklyCalendar';

export default function TaskContainer({
    tasks,
    calendarSlots,
    onAddTask,
    onDeleteTask,
    loading,
    selectedTaskId, 
    onSelectTask,
    onClearSelection,
    activeTab,
    setActiveTab,
}) {
   // const [activeTab, setActiveTab] = useState('today');


    return (
        /* 【外枠ベース】（※ここは傾けないことで、コンテンツの真っ直ぐな位置基準になります） */
        <div
            className="relative rounded-2xl p-2 sm:p-3 h-full flex flex-col min-h-0 bg-transparent overflow-hidden -ml-1"
            onClick={onClearSelection}
        >

            {/* 【1層目：一番後ろ】少し左に傾けた色付きカード (-rotate-2) */}
            <div className="absolute inset-0 -rotate-2 rounded-none bg-sky-200 border border-emerald-200/60 shadow-sm pointer-events-none mt-1 mb-1" />

            {/* 【2層目：真ん中】少し右に傾け、さらに右寄りに配置した方眼紙カード (rotate-1 + left-3) */}
            <div
                className="absolute top-5 bottom-1 right-1 left-3 rotate-1 rounded-none bg-slate-50 border border-slate-300/80 shadow-sm pointer-events-none mt-1 mb-1"
                style={{
                    backgroundImage: `
                    linear-gradient(to right, rgba(0, 0, 0, 0.06) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0, 0, 0, 0.06) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                }}
            />

            {/* 【3層目：一番前】コンテンツ本体（※まっすぐそのままの位置） */}
            <div
                className="relative z-10 p-2 sm:p-3 h-full flex flex-col min-h-0"
            >

                {/* タブ切り替えヘッダー */}
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2 shrink-0">
                    <div className="flex gap-2 p-1">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation(); // 選択解除イベントの誤発火を防ぐ
                                setActiveTab('today');
                            }}
                            className={`relative inline-block -rotate-18 mt-0 pr-2 sm:pr-4 py-2 text-[11px] text-xs font-bold transition shadow-sm ${activeTab === 'today'
                                ? 'bg-white text-amber-700 pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-3.5 before:bg-amber-400/70 text-left'
                                : 'bg-slate-200 text-slate-600 hover:text-slate-800 pl-4 text-left'
                                }`}
                        >
                            今日<br />やること
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab('weekly');
                            }}
                            className={`relative inline-block -rotate-18 mt-1 pr-2 sm:pr-4 py-2 text-[11px] sm:text-xs font-bold transition shadow-sm ${activeTab === 'weekly'
                                ? 'bg-white text-blue-700 pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-3.5 before:bg-blue-400 text-left'
                                : 'bg-slate-200 text-slate-600 hover:text-slate-800 pl-4 text-left'
                                }`}
                        >
                            今週<br />やること
                        </button>
                    </div>
                </div>

                {/* 中身コンポーネント */}
                <div
                    className="flex-1 min-h-0 overflow-hidden"
                    onClick={(e) => e.stopPropagation()} // 中身クリック時はエリア外解除を起こさせない
                >
                    {activeTab === 'today' ? (
                        <TodayTasks
                            calendarSlots={calendarSlots}
                            loading={loading}
                        />
                    ) : (
                        <WeeklyTaskManager
                            tasks={tasks}
                            onAddTask={onAddTask}
                            onDeleteTask={onDeleteTask}
                            loading={loading}
                            selectedTaskId={selectedTaskId}
                            onSelectTask={onSelectTask}
                            isEditable={true} // 『今週やること』タブのみ編集可能
                        />
                    )}
                </div>

            </div>
        </div>
    );
}