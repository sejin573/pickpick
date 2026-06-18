import Image from "next/image";

import { Recommendation } from "@/lib/types";

const formatPrice = (price: number) => new Intl.NumberFormat("ko-KR").format(price) + "원";

export default function RecommendationCards({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  return (
    <section>
      <div className="mb-6">
        <p className="eyebrow">Top picks</p>
        <h2 className="section-title">지금 가장 잘 맞는 3가지</h2>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {recommendations.map((item, index) => (
          <article
            key={item.id}
            className={`surface group relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${index === 0 ? "ring-2 ring-violet-500" : ""}`}
          >
            {index === 0 && (
              <span className="absolute left-5 top-5 z-10 rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                BEST MATCH
              </span>
            )}
            <div className="relative aspect-[16/11] overflow-hidden bg-gradient-to-br from-violet-100 via-white to-fuchsia-100">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-contain p-6 transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="grid h-full place-items-center">
                  <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-white/80 text-4xl shadow-soft">
                    {item.category === "전자기기" ? "⌁" : item.category === "건강" ? "♡" : "✦"}
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 right-4">
                <div
                  className="score-ring grid h-16 w-16 place-items-center rounded-full shadow-lg"
                  style={{ "--score": item.score } as React.CSSProperties}
                >
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-sm font-black">
                    {item.score}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-start justify-between gap-4">
              <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="chip">{item.category}</span>
                    {item.isLive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        <i className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-xs font-semibold text-zinc-400">
                    {item.brand || item.mallName || "PickPick curated"}
                  </p>
                  <h3 className="mt-1 line-clamp-2 min-h-14 text-xl font-black tracking-tight">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-lg font-black text-violet-600">{formatPrice(item.price)}</p>
              </div>
              </div>
              <p className="mt-5 min-h-24 text-sm leading-6 text-zinc-600">{item.reason}</p>
              <div className="mt-5 border-t border-zinc-100 pt-5">
                <p className="text-xs font-bold text-emerald-700">좋은 점</p>
                <ul className="mt-2 space-y-2 text-sm text-zinc-700">
                  {item.pros.map((pro) => <li key={pro}>✓ {pro}</li>)}
                </ul>
                <p className="mt-5 text-xs font-bold text-amber-700">확인할 점</p>
                <ul className="mt-2 space-y-2 text-sm text-zinc-600">
                  {item.cons.map((con) => <li key={con}>! {con}</li>)}
                </ul>
              </div>
              <div className="mt-auto pt-6">
                <div className="rounded-xl bg-violet-50 p-3 text-xs font-medium leading-5 text-violet-800">
                  이런 분께 잘 맞아요 · {item.fitFor}
                </div>
                {item.productUrl ? (
                  <a
                    href={item.productUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700"
                  >
                    {item.mallName ? `${item.mallName}에서 보기` : "판매 페이지 보기"}
                    <span aria-hidden>↗</span>
                  </a>
                ) : (
                  <a
                    href={`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(item.name)}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3.5 text-sm font-bold text-zinc-700 transition hover:border-violet-300 hover:text-violet-700"
                  >
                    실시간 판매처 검색 <span aria-hidden>↗</span>
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
