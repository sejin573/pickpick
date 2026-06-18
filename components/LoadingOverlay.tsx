"use client";

import { useEffect, useState } from "react";

const stages = [
  {
    title: "요청을 이해하고 있어요",
    description: "대상, 상황, 예산과 원하는 분위기를 분석합니다.",
  },
  {
    title: "실제 판매 상품을 찾고 있어요",
    description: "네이버 쇼핑에서 조건에 맞는 상품 후보를 모읍니다.",
  },
  {
    title: "상품 품질을 확인하고 있어요",
    description: "가격 범위와 상품 유형을 검사하고 노이즈를 제외합니다.",
  },
  {
    title: "AI가 후보를 비교하고 있어요",
    description: "OpenAI가 사용자 맥락에 맞는 최종 상품을 재선정합니다.",
  },
  {
    title: "구매 가이드를 정리하고 있어요",
    description: "추천 이유와 비교 기준, 확인할 점을 작성합니다.",
  },
];

export default function LoadingOverlay({ visible }: { visible: boolean }) {
  const [stage, setStage] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!visible) {
      setStage(0);
      setSeconds(0);
      return;
    }

    const stageTimer = window.setInterval(() => {
      setStage((current) => Math.min(current + 1, stages.length - 1));
    }, 2200);
    const secondTimer = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(stageTimer);
      window.clearInterval(secondTimer);
    };
  }, [visible]);

  if (!visible) return null;

  const current = stages[stage];
  const progress = Math.min(92, 14 + stage * 19 + seconds * 1.2);

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-white/75 px-5 backdrop-blur-xl"
      role="status"
      aria-live="polite"
      aria-label="추천 결과 생성 중"
    >
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_32px_100px_rgba(50,35,105,0.22)]">
        <div className="relative overflow-hidden bg-ink px-7 py-8 text-white">
          <div className="loading-orbit absolute -right-16 -top-20 h-48 w-48 rounded-full border border-violet-400/30" />
          <div className="loading-orbit-reverse absolute -right-2 -top-6 h-28 w-28 rounded-full border border-violet-300/20" />
          <div className="relative flex items-center gap-4">
            <span className="loading-logo grid h-14 w-14 place-items-center rounded-2xl bg-violet-600 text-xl font-black shadow-lg shadow-violet-950/40">
              P
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300">
                PickPick Agent
              </p>
              <h2 className="mt-1 text-xl font-black">좋은 선택을 찾는 중이에요</h2>
            </div>
          </div>
        </div>

        <div className="p-7">
          <div key={stage} className="loading-stage">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-50 text-sm font-black text-violet-700">
                {stage + 1}
              </span>
              <div>
                <p className="font-black text-ink">{current.title}</p>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  {current.description}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
              <span>STEP {stage + 1} / {stages.length}</span>
              <span>{seconds < 2 ? "준비 중" : `${seconds}초 경과`}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-violet-50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-[width] duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-5 gap-2">
            {stages.map((item, index) => (
              <span
                key={item.title}
                className={`h-1.5 rounded-full transition-colors ${
                  index <= stage ? "bg-violet-500" : "bg-zinc-100"
                }`}
              />
            ))}
          </div>
          <p className="mt-5 text-center text-xs leading-5 text-zinc-400">
            실제 상품과 AI 비교를 함께 사용해 보통 10초 안팎이 걸립니다.
          </p>
        </div>
      </div>
    </div>
  );
}
