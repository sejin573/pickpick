import { ComparisonItem } from "@/lib/types";

const formatPrice = (price: number) => new Intl.NumberFormat("ko-KR").format(price) + "원";

const metrics: Array<{ key: keyof ComparisonItem; label: string }> = [
  { key: "purposeFit", label: "목적 적합도" },
  { key: "practicality", label: "실용성" },
  { key: "emotional", label: "감성 점수" },
  { key: "value", label: "가성비" },
  { key: "risk", label: "리스크" },
];

export default function ComparisonTable({ items }: { items: ComparisonItem[] }) {
  return (
    <section className="surface overflow-hidden">
      <div className="p-6 sm:p-8">
        <p className="eyebrow">Side by side</p>
        <h2 className="section-title">한눈에 비교해 보세요</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-ink text-white">
              <th className="p-4 text-left font-semibold">비교 항목</th>
              {items.map((item) => <th key={item.name} className="p-4 text-left font-semibold">{item.name}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-100">
              <th className="p-4 text-left text-zinc-500">가격</th>
              {items.map((item) => <td key={item.name} className="p-4 font-bold">{formatPrice(item.price)}</td>)}
            </tr>
            {metrics.map((metric, rowIndex) => (
              <tr key={metric.key} className={rowIndex < metrics.length - 1 ? "border-b border-zinc-100" : ""}>
                <th className="p-4 text-left text-zinc-500">{metric.label}</th>
                {items.map((item) => {
                  const value = item[metric.key] as number;
                  const display = metric.key === "risk" ? 100 - value : value;
                  return (
                    <td key={item.name} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-violet-100">
                          <div className="h-full rounded-full bg-violet-500" style={{ width: `${display}%` }} />
                        </div>
                        <span className="w-8 text-right text-xs font-bold">{value}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
