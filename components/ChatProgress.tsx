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
    title: "후보를 비교하고 있어요",
    description: "조건과 인기도를 함께 보고 최종 상품을 골라내고 있어요.",
  },
  {
    title: "구매 가이드를 정리하고 있어요",
    description: "추천 이유와 비교 기준, 확인할 점을 작성하고 있어요.",
  },
];

interface ChatProgressProps {
  complete?: boolean;
}

export default function ChatProgress({ complete = false }: ChatProgressProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (complete) {
      setActiveIndex(stages.length);
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((current) => Math.min(current + 1, stages.length - 1));
    }, 2200);
    return () => window.clearInterval(timer);
  }, [complete]);

  const visibleStages = complete
    ? stages
    : stages.slice(0, activeIndex + 1);

  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink text-[13px] font-semibold text-white">
        P
      </span>
      <div className="w-fit min-w-0 max-w-[calc(100%-3rem)] sm:max-w-2xl">
        <p className="text-[11px] font-medium tracking-[0.18em] text-violet-500">
          PICKPICK AGENT
        </p>
        <div className="mt-1.5 rounded-2xl rounded-tl-md border border-zinc-100 bg-white px-5 py-4 shadow-sm transition-all duration-500">
          <ul className="space-y-3.5">
            {visibleStages.map((item, index) => {
              const isCurrent = !complete && index === activeIndex;
              const isDone = complete || index < activeIndex;
              return (
                <li
                  key={item.title}
                  className="loading-stage flex items-start gap-3"
                >
                  <span
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] transition-colors duration-300 ${
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
                      className={`text-sm font-semibold transition-colors duration-300 ${
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
          {complete && (
            <p className="mt-4 border-t border-zinc-100 pt-3 text-xs leading-5 text-zinc-500">
              아래에 정리한 결과를 확인해 보세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
