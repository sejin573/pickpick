import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "PickPick | 상황 기반 상품 추천 에이전트",
  description: "자연어로 상황을 말하면 비교부터 구매 판단까지 도와주는 AI 쇼핑 에이전트",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
