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
        /* h-full で左側エリアの高さを100%使い切り、縦並びに配置 */
        <div className="p-2 sm:p-3 h-full flex flex-col items-center justify-between gap-2 overflow-hidden min-h-0">
            {/* 吹き出し（下部に配置） */}
            <div className="relative w-full bg-slate-50 border border-slate-200/80 rounded-lg sm:rounded-xl p-2 text-[10px] sm:text-xs md:text-sm font-medium text-slate-800 leading-snug sm:leading-relaxed text-center shrink-0">
                {dialogueMessage}
            </div>

            {/* キャラクター画像表示エリア（あまりの高さを目一杯使ってフィット） */}
            <div className="w-full flex-1 min-h-0 flex justify-center items-end overflow-hidden">
                <img
                    src="/character2.png"
                    alt="Character"
                    /* 枠いっぱいに表示（枠の縦横比が固定されているため変に引き伸ばされない） */
                    className="w-full h-full object-contain object-bottom"
                />
            </div>
        </div>
    );
}