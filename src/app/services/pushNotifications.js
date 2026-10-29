// src/app/services/pushNotifications.js
import { supabase } from '../../lib/supabase';
import { TIME_CONFIG } from '../../constants/TimeConfig';

const PUBLIC_VAPID_KEY = 'BHDmOo2GGaHyqNlBE4OImrLgbdk3PF-R-fSepldmBthoHon_9uiq7SHAomqIJhE-ctdsY3JNYguEJE2coDbEkMQ';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// Service Worker & 購読の登録
export async function registerPushSubscription() {
  // console.log('1. 購読登録処理がスタートしました');

  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('中断: ブラウザがService Worker非対応です');
    return false;
  }

  const permission = await Notification.requestPermission();
 // console.log('2. 通知権限の結果:', permission);
  if (permission !== 'granted') {
    console.log('中断: 通知権限が許可されませんでした');
    return false;
  }

 // console.log('3. Service Workerの準備を待っています...');
  const registration = await navigator.serviceWorker.ready;
 // console.log('4. Service Workerの準備完了:', registration);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
  });
 // console.log('5. Pushプッシュ購読の取得成功:', subscription);

  const { data: { user } } = await supabase.auth.getUser();
  // console.log('6. ログインユーザー情報:', user);
  if (!user) {
    console.log('中断: ユーザーがログインしていません');
    return false;
  }

  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    subscription: subscription.toJSON(),
  }, { onConflict: 'user_id' });

  if (error) {
    console.error('Supabaseへの保存エラー:', error);
    return false;
  }

 // console.log('データベースへの保存が成功しました！');
  return true;
}

/**
 * 指定した日付の「朝・昼・夜」のタスクから、通知の予約を一括作成・更新する関数
 * @param {string} dateStr -  "2026-06-07" のような日付文字列
 * @param {Array} tasksForDay - [朝のタスク名, 昼のタスク名, 夜のタスク名] の配列 (null や "予定あり" の可能性あり)
 */
export async function schedulePeriodicNotifications(dateStr, tasksForDay) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const periods = [
    { index: 0, name: 'morning', hour: TIME_CONFIG.MORNING_START },
    { index: 1, name: 'afternoon', hour: TIME_CONFIG.AFTERNOON_START },
    { index: 2, name: 'night', hour: TIME_CONFIG.NIGHT_START },
  ];

  // 既存の同日の未送信（pending）通知を一度クリア（二重登録防止・編集時の上書きのため）
  const startOfDay = `${dateStr}T00:00:00Z`;
  const endOfDay = `${dateStr}T23:59:59Z`;

  await supabase
    .from('scheduled_notifications')
    .delete()
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .gte('scheduled_at', startOfDay)
    .lte('scheduled_at', endOfDay);

  // 朝・昼・夜ごとにループして予約を作成
  for (const p of periods) {
    const taskName = tasksForDay[p.index];

    // 「タスクが設定されていない(null)」または「予定あり」の場合は通知を送らない
    if (!taskName || taskName === '予定あり') {
      continue;
    }

    // 日本時間（JST = UTC+9）を考慮して正確な UTC の Date を作る
    const [year, month, day] = dateStr.split('-').map(Number);
    // Date.UTC を使って、JSTの時間を正しく計算（JSTなので9時間引いたUTCにする）
    const utcMs = Date.UTC(year, month - 1, day, p.hour - 9, 0, 0);
    const scheduledDate = new Date(utcMs);

    // 既に過去の時間のときは予約しない
    if (scheduledDate <= new Date()) {
      continue;
    }

    // Supabaseに通知スケジュールを保存
    await supabase.from('scheduled_notifications').insert({
      user_id: user.id,
      title: '=0w0=.｡oO(タスクの時間です!)',
      body: `${taskName}をしよう！`,
      scheduled_at: scheduledDate.toISOString(),
      status: 'pending',
    });
  }
}

/**
 * 特定のタスクが「今の時間帯」に設定された際、すぐに通知データを作成する関数
 * （pg_cronが1分以内に自動で拾って送信してくれます）
 */
export async function sendImmediateNotificationIfNeeded(dateStr, periodKey, taskName) {
  if (!taskName || taskName === '予定あり') return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const now = new Date();
  const jstNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  
  const year = jstNow.getFullYear();
  const month = String(jstNow.getMonth() + 1).padStart(2, '0');
  const day = String(jstNow.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`; // 例: "2026-10-29"

  const currentHour = jstNow.getHours();
  let currentPeriod = null;
  if (currentHour >= TIME_CONFIG.MORNING_START && currentHour < TIME_CONFIG.AFTERNOON_START) {
    currentPeriod = 'morning';
  } else if (currentHour >= TIME_CONFIG.AFTERNOON_START && currentHour < TIME_CONFIG.NIGHT_START) {
    currentPeriod = 'afternoon';
  } else if (currentHour >= TIME_CONFIG.NIGHT_START || currentHour < TIME_CONFIG.MORNING_START) {
    currentPeriod = 'night';
  }

  // ==========================================
  // デバッグ用コンソールに出力
  // ==========================================
  //console.log('--- 【即時通知の判定チェック】 ---');
  //console.log('画面から渡ってきた日付 (dateStr):', dateStr);
  //console.log('計算された今日のJST日付 (todayStr):', todayStr);
  //console.log('日付は一致しているか？:', dateStr === todayStr);
  //console.log('画面から渡ってきた時間帯 (periodKey):', periodKey);
  //console.log('現在のJST時間帯 (currentPeriod):', currentPeriod);
  //console.log('時間帯は一致しているか？:', periodKey === currentPeriod);

  // 今日以外のカレンダーを変更したときは即時通知を送らない
  if (dateStr !== todayStr) {
    //console.log('今日ではないため、即時通知をここでガード');
    return;
  }

  // 今の時間帯以外を変更したときは即時通知を送らない
  if (periodKey !== currentPeriod) {
    //console.log('現在の時間帯ではないため、即時通知をここでガード');
    return;
  }

 // console.log('即時通知の登録処理へ');

  // --- 即時通知の登録処理 ---
  try {
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();
    
    const { data: existing } = await supabase
      .from('scheduled_notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('body', `${taskName}の時間だよ！`)
      .eq('status', 'pending')
      .gte('scheduled_at', oneMinuteAgo);

    if (existing && existing.length > 0) {
      console.log('1分以内の重複のためスキップ');
      return;
    }

    const { error } = await supabase.from('scheduled_notifications').insert({
      user_id: user.id,
      title: '=0w0=.｡oO(タスクの時間です!)',
      body: `${taskName}の時間だよ！`,
      scheduled_at: now.toISOString(),
      status: 'pending',
    });

    if (error) throw error;
    console.log('即時通知データを現在時刻で登録しました！');
  } catch (err) {
    console.error('登録失敗:', err);
  }
}