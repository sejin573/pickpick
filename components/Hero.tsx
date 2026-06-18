import PromptExamples from "@/components/PromptExamples";

interface HeroProps {
  message: string;
  loading: boolean;
  error: string;
  compact?: boolean;
  onReset?: () => void;
  onMessageChange: (message: string) => void;
  onSubmit: () => void;
}

export default function Hero({
  message,
  loading,
  error,
  compact = false,
  onReset,
  onMessageChange,
  onSubmit,
}: HeroProps) {
  const input = (
    <div className={`mx-auto w-full ${compact ? "max-w-4xl" : "max-w-3xl"}`}>
      <div className="flex items-end gap-2 rounded-[1.75rem] border border-zinc-200 bg-white p-2.5 shadow-[0_14px_50px_rgba(24,18,50,0.10)] transition focus-within:border-violet-300 focus-within:shadow-[0_18px_60px_rgba(92,65,180,0.14)]">
        <textarea
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmit();
            }
          }}
          rows={compact ? 1 : 2}
          placeholder="누구를 위한 어떤 상품을 찾고 있나요?"
          className="max-h-40 min-h-11 flex-1 resize-none border-0 bg-transparent px-3 py-3 text-[15px] leading-6 text-ink outline-none placeholder:text-zinc-400"
          aria-label="추천 상황 입력"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          aria-label="추천 요청 보내기"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-lg font-medium text-white transition hover:bg-violet-600 disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? (
            <span className="flex gap-0.5">
              <i className="loading-dot h-1 w-1 rounded-full bg-white" />
              <i className="loading-dot h-1 w-1 rounded-full bg-white" />
              <i className="loading-dot h-1 w-1 rounded-full bg-white" />
            </span>
          ) : (
            <span aria-hidden>↑</span>
          )}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-center text-sm font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );

  if (compact) {
    return (
      <section className="sticky top-3 z-40 rounded-3xl border border-white/80 bg-white/85 px-4 py-3 shadow-soft backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onReset}
            className="group hidden shrink-0 items-center gap-2 rounded-2xl px-2 py-1.5 transition duration-200 hover:bg-zinc-100 sm:flex"
            aria-label="PickPick 메인 화면으로 돌아가기"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-sm font-semibold text-white transition duration-200 group-hover:-rotate-3 group-hover:scale-105 group-hover:bg-violet-600">
              P
            </span>
            <span className="text-sm font-semibold tracking-tight transition-colors group-hover:text-violet-700">PickPick</span>
          </button>
          {input}
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-[82vh] flex-col">
      <header className="flex items-center justify-between py-3">
        <div className="group flex cursor-default items-center gap-2.5 rounded-2xl px-1 py-1">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-sm font-semibold text-white transition duration-200 group-hover:-rotate-3 group-hover:scale-105 group-hover:bg-violet-600 group-hover:shadow-lg group-hover:shadow-violet-200">
            P
          </span>
          <span className="text-[15px] font-semibold tracking-tight transition-colors group-hover:text-violet-700">PickPick</span>
        </div>
        <span className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-[11px] font-medium tracking-[0.1em] text-zinc-500 backdrop-blur">
          LIVE SHOPPING AGENT
        </span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center pb-16 pt-12 text-center">
        <span className="mb-6 grid h-14 w-14 cursor-default place-items-center rounded-2xl bg-violet-600 text-2xl text-white shadow-lg shadow-violet-200 transition duration-300 hover:-translate-y-1 hover:rotate-6 hover:scale-105 hover:shadow-xl hover:shadow-violet-300">
          ✦
        </span>
        <p className="text-[13px] font-medium text-violet-500">선택이 어려울 땐, 편하게 말해보세요</p>
        <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-ink sm:text-[44px] sm:leading-[1.18]">
          어떤 상품을 찾고 있나요?
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-500 sm:text-[15px]">
          대상과 상황, 예산을 한 문장으로 알려주면 실제 판매 상품을
          카테고리별로 비교해 드려요.
        </p>

        <div className="mt-9 w-full">{input}</div>

        <div className="mt-5 flex max-w-3xl flex-wrap justify-center gap-2">
          <PromptExamples onSelect={onMessageChange} compact />
        </div>
        <p className="mt-6 flex items-center gap-2 text-xs text-zinc-400">
          <i className="h-2 w-2 rounded-full bg-emerald-500" />
          네이버 쇼핑의 실제 판매 상품과 가격을 확인합니다
        </p>
      </div>
    </section>
  );
}
