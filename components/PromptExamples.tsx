export const promptExamples = [
  "20대 후반 여자친구 생일선물 30만원대 추천해줘",
  "자취 시작한 친구에게 줄 실용적인 선물 추천해줘",
  "개발 공부용 노트북을 사고 싶은데 예산은 100만원 이하야",
  "부모님께 드릴 건강 관련 선물 추천해줘",
];

interface PromptExamplesProps {
  onSelect: (prompt: string) => void;
  compact?: boolean;
}

export default function PromptExamples({
  onSelect,
  compact = false,
}: PromptExamplesProps) {
  return (
    <div className={compact ? "flex flex-wrap gap-2" : "grid gap-3 sm:grid-cols-2"}>
      {promptExamples.map((prompt, index) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className={
            compact
              ? "rounded-full border border-violet-100 bg-white px-3 py-2 text-left text-xs font-medium text-zinc-700 transition hover:border-violet-300 hover:text-violet-700"
              : "group rounded-2xl border border-white/10 bg-white/10 p-4 text-left text-sm leading-5 text-violet-50 transition hover:-translate-y-0.5 hover:bg-white/15"
          }
        >
          {!compact && (
            <span className="mb-2 block text-xs font-bold text-violet-200">
              EXAMPLE {index + 1}
            </span>
          )}
          {prompt}
        </button>
      ))}
    </div>
  );
}
