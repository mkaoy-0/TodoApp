// public/sw.js

// サーバーからプッシュ通知が届いたときに発火する
self.addEventListener('push', (event) => {
  // サーバーから送られてきたデータ（JSON）を受け取る。データがない場合のデフォルト値も用意
  //const data = event.data ? event.data.json() : { title: 'Todoリマインダー', body: '時間になりました！' };
  const data = event.data.json(); // サーバーから送られてきたJSONをそのまま使う

  // スマホに表示する通知の設定
  const options = {
    body: data.body,                    // 通知の本文
    icon: '/icon.png',           // 通知に表示するアイコン画像
    badge: '/badge-72x72.png',          // Androidなどのステータスバーに出る小さなアイコン
    data: { url: data.url || '/' }      // タップしたときに開くリンク先
  };

  // 通知が確実に画面に表示されるまでバックグラウンド処理を待機させる
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ユーザーが届いた通知を「タップ」したときに発火する
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // タップされたら通知を閉じる
  
  // 指定されたURLのページをブラウザ（アプリ）で開く
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});