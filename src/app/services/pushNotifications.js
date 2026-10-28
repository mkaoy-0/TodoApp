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
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    subscription: subscription.toJSON(),
  }, { onConflict: 'user_id' });

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

    // その時間帯の通知日時オブジェクトを作る (例: 2026-06-07T06:00:00)
    const scheduledDate = new Date(`${dateStr}T00:00:00`);
    scheduledDate.setHours(p.hour, 0, 0, 0);

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