// src/app/components/TermsModal.js
'use client';

export default function TermsModal({ isOpen, onClose }) {
    // 開いていない時は何も描画しない
    if (!isOpen) return null;

    return (
        /* 背景オーバーレイ（半透明黒・画面全体） */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* モーダル本体（クリックが背景に突き抜けないよう stopPropagation） */}
            <div
                className="relative w-full max-w-lg bg-white rounded-lg shadow-xl border border-slate-300 flex flex-col max-h-[85vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ヘッダー */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
                    <h3 className="text-sm font-bold text-slate-800">利用規約・免責事項</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
                    >
                        ✕
                    </button>
                </div>

                {/* 本文エリア（スクロール可能） */}
                <div className="p-4 text-xs text-slate-700 leading-relaxed overflow-y-auto space-y-3">
                    <p>
                        本サービスをご利用いただく前に、以下の利用規約をご確認ください。アカウント作成またはログインを行った時点で、本規約に同意したものとみなします。
                    </p>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-1">1. 免責事項</h4>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                            <li>本サービスは個人が開発・運営する無料のWebアプリケーションです。現状有姿（as-is）で提供され、動作の完全性、永続性、セキュリティについて明示・黙示を問わずいかなる保証も行いません。</li>
                            <li>本サービスの利用、または利用不能やデータ消失・漏洩等によって生じたいかなる損害（直接的・間接的・派生的損害を含む）について、開発者は一切の責任を負いません。</li>
                            <li>事前の予告なく、本サービスの仕様変更、メンテナンスによる一時停止、またはサービスの提供を終了することがあります。</li>
                        </ul>
                    </div>

                    {/* 追加: 個人情報・機密情報の取り扱いに関する注意 */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-1">2. 個人情報の入力禁止・自己責任</h4>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                            <li>ユーザー名、タスク名、カレンダーの登録内容等に、本名、住所、電話番号、メールアドレス、金融機関情報、他サービスのパスワードなど、<strong>個人が特定できる情報や機密情報を入力・登録することを固く禁じます。</strong></li>
                            <li>ユーザーが入力した情報に起因して生じたトラブルや不利益について、開発者は一切の責任を負いません。</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-1">3. 著作権・知的財産権</h4>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                            <li>本サービスを構成するプログラム、デザイン、イラスト、キャラクター画像、および関連するすべてのコンテンツの著作権は、開発者に帰属します。</li>
                            <li>本サービス内の画像・コンテンツの無断転載、複製、再配布、二次利用、画像生成AI等の学習データへの利用を固く禁じます。</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-1">4. 禁止事項</h4>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                            <li>サーバーやネットワークに過度な負荷をかける行為</li>
                            <li>不正アクセスや脆弱性を突く行為</li>
                            <li>他人のアカウント情報を不正に利用・乗っ取る行為</li>
                            <li>その他、開発者が不適切と判断する行為</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-800 mb-1">5. データの取り扱い・削除</h4>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                            <li>登録されたアカウントおよび保存されたデータは、開発者の判断により予告なく削除される場合があります。バックアップは保証されません。</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 mb-1">6. 使用フォント・ライセンス表記</h4>
                        <p className="text-slate-600">
                            本サービスでは以下のフォントを使用しています。<br />
                            チョークS<br />
                            Modified by sozai-font-hako(https://font.cutegirl.jp/chalk-s.html)<br />
                            Based on fonts by Fontworks Inc.<br />
                            Copyright 2020 The Stick Project Authors(https://github.com/fontworks-fonts/Stick)<br />
                            This Font Software is licensed under the SIL Open Font License, Version 1.1.(https://openfontlicense.org/)
                        </p>
                    </div>
                    <div>
                        <br />
                        <p className="text-slate-800">2026-08-16</p>
                    </div>
                </div>

                {/* フッター */}
                <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-bold transition"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
}