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

    // 今日の [朝, 昼, 夜] のタスク名を順番通りに格納した配列を作る
    const todayTaskNames = useMemo(() => {
        if (!calendarSlots) return [null, null, null];

        const periods = ['morning', 'afternoon', 'night'];

        return periods.map((p) => {
            // 今日の日付 かつ 指定の時間帯（morning / afternoon / night）のスロットを探す
            const slot = calendarSlots.find(
                (s) => s.date === todayStr && s.period === p
            );
            // タスク名があれば返し、無ければ null を返す
            return slot?.weekly_tasks?.title || null;
        });
    }, [calendarSlots, todayStr]);

    // 現在時刻のインデックスに応じたタスク名を出力
    const dialogueMessage = useMemo(() => {
        const hour = new Date().getHours();
        let hour_morning = 6; // 6:00 - 14:00
        let hour_afternoon = 14; // 14:00 - 20:00
        let hour_night = 20; // 20:00 - 6:00

        // 時間帯に応じたインデックス判定（0: 朝, 1: 昼, 2: 夜）
        let index = 0; 
        if (hour >= hour_afternoon && hour < hour_night) {
            index = 1; 
        } else if (hour >= hour_night || hour < hour_morning) {
            index = 2;
        }


        if (todayTaskNames[index] === null) {
            // タスク設定してないとき
            return "休憩中...";
        } else if (todayTaskNames[index] === "予定あり") {
            // タスクが「予定あり」のとき
            return "不在中...";
        } else {
            return `今は${todayTaskNames[index]}の時間！`;
        }
        
    }, [todayTaskNames]);

    return (
        /* h-full で左側エリアの高さを100%使い切り、縦並びに配置 */
        <div className="p-2 sm:p-3 h-full flex flex-col items-center justify-between gap-2 overflow-hidden min-h-0">
            {/* 吹き出し（下部に配置） */}
            <div className="relative w-full bg-slate-50 border border-slate-200/80 rounded-lg sm:rounded-xl px-2 py-1.5 text-[10px] sm:text-xs font-medium text-slate-800 leading-snug text-center shrink-0 max-h-[80px] flex items-center justify-center overflow-y-auto">
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