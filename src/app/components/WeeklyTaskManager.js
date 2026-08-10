// src/app/components/WeeklyTaskManager.js
// 【役割】「今週絶対やること」の入力フォームやリストの「見た目（UI）」を管理する画面パーツ

'use client';

import { useState } from 'react';


export default function WeeklyTaskManager({ tasks, onAddTask, onDeleteTask, loading }) {
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* 見出し */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
        <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
        今週絶対やること
      </h2>

      {/* --- 入力フォームエリア --- */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        {/* タスク名入力欄 ＋ 追加ボタン */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)} // 文字が打たれるたびに状態を更新
            placeholder="新しいやることを入力..."
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition shadow-sm active:scale-95"
          >
            追加
          </button>
        </div>
      </form>

      {/* --- タスク一覧表示エリア --- */}
      {loading ? (
        <p className="text-center text-slate-400 py-4 text-sm">読み込み中...</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-slate-400 py-4 text-sm">
          まだ今週やるデータが登録されていません
        </p>
      ) : (
        <div className="space-y-2">
          {/* 配列データを1つずつ取り出してリスト項目を作る */}
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 transition hover:bg-slate-100/80"
            >
              <div className="flex items-center gap-3">
                {/* 自動計算された HSL カラーを style で直接適用 */}
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: task.color || '#3b82f6' }}
                />
                <span className="font-medium text-slate-700">{task.title}</span>
              </div>

              {/* 削除ボタン */}
              <button
                onClick={() => onDeleteTask(task.id)} // 親の削除関数を実行
                className="text-slate-400 hover:text-red-500 px-2 py-1 text-sm transition"
                title="削除"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}