// src/app/components/CharacterSection.js
// 【役割】キャラクターの見た目と状況に応じたセリフ吹き出しを表示するコンポーネント

'use client';

import { useMemo } from 'react';
import { useLogicalDate } from '../context/DateContext';

export default function CharacterSection({ calendarSlots }) {
    // Context から朝6時基準の「今日の日付文字列」と「時間帯インデックス (0:朝, 1:昼, 2:夜)」を取得
    const { todayStr, periodIndex } = useLogicalDate();

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
    const characterState = useMemo(() => {
        const currentTask = todayTaskNames[periodIndex];

        if (currentTask === null) {
            // タスク設定してないとき
            return {
                message: "休憩中...",
                imageSrc: "/chara_break.png",
            };
        } else if (currentTask === "予定あり") {
            // タスクが「予定あり」のとき
            return {
                message: "不在中...",
                imageSrc: "/chara_out.png"
            };
        } else {
            return {
                message: `今は${currentTask}の時間！`,
                imageSrc: "/chara_task.png"
            };
        }

    }, [todayTaskNames, periodIndex]);

    return (
        /* 親要素に relative を指定して、吹き出しの配置基準にする */
        <div className="relative h-full w-full overflow-hidden flex flex-col justify-end">

            {/* キャラクター画像表示エリア（親の高さ100%を目一杯使って大きく表示） */}
            <div className="w-full h-full flex justify-center items-end overflow-hidden">
                <img
                    src={characterState.imageSrc}
                    alt="Character"
                    className="w-full h-full object-contain object-bottom"
                />
            </div>

            {/* 吹き出し（absolute でキャラの上に重ねてフロート表示） */}
            <div className="absolute top-2 left-0 right-0 z-10 px-1 pointer-events-none">
                <div className="w-full bg-slate-50/95
                                border-2 border-slate-600 px-2 py-1.5
                                text-[10px] sm:text-xs font-medium text-slate-800 leading-snug text-center 
                                max-h-[80px] overflow-y-auto"
                                style={{ filter: 'url(#crayon-filter)' }}
                >
                    {characterState.message}
                </div>
            </div>

        </div>
    );
}