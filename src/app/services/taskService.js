// src/app/services/taskService.js
// 【役割】Supabase（データベース）との通信・データ処理をひとまとめにするファイル

import { supabase } from '../../lib/supabase';

/**
 * 既存のタスクと被りにくいランダムな HSL カラーコード（例: "hsl(210, 70%, 55%)"）を生成する関数
 * @param {Array} existingTasks - 現在登録されているタスクの配列
 * @returns {string} HSL形式のカラーコード
 */
function generateUniqueColor(existingTasks) {
    // すでに使われている色相（Hue: 0〜360）を取得
    const usedHues = existingTasks
        .map((task) => {
            //"hsl(210, 70%, 55%)" の文字列から数字の「210」だけを抜き出す処理
            const match = task.color.match(/hsl\((\d+),/);
            return match ? parseInt(match[1], 10) : null;
        })
        .filter ((h) => h !== null);
    
    let newHue = 0;
    let isTooClose = true;
    let attempts = 0;

    // 既存の色と一定以上離れている色相が見つかるまでランダム抽選（最大30回までループ）
    while (isTooClose && attempts < 30) {
        newHue = Math.floor(Math.random() * 360); // 0〜359のランダムな角度
        attempts++;

        // 既存のどの色相からも「30度以上」離れていればOKとする
        isTooClose = usedHues.some((usedHue) => {
            const diff = Math.abs(usedHue - newHue);
            const distance = Math.min(diff, 360 - diff); // 円周上の距離を計算
            return distance < 30; // 30度以内は近い色とみなしやり直し
        });
    }

    // 彩度60%、明度75%で返す
    return `hsl(${newHue}, 60%, 75%)`; 
}

/**
 * 今週絶対やるタスクの一覧を取得する
 * @returns {Promise<Array>} タスクの配列
 */
export async function fetchWeeklyTasks() {
    // 最新のユーザー情報・セッションが取得できるか事前に確認
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // まだセッション復元中（または未ログイン）の場合はエラーを出さずに空配列を返す
        return [];
    }

    const { data, error } = await supabase
        .from('weekly_tasks')
        .select('*')
        .order('created_at', { ascending: true }); // 作成日時が古い順（追加した順）に並べる

    if (error) {
        console.error('タスク取得エラー:', error);
        return [];
    }
    return data || [];
}

/**
 * 新しい「今週絶対やるタスク」を追加する
 * @param {string} title - タスクの名前
 * @param {Array} currentTasks - 現在画面にある既存タスクの配列（色の重複を避けるために使用）
 * @returns {Promise<Object|null>} 追加されたタスクデータ
 */
export async function createWeeklyTask(title, currentTasks = []) {
    if (!title.trim()) return null; // 空の場合は処理しない

    // 自動で被らないランダムカラーを生成！
    const autoColor = generateUniqueColor(currentTasks);

    const { data, error } = await supabase
        .from('weekly_tasks')
        .insert([{ title: title.trim(), color: autoColor }])
        .select(); // 追加したデータをそのまま返すように指定
    
    if (error) {
        console.error('タスク追加エラー:', error);
        return null;
    }
    return data ? data[0] : null; // 追加されたタスクデータを返す
}

/**
 * 指定したIDのタスクを削除する
 * @param {number} id - 削除するタスクのID
 * @returns {Promise<boolean>} 成功したかどうか
 */
export async function deleteWeeklyTaskById(id) {
    const { error } = await supabase
        .from('weekly_tasks')
        .delete()
        .eq('id', id); // DBの id 列が一致する行を削除
    
    if (error) {
        console.error('タスク削除エラー:', error);
        return false;
    }
    return true; // 削除成功
}