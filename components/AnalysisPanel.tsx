import { RecommendResponse } from "@/lib/types";

const labels: Record<string, string> = {
  intent: "구매 목적",
  target: "추천 대상",
  budget: "예산",
  occasion: "상황",
};

export default function AnalysisPanel({
  analysis,
}: {
  analysis: RecommendResponse["analysis"];
}) {
  return (
    <section className="surface p-6 sm:p-8">
      <p className="eyebrow">Request analysis</p>
      <h2 className="section-title">입력에서 읽어낸 조건</h2>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(["intent", "target", "budget", "occasion"] as const).map((key) => (
          <div key={key} className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
            <p className="text-xs font-bold text-violet-600">{labels[key]}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-zinc-800">{analysis[key]}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 border-t border-zinc-100 pt-5 sm:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-bold text-zinc-500">선호 포인트</p>
          <div className="flex flex-wrap gap-2">
            {analysis.preferences.map((item) => <span key={item} className="chip">{item}</span>)}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold text-zinc-500">제약 및 참고</p>
          <div className="flex flex-wrap gap-2">
            {analysis.constraints.map((item) => (
              <span key={item} className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
