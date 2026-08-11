// src/app/components/CharacterSection.js
// 【役割】キャラクターの見た目と状況に応じたセリフ吹き出しを表示するコンポーネント

'use client';

import { useMemo } from 'react';

export default function CharacterSection({ calendarSlots }) {
  // 今日の日付文字列 ('YYYY-MM-DD') を取得
  const todayStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // 今日のタスク数と時間帯をもとに、キャラクターのセリフを自動計算
  const dialogueMessage = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();

    // 今日のスロットでタスクが割り当てられているものを数える
    const todaySlots = calendarSlots.filter(
      (s) => s.date === todayStr && s.weekly_task_id !== null
    );
    const taskCount = todaySlots.length;

    if (taskCount === 3) {
      return '今日の予定はバッチリ決まってるね！集中してひとつずつクリアしていこう！🔥';
    } else if (taskCount > 0) {
      return '順調だね！カレンダーの空いてる時間帯も埋めてみない？✨';
    } else {
      if (currentHour < 12) {
        return 'おはよう！今日も1日マイペースに頑張っていこう〜！☀️';
      } else if (currentHour < 18) {
        return 'こんにちは！カレンダーに今週絶対やることを割り振ってみてね！みてるよ👀';
      } else {
        return '今日もおつかれさま！明日の予定をカレンダーでセットしておこう準備はバッチリ？🌙';
      }
    }
  }, [calendarSlots, todayStr]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-5">
      {/* キャラクターアイコン（アバター風イラスト） */}
      <div className="relative shrink-0">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-200 to-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl sm:text-4xl shadow-inner select-none">
          🐱
        </div>
        <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white" title="オンライン" />
      </div>

      {/* 吹き出し（セリフ表示エリア） */}
      <div className="relative flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-slate-700 text-xs sm:text-sm font-medium leading-relaxed">
        {/* 吹き出しの左三角形ノズル */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-slate-200/80" />
        <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[7px] border-y-transparent border-r-[7px] border-r-slate-50" />

        <p className="text-slate-800">{dialogueMessage}</p>
      </div>
    </div>
  );
}