// src/app/page.js
// 【役割】全体の画面配置を管理し、機能（taskService）と見た目（WeeklyTaskManager）を接続するメイン画面

'use client';

import { useState, useEffect } from 'react';

// タスク用サービス
import { fetchWeeklyTasks, createWeeklyTask, deleteWeeklyTaskById } from './services/taskService';

// カレンダー用サービス ＆ コンポーネント
import { fetchCalendarSlots, updateCalendarSlot } from './services/calendarService';
import WeeklyCalendar from './components/WeeklyCalendar';

// 今週やること・今日絶対やること コンポーネント
import TaskContainer from './components/TaskContainer';

// キャラクター＆吹き出し コンポーネント
import CharacterSection from './components/CharacterSection';

/*--------------------------*/

export default function Home() {
  // アプリ全体の「データ（状態）」を保持
  const [tasks, setTasks] = useState([]);
  const [calendarSlots, setCalendarSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // 選択中のタスクID（選択なしは null）
  const [selectedTaskId, setSelectedTaskId] = useState(null);



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

    // --- 画面が開いたときに自動実行される処理 ---
  useEffect(() => {
    loadAllData();
  }, []);

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
      // 選択中だったタスクが削除されたら選択解除
      if (selectedTaskId === id) setSelectedTaskId(null);
    }
  };

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

  // タスクの選択・解除を切り替える関数
  const handleSelectTask = (taskId) => {
    setSelectedTaskId((prev) => (prev === taskId ? null : taskId));
  };

  // エリア外クリックで選択解除する関数
  const handleClearSelection = () => {
    setSelectedTaskId(null);
  };

  return (
    /* h-screen（100vh）と overflow-hidden で画面全体の縦スクロールを完全に禁止 */
    <main className="fixed inset-0 h-dvh w-full bg-slate-100 p-2 sm:p-4 overflow-hidden flex flex-col justify-between box-border">
      <div className="max-w-5xl mx-auto w-full h-full flex flex-col gap-2 sm:gap-3">
        
        {/* ==========================================
            上部エリア (高さ約80%): 常に横並び配置
            【キャラ (30%)】【やること (70%)】
           ========================================== */}
        <div className="flex-1 flex gap-1.5 sm:gap-2 min-h-0 overflow-hidden">          
          
          {/* 左側: キャラクター (横幅30%〜35%) */}
          <div className="w-[32%] sm:w-[30%] h-full min-h-0">
            <CharacterSection calendarSlots={calendarSlots} />
          </div>

          {/* 右側: やることコンテナ (横幅68%〜70%) */}
          <div className="w-[68%] sm:w-[70%] h-full min-h-0">
            <TaskContainer
              tasks={tasks}
              calendarSlots={calendarSlots}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              loading={loading}
              selectedTaskId={selectedTaskId} 
              onSelectTask={handleSelectTask} 
              onClearSelection={handleClearSelection}
            />
          </div>

        </div>

        {/* ==========================================
            下部エリア: 1週間カレンダー (カレンダー本来の「コンパクトな必要最低限の高さ」で固定)
           ========================================== */}
        <div className="shrink-0">
          <WeeklyCalendar
            weeklyTasks={tasks}
            calendarSlots={calendarSlots}
            onSlotChange={handleSlotChange}
            selectedTaskId={selectedTaskId}
          />
        </div>

      </div>
    </main>
  );
}