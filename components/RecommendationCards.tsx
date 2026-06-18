"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Recommendation, RecommendationGroup } from "@/lib/types";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ko-KR").format(price) + "원";

interface RecommendationCardsProps {
  recommendations: Recommendation[];
  groups?: RecommendationGroup[];
}

export default function RecommendationCards({
  recommendations,
  groups,
}: RecommendationCardsProps) {
  const displayGroups = useMemo<RecommendationGroup[]>(
    () =>
      groups?.length
        ? groups
        : [{
            id: "top-picks",
            title: "지금 가장 잘 맞는 선택",
            subtitle: "예산과 목적을 함께 고려한 PickPick의 우선 추천이에요.",
            category: "추천",
            recommendations,
          }],
    [groups, recommendations],
  );
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [activeProductIndex, setActiveProductIndex] = useState(0);

  const activeGroup = displayGroups[activeGroupIndex] ?? displayGroups[0];
  const activeProduct =
    activeGroup.recommendations[activeProductIndex] ??
    activeGroup.recommendations[0];

  useEffect(() => {
    setActiveProductIndex(0);
  }, [activeGroupIndex]);

  useEffect(() => {
    if (activeGroup.recommendations.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveProductIndex(
        (current) => (current + 1) % activeGroup.recommendations.length,
      );
    }, 5200);
    return () => window.clearInterval(timer);
  }, [activeGroup]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-soft">
      <div className="border-b border-zinc-100 px-6 pb-0 pt-7 sm:px-9 sm:pt-9">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">Curated collections</p>
            <h2 className="section-title">취향별로 나눠서 골라봤어요</h2>
            <p className="muted mt-2">
              한 가지 정답 대신 카테고리마다 가장 설득력 있는 선택 3개를 비교해 보세요.
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-4 lg:pb-0">
            {displayGroups.map((group, index) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveGroupIndex(index)}
                className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition ${
                  index === activeGroupIndex
                    ? "bg-ink text-white shadow-lg"
                    : "bg-zinc-100 text-zinc-500 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                {group.category}
                <span className="ml-2 text-[10px] opacity-60">03</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 h-0.5 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            key={`${activeGroup.id}-${activeProductIndex}`}
            className="product-progress h-full bg-violet-500"
          />
        </div>
      </div>

      <div
        key={`${activeGroup.id}-${activeProduct.id}`}
        className="product-slide grid min-h-[520px] lg:grid-cols-[1.08fr_0.92fr]"
      >
        <div className="relative min-h-[360px] overflow-hidden bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 lg:min-h-full">
          {activeProduct.imageUrl ? (
            <Image
              src={activeProduct.imageUrl}
              alt={activeProduct.name}
              fill
              unoptimized
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-contain p-10 sm:p-14"
            />
          ) : (
            <div className="grid h-full min-h-[360px] place-items-center">
              <span className="grid h-28 w-28 cursor-default place-items-center rounded-[2.25rem] bg-white text-5xl shadow-soft transition duration-300 hover:-translate-y-1 hover:rotate-6 hover:scale-105 hover:text-violet-600 hover:shadow-xl">
                ✦
              </span>
            </div>
          )}
          <span className="absolute left-6 top-6 rounded-full bg-white/90 px-3 py-2 text-xs font-black text-violet-700 shadow-sm backdrop-blur">
            {activeProductIndex === 0 ? "BEST PICK" : `PICK 0${activeProductIndex + 1}`}
          </span>
          {activeProduct.isLive && (
            <span className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-2 text-xs font-black text-white shadow-lg">
              <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              LIVE PRICE
            </span>
          )}
        </div>

        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-violet-600">{activeGroup.category}</span>
            <span className="h-1 w-1 rounded-full bg-zinc-300" />
            <span className="text-zinc-400">
              {activeProduct.brand || activeProduct.mallName || "PickPick curated"}
            </span>
          </div>
          <h3 className="mt-4 text-2xl font-black leading-tight tracking-[-0.03em] text-ink sm:text-3xl">
            {activeProduct.name}
          </h3>
          <div className="mt-5 flex items-end justify-between gap-5">
            <p className="text-2xl font-black text-violet-600">
              {formatPrice(activeProduct.price)}
            </p>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Match score
              </p>
              <p className="text-2xl font-black text-ink">{activeProduct.score}</p>
            </div>
          </div>

          <div className="mt-7 rounded-2xl bg-zinc-50 p-5">
            <p className="text-xs font-black text-violet-600">PICKPICK NOTE</p>
            <p className="mt-2 text-sm leading-7 text-zinc-600">{activeProduct.reason}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="text-xs font-black text-emerald-700">이런 점이 좋아요</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-zinc-700">
                {activeProduct.pros[0]}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
              <p className="text-xs font-black text-amber-700">구매 전 체크</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-zinc-700">
                {activeProduct.cons[0]}
              </p>
            </div>
          </div>

          {activeProduct.productUrl ? (
            <a
              href={activeProduct.productUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-4 text-sm font-black text-white transition hover:bg-violet-700"
            >
              {activeProduct.mallName ?? "판매처"}에서 상품 확인
              <span aria-hidden>↗</span>
            </a>
          ) : (
            <a
              href={`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(activeProduct.name)}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-4 text-sm font-black text-white transition hover:bg-violet-700"
            >
              실시간 판매처 검색 <span aria-hidden>↗</span>
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-100 bg-zinc-50/70 p-5 sm:p-7">
        <div className="mb-4">
          <h3 className="font-black text-ink">{activeGroup.title}</h3>
          <p className="mt-1 text-sm text-zinc-500">{activeGroup.subtitle}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {activeGroup.recommendations.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveProductIndex(index)}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                index === activeProductIndex
                  ? "border-violet-400 bg-white shadow-md"
                  : "border-transparent bg-white/60 hover:border-violet-200 hover:bg-white"
              }`}
            >
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-violet-50">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    unoptimized
                    sizes="64px"
                    className="object-contain p-1"
                  />
                ) : (
                  <span className="grid h-full place-items-center text-xl">✦</span>
                )}
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 text-xs font-bold leading-5 text-zinc-800">
                  {item.name}
                </span>
                <span className="mt-1 block text-xs font-black text-violet-600">
                  {formatPrice(item.price)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
