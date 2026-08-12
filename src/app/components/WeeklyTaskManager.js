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
            {/* タスク一覧：flex-1 であまりの高さを100%使い切り、溢れたら overflow-y-auto でスクロール */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 min-h-0 ml-1.5">
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
                                className={`flex items-start justify-between p-2 rounded-sm text-xs shrink-0 gap-2 cursor-pointer transition-all duration-150 select-none ${isSelected
                                        ? 'ring-2 ring-amber-400 ring-offset-2 shadow-md scale-[1.02]' // ★ 選択中の強調デザイン
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
                                        /* ★ e.stopPropagation() でカード全体のクリック(選択処理)を発火させない ★ */
                                        e.stopPropagation();
                                        onDeleteTask(task.id);
                                    }}
                                    className="text-slate-700 hover:text-red-600 px-1 text-xs transition font-bold shrink-0"
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* 入力フォーム */}
            <form onSubmit={handleSubmit} className="mt-2 mb-2">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="新しいやることを追加..."
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                    <button
                        type="submit"
                        className="px-4 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition active:scale-95 shrink-0"
                    >
                        ＋
                    </button>
                </div>
            </form>
        </div>
    );
}