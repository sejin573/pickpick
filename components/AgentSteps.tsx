import { AgentStep, RecommendResponse } from "@/lib/types";

type AgentTrace = NonNullable<RecommendResponse["meta"]>["agentTrace"];

export default function AgentSteps({
  steps,
  trace,
}: {
  steps: AgentStep[];
  trace?: AgentTrace;
}) {
  return (
    <details className="group surface overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-600 text-white">
            ✓
          </span>
          <div>
            <p className="eyebrow">Agent report</p>
            <h2 className="mt-1 text-xl font-black tracking-tight">
              추천이 만들어진 과정이 궁금한가요?
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              5단계 판단 근거를 투명하게 확인할 수 있어요.
            </p>
          </div>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-100 text-lg transition group-open:rotate-180">
          ↓
        </span>
      </summary>
      <div className="border-t border-zinc-100 bg-zinc-50/60 p-6 sm:p-8">
        <div className="grid gap-3 lg:grid-cols-5">
          {steps.map((step, index) => (
            <div key={step.title} className="relative rounded-2xl border border-white bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-violet-600 text-xs font-black text-white">
                  {index + 1}
                </span>
                {index < steps.length - 1 && (
                  <span className="hidden text-violet-300 lg:block">→</span>
                )}
              </div>
              <h3 className="text-sm font-bold">{step.title}</h3>
              <p className="mt-2 text-xs leading-5 text-zinc-500">{step.description}</p>
            </div>
          ))}
        </div>
        {trace && trace.length > 0 && (
          <div className="mt-6 rounded-3xl border border-violet-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Agent runtime trace</p>
                <h3 className="mt-1 text-lg font-black tracking-tight text-ink">
                  실제 agent action 기록
                </h3>
              </div>
              <p className="text-xs font-semibold text-zinc-400">
                {trace.length} actions ·{" "}
                {trace.reduce((sum, item) => sum + item.elapsedMs, 0)}ms
              </p>
            </div>
            <div className="mt-4 grid gap-3">
              {trace.map((item, index) => (
                <div
                  key={`${item.action}-${index}`}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          item.status === "completed"
                            ? "bg-emerald-500"
                            : item.status === "skipped"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                      />
                      <p className="font-mono text-xs font-black uppercase tracking-wide text-violet-700">
                        {item.action}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-zinc-400">
                      {item.status} · {item.elapsedMs}ms
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {item.observation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
