// src/app/components/AuthModal.js
'use client';

import { useState } from 'react';
import { signUpWithUsername, signInWithUsername } from '../services/authService';
import TermsModal from './TermsModal';

export default function AuthModal({ onLoginSuccess }) {
    const [isSignUp, setIsSignUp] = useState(false); // ログイン/新規登録の切り替え
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // モーダルの開閉状態を管理する State
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            if (isSignUp) {
                // 新規登録
                await signUpWithUsername(username, password);
            } else {
                // ログイン
                await signInWithUsername(username, password);
            }
            onLoginSuccess(); // 成功時の処理（モーダルを閉じる等）
        } catch (err) {
            // エラーメッセージの日本語化
            if (err.message.includes('User already registered')) {
                setErrorMsg('そのユーザー名はすでに使われています');
            } else if (err.message.includes('Invalid login credentials')) {
                setErrorMsg('ユーザー名またはパスワードが違います');
            } else {
                setErrorMsg('エラーが発生しました: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        /* 画面の高さいっぱいに固定し、スクロールを完全禁止（overflow-hidden） */
        <div className="h-screen w-full p-4 flex flex-col items-center justify-between overflow-hidden box-border">

            {/* ログインフォーム */}
            <div className="w-full max-w-sm flex flex-col justify-start pt-2">
                <div
                    className="p-4 bg-white rounded-sm shadow-md border-2 border-slate-500 w-full"
                    style={{ filter: 'url(#crayon-filter)' }}
                >
                    <h2 className="text-lg font-bold mb-4 text-center">
                        {isSignUp ? 'アカウント作成' : 'ログイン'}
                    </h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                ユーザー名（半角英数字）
                            </label>
                            <input
                                type="text"
                                required
                                pattern="^[a-zA-Z0-9_-]+$"
                                title="半角英数字のみ使用できます"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="例: tarou123"
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">パスワード</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="6文字以上"
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                        </div>

                        {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-emerald-600 transition"
                        >
                            {loading ? '処理中...' : isSignUp ? '登録する' : 'ログインする'}
                        </button>
                    </form>

                    {/* 切り替えボタン */}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="w-full mt-3 text-xs text-slate-500 underline text-center hover:text-emerald-600/60"
                    >
                        {isSignUp ? 'すでにアカウントをお持ちの方（ログイン）' : '新規アカウント作成はこちら'}
                    </button>

                    {/* 利用規約モーダルを開くリンク */}
                    <p className="text-[10px] text-slate-400 text-center mt-5">
                        登録することで
                        <button
                            type="button"
                            onClick={() => setIsTermsOpen(true)}
                            className="underline hover:text-sky-600/60 ml-1"
                        >
                            利用規約・免責事項
                        </button>
                        に同意したものとみなされます。
                    </p>
                </div>
            </div>

            {/* 下部エリア: 余ったスペースに画像を配置（画面サイズに合わせて伸縮） */}
            <div className="w-full max-w-sm h-36 sm:h-48 shrink-0 flex justify-center items-end overflow-hidden pb-2">
                <img
                    src="/chara_out_resize.png"
                    alt="Login Visual"
                    className="h-full w-auto object-contain pointer-events-none"
                />
            </div>

            {/* 利用規約モーダルコンポーネント */}
            <TermsModal
                isOpen={isTermsOpen}
                onClose={() => setIsTermsOpen(false)}
            />

        </div>
    );
}