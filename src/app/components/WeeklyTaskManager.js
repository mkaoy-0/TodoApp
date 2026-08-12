// src/app/components/WeeklyTaskManager.js
// 【役割】「今週絶対やること」の入力フォームやリストの「見た目（UI）」を管理する画面パーツ

'use client';

import { useState } from 'react';


export default function WeeklyTaskManager({ tasks, onAddTask, onDeleteTask, loading, selectedTaskId, onSelectTask }) {
    // --- ローカル（画面内一時的）な状態の管理 ---
    const [inputText, setInputText] = useState(''); // 入力欄の文字

    // --- 送信ボタンが押された時の処理 ---
    const handleSubmit = (e) => {
        e.preventDefault(); // フォーム送信時のページ再読み込み（リロード）を防止
        if (!inputText.trim()) return;

        // 親（page.js）から渡された追加関数を実行
        onAddTask(inputText);

        // 入力欄をクリア
        setInputText('');
    };

    return (
        /* h-full と flex flex-col で「高さ100%」を使って縦いっぱいに広げる */
        <div className="h-full flex flex-col">
            {/* 入力フォーム */}
            <form onSubmit={handleSubmit} className="mt-0 mb-2.5">
                <div className="flex gap-2">
                    {/* 付箋風の親コンテナ（影と左端の縦帯、角丸をここで管理） */}
                    <div 
                      className="relative inlineb-lock -rotate-1 -bottom-1 left-1
                      flex-1 flex items-center 
                      bg-white shadow-sm border border-slate-200/80 overflow-hidden 
                      focus-within:ring-1 focus-within:ring-slate-300 transition"
                    >
                        {/* 左端の緑色の縦帯 */}
                        <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-rose-400 shrink-0 pointer-events-none" />

                        {/* インプット本体（背景と枠線を透明にして親に馴染ませる） */}
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="新しいやることを追加..."
                            className="w-full pl-6 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent appearance-none focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="translate-y-1.5 px-3 py-2 text-xs 
                        border-2 border-blue-400/80 rounded-sm hover:bg-slate-200 
                        text-blue-400/80 font-bold transition active:scale-95 shrink-0"
                        style={{ filter: 'url(#crayon-filter)' }}
                    >
                        ＋
                    </button>
                </div>
            </form>

            {/* タスク一覧：flex-1 であまりの高さを100%使い切り、溢れたら overflow-y-auto でスクロール */}
            <div className="flex-1 overflow-y-auto space-y-3 pt-1.5 pb-3 pr-1 min-h-0 ml-1.5 mt-2">
                {loading ? (
                    <p className="text-center text-slate-400 py-2 text-xs">読み込み中...</p>
                ) : tasks.length === 0 ? (
                    <p className="text-center text-slate-400 py-2 text-xs">まだ登録されていません</p>
                ) : (
                    tasks.map((task) => {
                        const isSelected = selectedTaskId === task.id;

                        return (
                            <div
                                key={task.id}
                                /* クリックで選択・解除をトグル */
                                onClick={(e) => {
                                    e.stopPropagation(); // イベントバブリングを防止
                                    onSelectTask(task.id);
                                }}
                                className={`flex items-start justify-between p-2 rounded-sm text-xs shrink-0 gap-2 ml-2 mr-1 cursor-pointer transition-all duration-150 select-none ${isSelected
                                    ? 'ring-2 ring-amber-400 ring-offset-2 shadow-md scale-[1.02]' // 選択中の強調デザイン
                                    : 'shadow-sm hover:brightness-95'
                                    }`}
                                style={{ backgroundColor: task.color || '#3b82f6' }}
                            >
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                    <span className="font-medium break-words flex-1 leading-snug px-2 text-slate-900">
                                        {task.title}
                                    </span>
                                </div>

                                {/* 削除ボタン */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        /* e.stopPropagation() でカード全体のクリック(選択処理)を発火させない */
                                        e.stopPropagation();
                                        onDeleteTask(task.id);
                                    }}
                                    className="text-slate-600 hover:text-red-600 px-1 text-xs transition font-medium shrink-0"
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}