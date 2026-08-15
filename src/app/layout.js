import { Geist, Geist_Mono } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";
import { DateProvider } from '@/app/context/DateContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ローカルフォントの定義（相対パスでフォントファイルを指定）
const myCustomFont = localFont({
  src: './fonts/Chalk-S-JP.otf', 
  display: 'swap',
});

export const metadata = {
  title: "1週間のやることリスト",
  description: "1週間ごとのタスク管理ツール",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      {/* body に フォント名.className を設定 */}
      <body className={myCustomFont.className}>
        {/* children を DateProvider で包む */}
        <DateProvider>
          {children}
        </DateProvider>
      </body>
    </html>
  );
}