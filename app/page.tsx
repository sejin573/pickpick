"use client";

import { useRef, useState } from "react";

import AgentSteps from "@/components/AgentSteps";
import AnalysisPanel from "@/components/AnalysisPanel";
import BuyingGuide from "@/components/BuyingGuide";
import ComparisonTable from "@/components/ComparisonTable";
import Hero from "@/components/Hero";
import RecommendationCards from "@/components/RecommendationCards";
import ServiceInfo from "@/components/ServiceInfo";
import { RecommendResponse } from "@/lib/types";

export default function Home() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const selectPrompt = (prompt: string) => {
    setMessage(prompt);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const requestRecommendation = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("추천받고 싶은 대상, 상황 또는 예산을 한 문장으로 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = (await response.json()) as RecommendResponse & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "추천 결과를 불러오지 못했습니다.");
      setResult(data);
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 120);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pb-16 pt-5 sm:pt-8">
      <div className="page-shell">
        <Hero
          message={message}
          loading={loading}
          error={error}
          compact={Boolean(result)}
          onMessageChange={setMessage}
          onSubmit={requestRecommendation}
        />

        <div ref={resultRef} className="mt-8 space-y-6 sm:mt-12">
          {result ? (
            <>
              <div className="flex flex-col gap-3 rounded-2xl border border-violet-100 bg-white/80 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${result.meta?.catalogProvider === "naver" ? "bg-emerald-500" : "bg-violet-500"}`} />
                  <div>
                    <p className="text-sm font-bold text-zinc-800">
                      {result.meta?.catalogLabel ?? "PickPick 상품 데이터"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      가격과 재고는 판매 페이지에서 최종 확인해 주세요.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-zinc-600">
                    CATALOG · {(result.meta?.catalogProvider ?? "sample").toUpperCase()}
                  </span>
                  <span className="rounded-full bg-violet-50 px-3 py-1.5 text-violet-700">
                    COPY · {(result.meta?.llmProvider ?? "rule engine").toUpperCase()}
                  </span>
                </div>
              </div>
              {result.meta?.notice && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                  {result.meta.notice}
                </div>
              )}
              <AnalysisPanel analysis={result.analysis} />
              <RecommendationCards
                recommendations={result.recommendations}
                groups={result.recommendationGroups}
              />
              <AgentSteps steps={result.agentSteps} />
              <ComparisonTable items={result.comparison} />
              <BuyingGuide guide={result.buyingGuide} />
              <ServiceInfo onSelect={selectPrompt} />
            </>
          ) : null}
        </div>

        <footer className={`${result ? "mt-12 border-t border-violet-100 pt-7" : "-mt-12 pb-3"} text-center text-xs leading-5 text-zinc-500`}>
          <p className="font-bold text-zinc-700">PickPick</p>
          <p className="mt-1">상품 선택의 부담을 줄이는 상황 기반 AI 커머스 에이전트 프로토타입</p>
        </footer>
      </div>
    </main>
  );
}
