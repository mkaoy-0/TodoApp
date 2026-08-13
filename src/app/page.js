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

  // 画面の「実際の表示高さ(px)」を保持する state
  const [mainHeight, setMainHeight] = useState('100dvh');

  // タブの状態を親で管理
  const [activeTab, setActiveTab] = useState('today');

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

    // 2. 画面の実際の表示高さを正確に計算してセットする処理
    const updateHeight = () => {
      if (typeof window !== 'undefined') {
        setMainHeight(`${window.innerHeight}px`);
      }
    };

    updateHeight();

    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);

  }, []);

  // タスクを追加する処理（WeeklyTaskManagerから呼ばれる）
  const handleAddTask = async (title) => {
    // 既存の tasks 配列を渡して、被らない色を自動計算させる
    const newTask = await createWeeklyTask(title, tasks); // taskServiceを呼び出す
    if (newTask) {
      setTasks((prevTasks) => [newTask, ...prevTasks]); // 画面のリストに追加
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
    /* ★ 変更：
       1. h-screen で画面に収める（スクロールなし）を基本にする
       2. min-h-[640px] で「4枚目」のサイズを最小防波堤として固定
       3. 画面が640pxを下回ったら overflow-y-auto で全体スクロール発動
    */
    <main className="h-screen min-h-[350px] w-full bg-slate-100 p-2 sm:p-4 flex flex-col box-border overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col gap-2 sm:gap-3 min-h-[480px]">
        {/* 隠しSVGフィルター */}
        <svg className="hidden" aria-hidden="true">
          <defs>
            <filter id="crayon-filter">
              <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="1" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>

        {/* ==========================================
          上部エリア (キャラ ＆ やること):
          十分な高さがある時は画面いっぱいに広がり(flex-1)
         ========================================== */}
        <div className="flex-1 flex gap-1.5 sm:gap-2 min-h-[480px] overflow-hidden">
          {/* 左側: キャラクター */}
          <div className="h-full aspect-[2/5] shrink-0 min-h-0">
            <CharacterSection calendarSlots={calendarSlots} />
          </div>

          {/* 右側: やることコンテナ */}
          <div className="flex-1 min-w-0 h-full">
            <TaskContainer
              tasks={tasks}
              calendarSlots={calendarSlots}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              loading={loading}
              selectedTaskId={selectedTaskId}
              onSelectTask={handleSelectTask}
              onClearSelection={handleClearSelection}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

        </div>

        {/* ==========================================
          下部エリア: 1週間カレンダー
          スクロールさせず、本来の最適な高さで固定（shrink-0）
         ========================================== */}
        <div className="flex-1 min-h-[110px] w-full">
          <WeeklyCalendar
            weeklyTasks={tasks}
            calendarSlots={calendarSlots}
            onSlotChange={handleSlotChange}
            selectedTaskId={selectedTaskId}
            isEditable={activeTab !== 'today'}
          />
        </div>

      </div>
    </main>
  );
}