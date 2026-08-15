// src/app/services/authService.js
import { supabase } from '../../lib/supabase';

// ユーザー名を内部用ダミーメアドに変換するヘルパー関数
const toDummyEmail = (username) => {
  // 英数字・アンダースコア等以外を排除してダミーメアドを作成
  const cleanUsername = username.trim().toLowerCase();
  return `${cleanUsername}@app.local`;
};

// 【新規登録】
export const signUpWithUsername = async (username, password) => {
  const email = toDummyEmail(username);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // ユーザー名をメタデータ（プロフィール情報）としても持たせておく
      data: { display_name: username },
    },
  });

  if (error) throw error;
  let session = data.session;

  // メール確認オフでもセッションが即時取得できなかった場合のフォロー
  if (!session) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) throw signInError;
    session = signInData.session;
  }

  // ユーザー作成に成功したら、自動で「予定あり」タスクを作成する
  if (session?.user) {
    const { error: taskError } = await supabase
      .from('weekly_tasks')
      .insert([
        {
          user_id: session.user.id,
          title: '予定あり',
          color: '#94a3b8',
        },
      ]);

    if (taskError) {
      console.error('初期タスク（予定あり）の作成に失敗しました:', taskError);
    }
  }

  return data;
};

// 【ログイン】
export const signInWithUsername = async (username, password) => {
  const email = toDummyEmail(username);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

// 【ログアウト】
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};