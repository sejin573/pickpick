import { BuyingGuide as BuyingGuideType } from "@/lib/types";

const guideSections = [
  { key: "buyNowIf", title: "바로 구매해도 좋아요", icon: "✓", tone: "bg-emerald-50 text-emerald-800" },
  { key: "thinkMoreIf", title: "한 번 더 고민해 보세요", icon: "?", tone: "bg-amber-50 text-amber-800" },
  { key: "checkBeforeBuying", title: "결제 전에 확인하세요", icon: "!", tone: "bg-violet-50 text-violet-800" },
] as const;

export default function BuyingGuide({ guide }: { guide: BuyingGuideType }) {
  return (
    <section className="surface p-6 sm:p-8">
      <p className="eyebrow">Decision helper</p>
      <h2 className="section-title">구매 판단 도우미</h2>
      <div className="mt-6 rounded-2xl bg-ink p-5 text-white sm:flex sm:items-center sm:gap-5">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-violet-500 text-xl">★</span>
        <div className="mt-3 sm:mt-0">
          <p className="text-xs font-bold text-violet-300">가장 추천하는 선택</p>
          <p className="mt-1 font-semibold leading-6">{guide.bestChoice}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {guideSections.map((section) => (
          <div key={section.key} className={`rounded-2xl p-5 ${section.tone}`}>
            <div className="flex items-center gap-2 font-bold">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/70 text-sm">{section.icon}</span>
              {section.title}
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-5">
              {guide[section.key].map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
