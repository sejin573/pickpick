"use client";

import { useEffect, useState } from "react";

const stages = [
  {
    title: "요청을 이해하고 있어요",
    description: "대상, 상황, 예산과 분위기를 정리하는 중이에요.",
  },
  {
    title: "실제 판매 상품을 찾고 있어요",
    description: "네이버 쇼핑에서 조건에 맞는 후보를 모으고 있어요.",
  },
  {
    title: "상품 품질을 확인하고 있어요",
    description: "가격 범위와 상품 유형을 검사해 노이즈를 걸러내고 있어요.",
  },
  {
    title: "AI가 후보를 비교하고 있어요",
    description: "당신의 맥락에 맞는 최종 상품을 다시 골라내고 있어요.",
  },
  {
    title: "구매 가이드를 정리하고 있어요",
    description: "추천 이유와 비교 기준, 확인할 점을 작성하고 있어요.",
  },
];

export default function ChatProgress() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStage((current) => Math.min(current + 1, stages.length - 1));
    }, 2200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink text-[13px] font-semibold text-white">
        P
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium tracking-[0.18em] text-violet-500">
          PICKPICK AGENT
        </p>
        <div className="mt-1.5 rounded-2xl rounded-tl-md border border-zinc-100 bg-white px-5 py-4 shadow-sm">
          <ul className="space-y-3.5">
            {stages.slice(0, stage + 1).map((item, index) => {
              const isCurrent = index === stage;
              const isDone = index < stage;
              return (
                <li
                  key={item.title}
                  className="loading-stage flex items-start gap-3"
                >
                  <span
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] ${
                      isDone
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-violet-100 text-violet-700"
                    }`}
                  >
                    {isDone ? (
                      <span aria-hidden className="font-semibold leading-none">
                        ✓
                      </span>
                    ) : (
                      <span className="flex gap-0.5">
                        <i className="loading-dot h-1 w-1 rounded-full bg-violet-600" />
                        <i className="loading-dot h-1 w-1 rounded-full bg-violet-600" />
                        <i className="loading-dot h-1 w-1 rounded-full bg-violet-600" />
                      </span>
                    )}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold ${
                        isCurrent ? "text-ink" : "text-zinc-700"
                      }`}
                    >
                      {item.title}
                    </p>
                    {isCurrent && (
                      <p className="mt-0.5 text-xs leading-5 text-zinc-500">
                        {item.description}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
