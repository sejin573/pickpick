import PromptExamples from "@/components/PromptExamples";
import { RecommendResponse } from "@/lib/types";

export default function ServiceInfo({
  onSelect,
  meta,
}: {
  onSelect: (prompt: string) => void;
  meta?: RecommendResponse["meta"];
}) {
  const usesLiveCatalog = meta?.catalogProvider === "naver";

  return (
    <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <article className="surface p-6 sm:p-8">
        <p className="eyebrow">Why PickPick</p>
        <h2 className="section-title">추천에서 끝나지 않는 이유</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {[
            ["01", "자연어 분석", "복잡한 폼 없이 평소 말하듯 상황을 입력합니다."],
            ["02", "근거 있는 비교", "가격뿐 아니라 실용성, 감성, 리스크까지 함께 봅니다."],
            ["03", "구매 판단 지원", "언제 사고, 무엇을 확인할지 다음 행동을 제안합니다."],
          ].map(([number, title, description]) => (
            <div key={number} className="rounded-2xl bg-zinc-50 p-5">
              <span className="text-xs font-black text-violet-500">{number}</span>
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
            </div>
          ))}
        </div>
      </article>
      <article className="surface p-6 sm:p-8">
        <p className="eyebrow">Quick start</p>
        <h2 className="section-title">예시로 바로 시작하기</h2>
        <div className="mt-6">
          <PromptExamples onSelect={onSelect} compact />
        </div>
      </article>
      <article className="surface p-6 sm:p-8 lg:col-span-2">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">Data source</p>
            <h2 className="mt-2 text-xl font-bold">
              {usesLiveCatalog
                ? "네이버 쇼핑의 실제 판매 상품을 확인했습니다"
                : "검증 가능한 샘플 데이터로 안전하게 동작합니다"}
            </h2>
            <p className="muted mt-2 max-w-3xl">
              {usesLiveCatalog
                ? "현재 판매 중인 상품과 가격을 조회했으며, 최종 가격·재고·배송 일정은 판매처에서 한 번 더 확인해 주세요."
                : "외부 상품 API를 사용할 수 없을 때는 7개 카테고리, 28개 내장 상품 데이터셋으로 추천 흐름을 유지합니다."}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {(usesLiveCatalog
              ? ["Live catalog", "Naver Shopping", "Fallback ready"]
              : ["28 products", "7 categories", "Fallback ready"]
            ).map((item) => (
              <span key={item} className="chip">{item}</span>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
