import { RecommendResponse } from "@/lib/types";

const cardItems = [
  { key: "intent" as const, label: "구매 목적" },
  { key: "target" as const, label: "추천 대상" },
  { key: "budget" as const, label: "예산" },
  { key: "occasion" as const, label: "상황" },
];

export default function AnalysisPanel({
  analysis,
}: {
  analysis: RecommendResponse["analysis"];
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink text-[13px] font-semibold text-white">
        P
      </span>
      <div className="min-w-0 flex-1 max-w-2xl">
        <p className="text-[11px] font-medium tracking-[0.18em] text-violet-500">
          PICKPICK AGENT · 요청 정리
        </p>
        <div className="mt-1.5 overflow-hidden rounded-2xl rounded-tl-md border border-zinc-100 bg-white shadow-sm">
          <div className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
            <p className="text-[15px] leading-7 text-zinc-700">
              요청을 이렇게 정리했어요.{" "}
              <span className="font-semibold text-ink">{analysis.target}</span>
              을(를) 위한{" "}
              <span className="font-semibold text-ink">{analysis.occasion}</span>{" "}
              상황에서{" "}
              <span className="font-semibold text-ink">{analysis.budget}</span>{" "}
              예산을 기준으로 찾아봤어요.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px bg-zinc-100 sm:grid-cols-4">
            {cardItems.map(({ key, label }) => (
              <div key={key} className="bg-white p-4 sm:px-5 sm:py-4">
                <p className="text-[10px] font-medium tracking-[0.16em] text-zinc-400">
                  {label.toUpperCase()}
                </p>
                <p className="mt-1.5 text-sm font-semibold leading-5 text-zinc-800">
                  {analysis[key]}
                </p>
              </div>
            ))}
          </div>

          {(analysis.preferences.length > 0 || analysis.constraints.length > 0) && (
            <div className="grid gap-5 border-t border-zinc-100 bg-zinc-50/60 px-5 py-5 sm:grid-cols-2 sm:px-6">
              {analysis.preferences.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-zinc-500">
                    반영한 포인트
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {analysis.preferences.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {analysis.constraints.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-zinc-500">
                    가격·제약 조건
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {analysis.constraints.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
