// src/app/services/calendarService.js
// 【役割】1週間カレンダー（calendar_slotsテーブル）のデータ取得・更新を行う裏方ファイル

import { supabase } from '../../lib/supabase';

/**
 * 21マス分（7日 × 3区分）のカレンダーデータを取得する
 * @returns {Promise<Array>} カレンダーのスロット配列
 */
export async function fetchCalendarSlots() {
    const { data, error } = await supabase
        .from('calendar_slots')
        .select(`
      id,
      date,
      period,
      weekly_task_id,
      weekly_tasks (
        id,
        title,
        color
      )
    `);

    if (error) {
        console.error('カレンダー取得エラー:', error);
        return [];
    }
    return data || [];
}

/**
 * 指定した日付・時間帯のマスに「今週絶対やるタスク」を割当（または解除）する
 * @param {string} date - 日付 ('2026-08-11' 形式)
 * @param {string} period - 時間帯 ('morning', 'afternoon', 'night')
 * @param {number|null} weeklyTaskId - 紐付けるタスクのID（解除時は null）
 */
export async function updateCalendarSlot(date, period, weeklyTaskId) {
    // upsert (存在すれば更新、なければ新規挿入) を行う
    const { data, error } = await supabase
        .from('calendar_slots')
        .upsert(
            [
                {
                    date,
                    period,
                    weekly_task_id: weeklyTaskId, // 紐付けるタスクのID（解除時は null）
                },
            ],
            { onConflict: 'date, period' } // 日付と区分が重複したら更新する
        )
        .select(`
            id,
            date,
            period,
            weekly_task_id,
            weekly_tasks (
                id,
                title,
                color
            )
        `);

    if (error) {
        console.error('カレンダー更新エラー:', error);
        return null;
    }
    return data ? data[0] : null; // 更新されたカレンダースロットデータを返す    
}