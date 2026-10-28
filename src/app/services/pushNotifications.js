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
  console.log('1. 購読登録処理がスタートしました');

  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('中断: ブラウザがService Worker非対応です');
    return false;
  }

  const permission = await Notification.requestPermission();
  console.log('2. 通知権限の結果:', permission);
  if (permission !== 'granted') {
    console.log('中断: 通知権限が許可されませんでした');
    return false;
  }

  console.log('3. Service Workerの準備を待っています...');
  const registration = await navigator.serviceWorker.ready;
  console.log('4. Service Workerの準備完了:', registration);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
  });
  console.log('5. Pushプッシュ購読の取得成功:', subscription);

  const { data: { user } } = await supabase.auth.getUser();
  console.log('6. ログインユーザー情報:', user);
  if (!user) {
    console.log('中断: ユーザーがログインしていません');
    return false;
  }

  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    subscription: subscription.toJSON(),
  }, { onConflict: 'user_id' });

  if (error) {
    console.error('7. Supabaseへの保存エラー:', error);
    return false;
  }

  console.log('8. データベースへの保存が成功しました！');
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

// src/app/services/pushNotifications.js の中に追加

/**
 * 特定のタスクが「今の時間帯」に設定された際、すぐに通知をテスト・送信する関数
 */
export async function sendImmediateNotificationIfNeeded(dateStr, periodKey, taskName) {
  if (!taskName || taskName === '予定あり') return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // 今日の日付文字列を取得
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // 現在の「朝・昼・夜」のどれに該当するかを判定
  const rawHour = now.getHours();
  let currentPeriod = 'morning';
  if (rawHour >= TIME_CONFIG.AFTERNOON_START && rawHour < TIME_CONFIG.NIGHT_START) {
    currentPeriod = 'afternoon';
  } else if (rawHour >= TIME_CONFIG.NIGHT_START || rawHour < TIME_CONFIG.MORNING_START) {
    currentPeriod = 'night';
  }

  // もし「今日」かつ「現在の時間帯」のマスが変更された場合のみ、即座に通知を飛ばす
 // if (dateStr === todayStr && periodKey === currentPeriod) {
    // すぐに送信されるように、scheduled_at を「現在時刻」にしてキューに挿入
    await supabase.from('scheduled_notifications').insert({
      user_id: user.id,
      title: '=0w0=.｡oO(タスクの時間です!)',
      body: `${taskName}をしよう！`,
      scheduled_at: now.toISOString(),
      status: 'pending',
    });

    // Supabaseの Edge Function（send-push）をその場で直接叩いて即時実行させる！
    try {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

      await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, // 認証ヘッダーを追加
        },
      });
      console.log('即時通知トリガー成功！');
    } catch (err) {
      console.error('即時通知のトリガーに失敗しました:', err);
    }
 // }
}