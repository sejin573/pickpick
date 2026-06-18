import PromptExamples from "@/components/PromptExamples";

interface HeroProps {
  message: string;
  loading: boolean;
  error: string;
  onMessageChange: (message: string) => void;
  onSubmit: () => void;
}

export default function Hero({
  message,
  loading,
  error,
  onMessageChange,
  onSubmit,
}: HeroProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-ink text-white shadow-2xl shadow-violet-950/20">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-7 sm:p-12 lg:p-16">
          <div className="mb-9 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500 font-black">
                Z
              </span>
              <span className="text-sm font-bold tracking-wide">PickPick</span>
            </div>
            <span className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-violet-200">
              AI COMMERCE AGENT
            </span>
          </div>

          <p className="text-sm font-bold text-violet-300">생각은 가볍게, 선택은 선명하게</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-black leading-[1.1] tracking-[-0.04em] sm:text-6xl">
            상황을 이해하고
            <br />
            <span className="text-violet-400">구매 결정을 돕는</span>
            <br />
            AI 쇼핑 에이전트
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300">
            예산과 대상, 취향을 따로 고르지 마세요. 평소 말하듯 입력하면
            상품 비교부터 구매 전 체크포인트까지 한 번에 정리해 드립니다.
          </p>

          <div className="mt-9 rounded-3xl bg-white p-2 shadow-xl">
            <textarea
              value={message}
              onChange={(event) => onMessageChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  onSubmit();
                }
              }}
              rows={3}
              placeholder="예: 여행 좋아하는 친구에게 줄 10만원대 선물 추천해줘"
              className="w-full resize-none rounded-2xl border-0 px-4 py-3 text-sm leading-6 text-ink outline-none placeholder:text-zinc-400"
              aria-label="추천 상황 입력"
            />
            <div className="flex items-center justify-between gap-3 px-2 pb-1">
              <span className="hidden text-xs text-zinc-400 sm:block">
                Enter로 추천 · Shift + Enter로 줄바꿈
              </span>
              <button
                type="button"
                onClick={onSubmit}
                disabled={loading}
                className="ml-auto inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-70"
              >
                {loading ? (
                  <>
                    분석 중
                    <span className="flex gap-1">
                      <i className="loading-dot h-1 w-1 rounded-full bg-white" />
                      <i className="loading-dot h-1 w-1 rounded-full bg-white" />
                      <i className="loading-dot h-1 w-1 rounded-full bg-white" />
                    </span>
                  </>
                ) : (
                  <>추천 받기 <span aria-hidden>→</span></>
                )}
              </button>
            </div>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-red-300">
              {error}
            </p>
          )}
        </div>

        <aside className="border-t border-white/10 bg-violet-950/70 p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
          <p className="eyebrow !text-violet-300">TRY A PROMPT</p>
          <h2 className="mt-3 text-2xl font-bold">어떻게 물어볼지 고민된다면</h2>
          <p className="mb-6 mt-2 text-sm leading-6 text-violet-200/80">
            아래 예시를 눌러 바로 체험해 보세요.
          </p>
          <PromptExamples onSelect={onMessageChange} />
          <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6 text-xs text-violet-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
            API 키 없이도 내장 에이전트가 정상 동작합니다.
          </div>
        </aside>
      </div>
    </section>
  );
}
