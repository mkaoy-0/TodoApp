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
    /* h-full で左側エリアの高さを100%使い切り、PCでは縦並び・スマホでは横並びに最適化 */
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4 h-full flex flex-row md:flex-col items-center justify-center gap-3 overflow-hidden">
      {/* キャライコン（画面の大きさに合わせて拡大縮小） */}
      <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-amber-200 to-amber-100 border border-amber-300 flex items-center justify-center text-xl sm:text-2xl md:text-3xl shrink-0 select-none">
        🐱
      </div>

      {/* 吹き出し（スマホでは小さめの文字 text-[10px] に可変） */}
      <div className="relative w-full bg-slate-50 border border-slate-200/80 rounded-lg sm:rounded-xl p-2 text-[10px] sm:text-xs md:text-sm font-medium text-slate-800 leading-snug sm:leading-relaxed text-center overflow-y-auto max-h-[60%]">
        {dialogueMessage}
      </div>
    </div>
  );
}