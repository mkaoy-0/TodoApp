// src/app/components/WeeklyCalendar.js
// 【役割】SVGフィルターを活用し、切れ目のない綺麗な手描きクレヨン線を表現するカレンダー

'use client';

import { useMemo, useState } from 'react';
import { useLogicalDate } from '../context/DateContext';

// 時間帯の定義（縦3行）
const PERIODS = [
    { key: 'morning', label: '午前' },
    { key: 'afternoon', label: '午後' },
    { key: 'night', label: '夜' },
];

export default function WeeklyCalendar({
    weeklyTasks,
    calendarSlots,
    onSlotChange,
    selectedTaskId,
    isEditable = true,
}) {
    // DateContext から朝6時基準の現在日時(adjustedNow)を取得
    const { adjustedNow } = useLogicalDate();

    // ホバー中のマス（"2026-08-12-morning" のような文字列）を追跡
    const [hoveredSlotKey, setHoveredSlotKey] = useState(null);

    // 選択中のタスクオブジェクトを1回だけ取得
    const selectedTask = weeklyTasks.find((t) => Number(t.id) === Number(selectedTaskId));

    // 「予定あり」タスクを取得
    const busyTask = weeklyTasks.find((t) => t.title === '予定あり');

    const weekDays = useMemo(() => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

        const monday = new Date(now);
        monday.setDate(now.getDate() + distanceToMonday);

        const days = [];
        const dayNames = ['月', '火', '水', '木', '金', '土', '日'];

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);

            // 日本時間で YYYY-MM-DD を作成
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;

            days.push({
                dateStr: dateString,
                displayDate: `${d.getMonth() + 1}/${d.getDate()}`,
                dayName: dayNames[i],
                isToday: d.toDateString() === adjustedNow.toDateString(),
            });
        }
        return days;
    }, [adjustedNow]); // adjustedNow が更新されたら再計算

    const getSlot = (dateStr, periodKey) => {
        return calendarSlots.find(
            (slot) => slot.date === dateStr && slot.period === periodKey
        );
    };

    // マス目がクリックされたときの処理
    const handleCellClick = (dateStr, periodKey, currentSlot) => {
        // 編集不可（activeTab === 'today'）のときは何もせずに処理を中断
        if (!isEditable) return;

        if (selectedTaskId !== null && selectedTaskId !== undefined) {
            // 通常のタスク割り当て/解除
            const currentTaskId = currentSlot?.weekly_task_id ? Number(currentSlot.weekly_task_id) : null;
            const targetTaskId = Number(selectedTaskId);
            const newTaskId = currentTaskId === targetTaskId ? null : targetTaskId;
            onSlotChange(dateStr, periodKey, newTaskId);
        } else if (currentSlot?.weekly_task_id) {
            // 登録済みマス（「予定あり」含む）を押すと解除
            onSlotChange(dateStr, periodKey, null);
        } else if (busyTask) {
            // ★ タスク未選択で空マスを押したら「予定あり」タスクのIDを割り当てる
            onSlotChange(dateStr, periodKey, busyTask.id);
        }
    };

    return (
        /* 外枠：クリーム色のノート地に青/グレーの横罫線を繰り返す指定 ★ */
        <div
            className="rounded-sm shadow-sm p-1 h-full flex flex-col relative bg-amber-50/40"
            style={{
                backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 14px, rgba(139, 127, 100, 0.1) 14px, rgba(139, 127, 100, 0.1) 15px)',
                backgroundPosition: 'center',
                backgroundSize: 'calc(100% - 48px) 100%',
                backgroundRepeat: 'repeat-y',
            }}
        >
            {/* 外枠（上と左の閉じる線） */}
            <div
                className="w-full h-full flex flex-col border-t-2 border-l-2 border-slate-800/80"
                style={{ filter: 'url(#crayon-filter)' }}
            >

                {/* 1. 曜日ヘッダー行 */}
                <div className="grid grid-cols-7 gap-0 text-center text-[9px] sm:text-xs font-bold text-slate-700 flex-1 min-h-0 w-full">
                    {weekDays.map((day) => {
                        let textColorClass = 'text-slate-700';
                        if (day.dayName === '土') textColorClass = 'text-blue-600 font-extrabold';
                        if (day.dayName === '日') textColorClass = 'text-red-500 font-extrabold';

                        return (
                            <div key={day.dateStr} className="relative h-full w-full min-h-0">
                                <div
                                    className={`border-r-2 border-b-2 border-slate-800/80 bg-white/30 ${textColorClass} ${day.isToday ? 'font-black' : ''
                                        } h-full w-full flex flex-col items-center justify-center leading-tight overflow-hidden`}
                                >
                                    <div>{day.dayName}</div>
                                    <div className="text-[8px] sm:text-[10px] font-normal text-slate-500">
                                        {day.displayDate}
                                    </div>
                                </div>

                                {day.isToday && (
                                    <img
                                        src="/pin_2.png"
                                        alt="Pin"
                                        className="absolute -top-2 -left-1 w-8.5 h-6 sm:-top-2.5 sm:-left-2 sm:w-10 sm:h-8 drop-shadow-sm pointer-events-none z-20 object-contain"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 2. データ行エリア（午前・午後・夜 の 3行） */}
                <div className="flex-[3] flex flex-col min-h-0 w-full">
                    {PERIODS.map((period) => (
                        <div key={period.key} className="grid grid-cols-7 gap-0 flex-1 min-h-0 w-full">
                            {weekDays.map((day) => {
                                const currentSlot = getSlot(day.dateStr, period.key);
                                const assignedTask = currentSlot?.weekly_tasks;
                                const slotKey = `${day.dateStr}-${period.key}`;
                                const isHovered = hoveredSlotKey === slotKey;

                                // 背景色の判定ロジック
                                let displayBgColor = 'transparent';

                                if (assignedTask?.color) {
                                    // 1. タスク（「予定あり」の色 #94a3b8 を含む）が割り当てられている場合
                                    displayBgColor = assignedTask.color;
                                } else if (isEditable && isHovered && selectedTask?.color) {
                                    // 2. ホバー中＆タスク選択中
                                    displayBgColor = `color-mix(in srgb, ${selectedTask.color} 40%, transparent)`;
                                } else if (isEditable && isHovered) {
                                    // 3. ホバー中＆タスク未選択
                                    displayBgColor = 'rgba(226, 232, 240, 0.5)';
                                }

                                return (
                                    <div
                                        key={slotKey}
                                        onClick={() => handleCellClick(day.dateStr, period.key, currentSlot)}
                                        onMouseEnter={() => setHoveredSlotKey(slotKey)}
                                        onMouseLeave={() => setHoveredSlotKey(null)}
                                        className={`border-r-2 border-b-2 border-slate-800/80 h-full w-full flex items-center justify-center relative transition-colors duration-150 select-none overflow-hidden ${isEditable ? 'cursor-pointer' : 'cursor-default'
                                            }`} // 編集不可のときは pointer カーソルを解除
                                        style={{ backgroundColor: displayBgColor }}
                                    >
                                        {/* 「予定あり」以外の通常タスク名だけをマス内に表示（「予定あり」は色だけの塗りつぶし） */}
                                        {assignedTask && assignedTask.title !== '予定あり' && (
                                            <span className="hidden sm:inline text-xs font-medium text-white truncate px-0.5">
                                                {assignedTask.title}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}