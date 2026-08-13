// src/app/components/WeeklyCalendar.js
// 【役割】SVGフィルターを活用し、切れ目のない綺麗な手描きクレヨン線を表現するカレンダー

'use client';

import { useMemo, useState } from 'react';

// 時間帯の定義（縦3行）
const PERIODS = [
    { key: 'morning', label: '午前' },
    { key: 'afternoon', label: '午後' },
    { key: 'night', label: '夜' },
];

export default function WeeklyCalendar({ weeklyTasks, calendarSlots, onSlotChange, selectedTaskId }) {
    // ホバー中のマス（"2026-08-12-morning" のような文字列）を追跡
    const [hoveredSlotKey, setHoveredSlotKey] = useState(null);

    // 選択中のタスクオブジェクトを1回だけ取得
    const selectedTask = weeklyTasks.find((t) => Number(t.id) === Number(selectedTaskId));
    
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

            const dateString = d.toISOString().split('T')[0];

            days.push({
                dateStr: dateString,
                displayDate: `${d.getMonth() + 1}/${d.getDate()}`,
                dayName: dayNames[i],
                isToday: d.toDateString() === now.toDateString(),
            });
        }
        return days;
    }, []);

    const getSlot = (dateStr, periodKey) => {
        return calendarSlots.find(
            (slot) => slot.date === dateStr && slot.period === periodKey
        );
    };

    // マス目がクリックされたときの処理
    const handleCellClick = (dateStr, periodKey, currentSlot) => {
        if (selectedTaskId !== null && selectedTaskId !== undefined) {
            const currentTaskId = currentSlot?.weekly_task_id ? Number(currentSlot.weekly_task_id) : null;
            const targetTaskId = Number(selectedTaskId);

            // 同じタスクがすでにあれば解除(null)、違えば上書き登録
            const newTaskId = currentTaskId === targetTaskId ? null : targetTaskId;
            onSlotChange(dateStr, periodKey, newTaskId);
        } else if (currentSlot?.weekly_task_id) {
            // タスク未選択時に登録済みマスを押すと解除
            onSlotChange(dateStr, periodKey, null);
        }
    };

    return (
        /* 外枠：クリーム色のノート地に青/グレーの横罫線を繰り返す指定 */
        <div
            className="rounded-sm shadow-sm p-1 sm:p-1.5 h-full flex flex-col justify-between overflow-hidden relative bg-amber-50/40"
            style={{
                backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 14px, rgba(139, 127, 100, 0.1) 14px, rgba(139, 127, 100, 0.1) 15px)',
                backgroundPosition: 'center',
                backgroundSize: 'calc(100% - 48px) 100%',
                backgroundRepeat: 'repeat-y',
            }}
        >
            {/* 外枠（上と左の閉じる線） */}
            <div
                className="w-full h-full flex flex-col justify-between border-t-2 border-l-2 border-slate-800/80"
                style={{ filter: 'url(#crayon-filter)' }}
            >

                {/* 1. 曜日ヘッダー行 */}
                <div className="grid grid-cols-7 gap-0 text-center text-[9px] sm:text-xs font-bold text-slate-700">
                    {weekDays.map((day) => {
                        // 土日の文字色判定
                        let textColorClass = 'text-slate-700';
                        if (day.dayName === '土') textColorClass = 'text-blue-600 font-extrabold';
                        if (day.dayName === '日') textColorClass = 'text-red-500 font-extrabold';

                        return (
                            <div
                                key={day.dateStr}
                                className={`py-1 border-r-2 border-b-2 border-slate-800/80 relative bg-white/30 ${textColorClass} ${day.isToday ? 'font-black' : ''
                                    }`}
                            >
                                {/* 今日の場合のみ左上にピン画像を表示 */}
                                {day.isToday && (
                                    <img
                                        src="/pin_2.png"
                                        alt="Pin"
                                        className="absolute 
                  -top-2 -left-1 w-8.5 h-6 
                  sm:-top-2.5 sm:-left-2 sm:w-10 sm:h-8 
                  drop-shadow-sm pointer-events-none z-10 object-contain"
                                    />
                                )}
                                <div>{day.dayName}</div>
                                <div className="text-[8px] sm:text-[10px] font-normal text-slate-500">
                                    {day.displayDate}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 2. データ行（午前・午後・夜 の 3行） */}
                {PERIODS.map((period) => (
                    <div key={period.key} className="grid grid-cols-7 gap-0 items-center">
                        {weekDays.map((day) => {
                            const currentSlot = getSlot(day.dateStr, period.key);
                            const assignedTask = currentSlot?.weekly_tasks;
                            const slotKey = `${day.dateStr}-${period.key}`;
                            const isHovered = hoveredSlotKey === slotKey;

                            // 背景色の判定ロジック
                            let displayBgColor = 'transparent';

                            if (assignedTask?.color) {
                                // 1. タスクが既に割り当てられている場合
                                displayBgColor = assignedTask.color;
                            } else if (isHovered && selectedTask?.color) {
                                // 2. タスク未割当 ＆ タスク選択中 ＆ ホバー中の場合（不透明度40%にしてプレビュー表示）
                                displayBgColor = `color-mix(in srgb, ${selectedTask.color} 40%, transparent)`;
                            } else if (isHovered) {
                                // 3. タスク未割当 ＆ タスク未選択 ＆ ホバー中の場合（薄いグレー）
                                displayBgColor = 'rgba(226, 232, 240, 0.5)';
                            }

                            return (
                                <div
                                    key={slotKey}
                                    /* マス目をクリックした時のイベント */
                                    onClick={() => handleCellClick(day.dateStr, period.key, currentSlot)}
                                    onMouseEnter={() => setHoveredSlotKey(slotKey)}
                                    onMouseLeave={() => setHoveredSlotKey(null)}
                                    className="border-r-2 border-b-2 border-slate-800/80 h-7 sm:h-8 flex items-center justify-center relative cursor-pointer transition-colors duration-150 select-none"
                                    style={{
                                        backgroundColor: displayBgColor,
                                    }}
                                >
                                    {/* タスク名を表示（選択されたタスクがある場合は白文字） */}
                                    {assignedTask && (
                                        /* hidden でスマホ等では非表示にし、sm:inline でPC等の画面サイズのみ表示 */
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
    );
}