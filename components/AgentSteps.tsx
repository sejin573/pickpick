import { AgentStep } from "@/lib/types";

export default function AgentSteps({ steps }: { steps: AgentStep[] }) {
  return (
    <section className="surface p-6 sm:p-8">
      <p className="eyebrow">Agent flow</p>
      <h2 className="section-title">에이전트는 이렇게 판단했어요</h2>
      <p className="muted mt-2">내부 사고 과정이 아닌, 판단에 사용한 단계와 근거를 요약해 보여줍니다.</p>

      <div className="mt-7 grid gap-3 lg:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step.title} className="relative rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
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
    </section>
  );
}
