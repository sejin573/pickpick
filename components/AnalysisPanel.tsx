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
    <section className="surface overflow-hidden">
      <div className="flex flex-col justify-between gap-5 border-b border-zinc-100 p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <p className="eyebrow">Request brief</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">이 조건으로 찾아봤어요</h2>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
          <i className="h-2 w-2 rounded-full bg-emerald-500" />
          분석 완료
        </span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4">
        {(["intent", "target", "budget", "occasion"] as const).map((key) => (
          <div key={key} className="border-b border-zinc-100 p-5 sm:p-6 lg:border-b-0 lg:border-r last:lg:border-r-0">
            <p className="text-[11px] font-black uppercase tracking-wider text-zinc-400">{labels[key]}</p>
            <p className="mt-2 text-sm font-black leading-6 text-zinc-800">{analysis[key]}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-5 bg-zinc-50/70 p-5 sm:grid-cols-2 sm:p-6">
        <div>
          <p className="mb-3 text-xs font-black text-zinc-500">추천에 반영한 포인트</p>
          <div className="flex flex-wrap gap-2">
            {analysis.preferences.map((item) => <span key={item} className="chip">{item}</span>)}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-black text-zinc-500">가격 및 제약 조건</p>
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
