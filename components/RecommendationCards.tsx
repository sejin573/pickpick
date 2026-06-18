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
            className={`surface relative flex flex-col p-6 ${index === 0 ? "ring-2 ring-violet-500" : ""}`}
          >
            {index === 0 && (
              <span className="absolute -top-3 left-6 rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">
                BEST MATCH
              </span>
            )}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="chip">{item.category}</span>
                <h3 className="mt-4 text-xl font-black tracking-tight">{item.name}</h3>
                <p className="mt-2 text-sm font-bold text-violet-600">{formatPrice(item.price)}</p>
              </div>
              <div
                className="score-ring grid h-16 w-16 shrink-0 place-items-center rounded-full"
                style={{ "--score": item.score } as React.CSSProperties}
              >
                <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-sm font-black">
                  {item.score}
                </div>
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
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
