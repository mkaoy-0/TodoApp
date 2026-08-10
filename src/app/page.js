// src/app/page.js
// 【役割】全体の画面配置を管理し、機能（taskService）と見た目（WeeklyTaskManager）を接続するメイン画面

'use client';

import { useState, useEffect } from 'react';
// ① 作成したサービス（機能）をインポート
import { fetchWeeklyTasks, createWeeklyTask, deleteWeeklyTaskById } from './services/taskService';
// ② 作成したコンポーネント（見た目）をインポート
import WeeklyTaskManager from './components/WeeklyTaskManager';

export default function Home() {
  // アプリ全体の「データ（状態）」を保持
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 画面が開いたときに自動実行される処理 ---
  useEffect(() => {
    loadTasks();
  }, []);

  // 1. データベースからタスクを読み込む
  const loadTasks = async () => {
    setLoading(true);
    const data = await fetchWeeklyTasks(); // 機能ファイルを呼び出す
    setTasks(data);
    setLoading(false);
  };

  // 2. タスクを追加する処理（子コンポーネントから呼ばれる）
  const handleAddTask = async (title) => {
    // 既存の tasks 配列を渡して、被らない色を自動計算させる
    const newTask = await createWeeklyTask(title, tasks); // 機能ファイルを呼び出す
    if (newTask) {
      setTasks((prevTasks) => [...prevTasks, newTask]); // 画面のリストに追加
    }
  };

  // 3. タスクを削除する処理（子コンポーネントから呼ばれる）
  const handleDeleteTask = async (id) => {
    const success = await deleteWeeklyTaskById(id); // 機能ファイルを呼び出す
    if (success) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id)); // 画面から削除
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* 「今週絶対やること」パーツを配置 */}
        <WeeklyTaskManager
          tasks={tasks}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
          loading={loading}
        />

        {/* 💡 今後ここに「週間カレンダーコンポーネント」や「キャラクター表示コンポーネント」を並べていくだけで拡張できます！ */}

      </div>
    </main>
  );
}