// src/app/components/WeeklyCalendar.js
// 【役割】横7マス×縦3行の1週間カレンダーを表示し、タスクの割り当てを行う見た目パーツ

'use client';

import { useMemo } from 'react';

// 時間帯の定義（縦3行）
const PERIODS = [
  { key: 'morning', label: '午前' },
  { key: 'afternoon', label: '午後' },
  { key: 'night', label: '夜' },
];

export default function WeeklyCalendar({ weeklyTasks, calendarSlots, onSlotChange }) {
  // 今週の月曜日から日曜日までの7日間の日付データを動的に計算生成
  const weekDays = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0:日, 1:月...
    // 月曜日を起点にするための差分計算
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);

    const days = [];
    const dayNames = ['月', '火', '水', '木', '金', '土', '日'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      
      // 'YYYY-MM-DD' 形式の文字列を作成
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

  // 特定の日付(dateStr)と時間帯(period)にセットされているスロットを探すヘルパー関数
  const getSlot = (dateStr, periodKey) => {
    return calendarSlots.find(
      (slot) => slot.date === dateStr && slot.period === periodKey
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
        <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
        1週間カレンダー
      </h2>

      {/* 横スクロール可能な 7マス × 3行 のテーブルレイアウト */}
      <div className="min-w-[650px]">
        {/* ヘッダー行：曜日と日付 */}
        <div className="grid grid-cols-8 gap-2 mb-2 text-center text-sm font-bold text-slate-600">
          <div className="py-2">区分</div>
          {weekDays.map((day) => (
            <div
              key={day.dateStr}
              className={`py-2 rounded-lg ${
                day.isToday ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-slate-50'
              }`}
            >
              <div>{day.dayName}</div>
              <div className="text-xs font-normal text-slate-400">{day.displayDate}</div>
            </div>
          ))}
        </div>

        {/* ボディ行：午前 / 午後 / 夜 の 3行 */}
        {PERIODS.map((period) => (
          <div key={period.key} className="grid grid-cols-8 gap-2 mb-2 items-center">
            {/* 左端：時間帯ラベル */}
            <div className="text-xs font-bold text-slate-500 text-center py-3 bg-slate-50 rounded-lg">
              {period.label}
            </div>

            {/* 各曜日 7マス */}
            {weekDays.map((day) => {
              const currentSlot = getSlot(day.dateStr, period.key);
              const assignedTask = currentSlot?.weekly_tasks;

              return (
                <div key={`${day.dateStr}-${period.key}`} className="relative group">
                  <select
                    value={currentSlot?.weekly_task_id || ''}
                    onChange={(e) => {
                      const taskId = e.target.value ? Number(e.target.value) : null;
                      onSlotChange(day.dateStr, period.key, taskId);
                    }}
                    className={`w-full h-14 text-xs p-1.5 rounded-xl border text-center font-medium appearance-none cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      assignedTask
                        ? 'text-white border-transparent shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                    }`}
                    style={
                      assignedTask?.color
                        ? { backgroundColor: assignedTask.color }
                        : {}
                    }
                  >
                    <option value="" className="text-slate-700 bg-white">
                      (未設定)
                    </option>
                    {weeklyTasks.map((task) => (
                      <option
                        key={task.id}
                        value={task.id}
                        className="text-slate-700 bg-white"
                      >
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}