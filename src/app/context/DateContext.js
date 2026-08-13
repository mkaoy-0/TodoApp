// src/app/context/DateContext.js
'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const DateContext = createContext(null);

export function DateProvider({ children }) {
  const [now, setNow] = useState(() => new Date());

  // 1分ごとに時間を更新
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 朝6時基準の日付情報を取りまとめて計算
  const dateValue = useMemo(() => {
    // 現在時刻から6時間を引いた「論理的な今日」
    const adjusted = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    const year = adjusted.getFullYear();
    const month = String(adjusted.getMonth() + 1).padStart(2, '0');
    const day = String(adjusted.getDate()).padStart(2, '0');

    // 'YYYY-MM-DD' 形式（DB検索用）
    const todayStr = `${year}-${month}-${day}`;

    // 表示用（例: "8月13日 (木)"）
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const formattedToday = `${adjusted.getMonth() + 1}月${adjusted.getDate()}日 (${dayNames[adjusted.getDay()]})`;

    // 現在の時間帯インデックス（0: 朝 5:00-11:59, 1: 昼 12:00-17:59, 2: 夜 18:00-4:59）
    const rawHour = now.getHours();
    let hour_morning = 6; // 6:00 - 14:00
    let hour_afternoon = 14; // 14:00 - 20:00
    let hour_night = 20; // 20:00 - 6:00

    let periodIndex = 0; // 朝
    if (rawHour >= hour_afternoon && rawHour < hour_night) {
      periodIndex = 1; // 昼
    } else if (rawHour >= hour_night || rawHour < hour_morning) {
      periodIndex = 2; // 夜
    }

    return {
      now,            // 実際の Date オブジェクト
      adjustedNow: adjusted, // 6時間戻した Date オブジェクト
      todayStr,       // "2026-08-13"
      formattedToday, // "8月13日 (木)"
      periodIndex,    // 0 | 1 | 2
    };
  }, [now]);

  return (
    <DateContext.Provider value={dateValue}>
      {children}
    </DateContext.Provider>
  );
}

// 各コンポーネントで呼び出すカスタムフック
export function useLogicalDate() {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useLogicalDate must be used within a DateProvider');
  }
  return context;
}