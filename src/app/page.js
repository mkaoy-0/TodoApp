// src/app/page.js
// 【役割】全体の画面配置を管理し、機能（taskService）と見た目（WeeklyTaskManager）を接続するメイン画面

'use client';

import { useState, useEffect } from 'react';

// タスク用サービス ＆ コンポーネント
import { fetchWeeklyTasks, createWeeklyTask, deleteWeeklyTaskById } from './services/taskService';
import WeeklyTaskManager from './components/WeeklyTaskManager';

// カレンダー用サービス ＆ コンポーネント
import { fetchCalendarSlots, updateCalendarSlot } from './services/calendarService';
import WeeklyCalendar from './components/WeeklyCalendar';

// 今日絶対やること コンポーネント
import TodayTasks from './components/TodayTasks';

// キャラクター＆吹き出し コンポーネント
import CharacterSection from './components/CharacterSection';

/*--------------------------*/

export default function Home() {
  // アプリ全体の「データ（状態）」を保持
  const [tasks, setTasks] = useState([]);
  const [calendarSlots, setCalendarSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 画面が開いたときに自動実行される処理 ---
  useEffect(() => {
    loadAllData();
  }, []);

  // データベースからタスクを読み込む
  const loadAllData = async () => {
    setLoading(true);
    const [tasksData, slotsData] = await Promise.all([
      fetchWeeklyTasks(),
      fetchCalendarSlots(),
    ]);
    setTasks(tasksData);
    setCalendarSlots(slotsData);
    setLoading(false);
  };

  // タスクを追加する処理（WeeklyTaskManagerから呼ばれる）
  const handleAddTask = async (title) => {
    // 既存の tasks 配列を渡して、被らない色を自動計算させる
    const newTask = await createWeeklyTask(title, tasks); // taskServiceを呼び出す
    if (newTask) {
      setTasks((prevTasks) => [...prevTasks, newTask]); // 画面のリストに追加
    }
  };

  // タスクを削除する処理（WeeklyTaskManagerから呼ばれる）
  const handleDeleteTask = async (id) => {
    const success = await deleteWeeklyTaskById(id); // taskServiceを呼び出す
    if (success) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id)); // 画面から削除
      // 削除されたタスクが割り当てられていたカレンダーのマスも同期更新
      setCalendarSlots((prev) =>
        prev.map((slot) =>
          slot.weekly_task_id === id
            ? { ...slot, weekly_task_id: null, weekly_tasks: null } // 削除されたタスクを解除
            : slot
        )
      );
    }
  }

  // カレンダーマスの更新
  const handleSlotChange = async (date, period, weeklyTaskId) => {
    const updatedSlot = await updateCalendarSlot(date, period, weeklyTaskId);
    if (updatedSlot) {
      setCalendarSlots((prev) => {
        // 既存のスロットリストを更新、無ければ追加する
        const index = prev.findIndex(
          (s) => s.date === date && s.period === period
        );
        if (index >= 0) {
          const newSlots = [...prev];
          newSlots[index] = updatedSlot;
          return newSlots;
        }
        return [...prev, updatedSlot];
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* キャラクター＆吹き出し */}
        <CharacterSection calendarSlots={calendarSlots} />

        {/* 今日絶対やること (自動抽出表示) */}
        <TodayTasks calendarSlots={calendarSlots} />

        {/* 今週絶対やること(タスク作成・一覧) */}
        <WeeklyTaskManager
          tasks={tasks}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
          loading={loading}
        />

        {/* 1週間カレンダー パーツ */}
        <WeeklyCalendar
          weeklyTasks={tasks}
          calendarSlots={calendarSlots}
          onSlotChange={handleSlotChange}
        />

      </div>
    </main>
  );
}