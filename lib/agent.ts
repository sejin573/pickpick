import { products } from "@/lib/products";
import {
  BuyingGuide,
  Product,
  RecommendResponse,
  Recommendation,
  UserAnalysis,
} from "@/lib/types";

const keywordGroups: Record<string, string[]> = {
  "여자친구": ["여자친구", "여친"],
  "남자친구": ["남자친구", "남친"],
  "부모님": ["부모님", "엄마", "아빠", "어머니", "아버지"],
  "친구": ["친구", "지인"],
  "직장인": ["직장인", "회사원", "동료", "취업"],
  "개발": ["개발", "코딩", "프로그래밍"],
  "자취": ["자취", "독립", "집들이", "이사"],
  "여행": ["여행", "출장", "캠핑"],
  "건강": ["건강", "효도", "운동", "수면", "피로"],
  "뷰티": ["뷰티", "화장", "피부", "패션", "향수", "헤어"],
  "노트북": ["노트북", "랩톱"],
  "선물": ["선물", "생일", "기념일"],
  "생일": ["생일", "birthday"],
  "실용": ["실용", "가성비", "유용"],
  "감성": ["감성", "특별", "기억", "예쁜"],
};

const formatWon = (value: number) =>
  new Intl.NumberFormat("ko-KR").format(value) + "원";

function extractBudget(message: string): number | null {
  const normalized = message.replace(/,/g, "").replace(/\s/g, "");
  const manwon = normalized.match(/(\d+(?:\.\d+)?)만원/);
  if (manwon) return Math.round(Number(manwon[1]) * 10000);

  const eok = normalized.match(/(\d+(?:\.\d+)?)억/);
  if (eok) return Math.round(Number(eok[1]) * 100000000);

  const won = normalized.match(/(\d{4,})원/);
  if (won) return Number(won[1]);

  return null;
}

function extractKeywords(message: string): string[] {
  const lower = message.toLowerCase();
  return Object.entries(keywordGroups)
    .filter(([, variants]) => variants.some((keyword) => lower.includes(keyword)))
    .map(([canonical]) => canonical);
}

function inferTarget(keywords: string[]): string {
  return (
    ["여자친구", "남자친구", "부모님", "친구", "직장인"].find((item) =>
      keywords.includes(item),
    ) ?? "본인 또는 선물 받을 사람"
  );
}

function inferOccasion(message: string, keywords: string[]): string {
  if (message.includes("생일")) return "생일";
  if (message.includes("기념일")) return "기념일";
  if (message.includes("집들이") || message.includes("자취")) return "자취/집들이";
  if (message.includes("효도") || keywords.includes("부모님")) return "효도/건강 관리";
  if (message.includes("취업")) return "취업/새 출발";
  if (keywords.includes("여행")) return "여행 준비";
  return keywords.includes("선물") ? "선물" : "일상 구매";
}

export function analyzeMessage(message: string): UserAnalysis {
  const budgetValue = extractBudget(message);
  const keywords = extractKeywords(message);
  const preferences = ["실용", "감성", "가성비", "건강", "뷰티", "여행", "개발"]
    .filter((keyword) => keywords.includes(keyword));
  const constraints: string[] = [];

  if (budgetValue) {
    constraints.push(
      message.includes("이하")
        ? `${formatWon(budgetValue)} 이하`
        : `${formatWon(budgetValue)} 안팎`,
    );
  }
  if (message.length < 12) constraints.push("입력 정보가 짧아 일반적인 선호를 함께 반영");
  if (!budgetValue) constraints.push("명시된 예산 없음");

  const target = inferTarget(keywords);
  const occasion = inferOccasion(message, keywords);

  return {
    intent: keywords.includes("선물")
      ? `${target}을 위한 ${occasion} 상품 탐색`
      : "상황과 조건에 맞는 상품 구매 결정",
    target,
    budget: budgetValue ? formatWon(budgetValue) : "예산 미지정",
    budgetValue,
    occasion,
    preferences: preferences.length ? preferences : ["균형 잡힌 선택", "활용도"],
    constraints,
    keywords,
  };
}

function budgetScore(price: number, budget: number | null, strict: boolean): number {
  if (!budget) return 12;
  const ratio = price / budget;
  if (ratio <= 0.85 && ratio >= 0.35) return 24;
  if (ratio <= 1) return 28;
  if (!strict && ratio <= 1.18) return 18;
  if (!strict && ratio <= 1.35) return 8;
  return -25;
}

function scoreProduct(
  product: Product,
  analysis: UserAnalysis,
  message: string,
): { score: number; matched: string[] } {
  const searchable = [
    product.name,
    product.category,
    ...product.tags,
    ...product.targetUsers,
    ...product.situations,
    product.description,
  ].join(" ");

  const matched = analysis.keywords.filter((keyword) => searchable.includes(keyword));
  let score = 22 + matched.length * 9;
  score += budgetScore(product.price, analysis.budgetValue, message.includes("이하"));
  score += product.practicalScore * 0.15;
  score += product.emotionalScore * 0.1;
  score += product.valueScore * 0.13;
  score -= product.riskScore * 0.09;

  if (analysis.preferences.includes("실용")) score += product.practicalScore * 0.08;
  if (analysis.preferences.includes("감성")) score += product.emotionalScore * 0.08;
  if (analysis.preferences.includes("가성비")) score += product.valueScore * 0.08;
  if (analysis.keywords.includes("선물")) score += product.emotionalScore * 0.04;

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    matched,
  };
}

function buildRecommendation(
  product: Product,
  score: number,
  matched: string[],
  analysis: UserAnalysis,
): Recommendation {
  const matchText = matched.length
    ? `${matched.slice(0, 3).join(", ")} 조건과 잘 맞고`
    : "명시되지 않은 취향까지 폭넓게 고려했을 때";

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    score,
    reason: `${matchText}, ${product.description}라는 점에서 ${analysis.target}에게 적합합니다.`,
    pros: product.strengths,
    cons: product.cautions,
    fitFor: `${analysis.occasion}에 실용성과 만족도의 균형을 원하는 사용자`,
    imageUrl: product.imageUrl,
    productUrl: product.productUrl,
    mallName: product.mallName,
    brand: product.brand,
    source: product.source,
    isLive: product.isLive,
  };
}

function buildBuyingGuide(
  recommendations: Recommendation[],
  analysis: UserAnalysis,
): BuyingGuide {
  const best = recommendations[0];
  return {
    bestChoice: `${best.name} — 현재 조건에서 목적 적합도와 구매 부담의 균형이 가장 좋습니다.`,
    buyNowIf: [
      `${formatWon(best.price)}의 예산이 부담스럽지 않은 경우`,
      `${best.pros[0]}을 중요하게 생각하는 경우`,
      "받는 사람의 취향이나 사용 환경을 대략 알고 있는 경우",
    ],
    thinkMoreIf: [
      "브랜드·색상·향처럼 개인 취향이 강하게 작용하는 경우",
      "비슷한 제품을 이미 가지고 있을 가능성이 있는 경우",
      analysis.budgetValue && best.price > analysis.budgetValue
        ? "상품 가격이 입력한 예산을 초과하는 경우"
        : "배송일이나 교환 가능 기간이 촉박한 경우",
    ],
    checkBeforeBuying: [
      best.cons[0] ?? "교환·환불 조건",
      "최종 판매 가격과 배송 예정일",
      "옵션, 크기, 기기 호환성 등 상세 조건",
    ],
  };
}

export function fallbackRecommend(
  message: string,
  catalog: Product[] = products,
  catalogMeta?: {
    provider: "sample" | "naver" | "coupang";
    label: string;
  },
): RecommendResponse {
  const analysis = analyzeMessage(message);
  const ranked = catalog
    .map((product) => ({ product, ...scoreProduct(product, analysis, message) }))
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
    .slice(0, 3);
  const recommendations = ranked.map(({ product, score, matched }) =>
    buildRecommendation(product, score, matched, analysis),
  );

  return {
    analysis: {
      intent: analysis.intent,
      target: analysis.target,
      budget: analysis.budget,
      occasion: analysis.occasion,
      preferences: analysis.preferences,
      constraints: analysis.constraints,
    },
    agentSteps: [
      {
        title: "사용자 의도 분석",
        description: `입력 문장에서 ${analysis.target}을 위한 ${analysis.occasion} 관련 요청으로 파악했습니다.`,
      },
      {
        title: "조건 추출",
        description: `예산, 대상, 상황과 ${analysis.preferences.join(", ")} 선호를 구조화했습니다.`,
      },
      {
        title: "상품 후보 필터링",
        description: `${catalogMeta?.label ?? "샘플 상품 데이터"} ${catalog.length}개의 가격·태그·판매 정보를 입력 조건과 비교했습니다.`,
      },
      {
        title: "추천 점수 계산",
        description: "키워드 적합도, 예산, 실용성, 감성, 가성비와 구매 리스크를 0~100점으로 계산했습니다.",
      },
      {
        title: "최종 추천 및 구매 조언 생성",
        description: "상위 3개 상품을 선정하고 선택 이유와 구매 전 확인 사항을 정리했습니다.",
      },
    ],
    recommendations,
    comparison: ranked.map(({ product, score }) => ({
      name: product.name,
      price: product.price,
      purposeFit: score,
      practicality: product.practicalScore,
      emotional: product.emotionalScore,
      value: product.valueScore,
      risk: product.riskScore,
    })),
    buyingGuide: buildBuyingGuide(recommendations, analysis),
    meta: {
      mode: "fallback",
      llmProvider: "none",
      catalogProvider: catalogMeta?.provider ?? "sample",
      catalogLabel: catalogMeta?.label ?? "PickPick 샘플 상품",
    },
  };
}

type LlmCopy = {
  reasons?: Array<{ id: string; reason: string; fitFor: string }>;
  buyingGuide?: BuyingGuide;
};

function applyLlmCopy(
  result: RecommendResponse,
  copy: LlmCopy,
  provider: "openai" | "ollama",
): RecommendResponse {
  return {
    ...result,
    recommendations: result.recommendations.map((item) => {
      const revised = copy.reasons?.find((reason) => reason.id === item.id);
      return revised
        ? { ...item, reason: revised.reason, fitFor: revised.fitFor }
        : item;
    }),
    buyingGuide: copy.buyingGuide ?? result.buyingGuide,
    meta: {
      ...result.meta,
      mode: "llm-enhanced",
      llmProvider: provider,
    },
  };
}

function llmPrompt(message: string, result: RecommendResponse) {
  return JSON.stringify({
    instruction:
      "상품 순서, 상품명, 링크, 가격, 점수는 바꾸지 말고 한국어 추천 이유와 구매 가이드 문장만 자연스럽게 다듬어라. 반드시 JSON만 반환한다.",
    request: message,
    requiredShape: {
      reasons: [{ id: "상품 id", reason: "추천 이유", fitFor: "적합한 사용자" }],
      buyingGuide: {
        bestChoice: "문장",
        buyNowIf: ["문장"],
        thinkMoreIf: ["문장"],
        checkBeforeBuying: ["문장"],
      },
    },
    result,
  });
}

async function enhanceWithOpenAI(
  message: string,
  result: RecommendResponse,
): Promise<RecommendResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return result;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        store: false,
        reasoning: { effort: "low" },
        text: { format: { type: "json_object" }, verbosity: "low" },
        input: [
          {
            role: "developer",
            content:
              "당신은 한국어 쇼핑 카피 에디터다. 상품 순서, 가격, 점수는 바꾸지 말고 추천 이유와 구매 가이드 문장만 자연스럽게 다듬는다. 반드시 JSON만 반환한다.",
          },
          {
            role: "user",
            content: llmPrompt(message, result),
          },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return result;
    const data = (await response.json()) as {
      output?: Array<{
        type?: string;
        content?: Array<{ type?: string; text?: string }>;
      }>;
    };
    const content = data.output
      ?.flatMap((item) => item.content ?? [])
      .find((item) => item.type === "output_text")?.text;
    if (!content) return result;
    const copy = JSON.parse(content) as LlmCopy;

    return applyLlmCopy(result, copy, "openai");
  } catch {
    return result;
  }
}

async function enhanceWithOllama(
  message: string,
  result: RecommendResponse,
): Promise<RecommendResponse> {
  const baseUrl = process.env.OLLAMA_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return result;

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.OLLAMA_API_KEY
          ? { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL ?? "qwen3:4b",
        stream: false,
        format: "json",
        messages: [{ role: "user", content: llmPrompt(message, result) }],
        options: { temperature: 0.3 },
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return result;

    const data = (await response.json()) as {
      message?: { content?: string };
    };
    if (!data.message?.content) return result;
    return applyLlmCopy(
      result,
      JSON.parse(data.message.content) as LlmCopy,
      "ollama",
    );
  } catch {
    return result;
  }
}

export async function enhanceRecommendation(
  message: string,
  result: RecommendResponse,
): Promise<RecommendResponse> {
  const preferred = (process.env.LLM_PROVIDER ?? "openai").toLowerCase();
  const enhanced =
    preferred === "ollama"
      ? await enhanceWithOllama(message, result)
      : await enhanceWithOpenAI(message, result);

  if (enhanced.meta?.mode === "llm-enhanced") return enhanced;

  return {
    ...result,
    meta: {
      ...result.meta,
      mode: "fallback",
      llmProvider: "none",
      notice:
        result.meta?.catalogProvider === "naver"
          ? "실시간 상품은 불러왔고, 설명은 PickPick 추천 엔진이 생성했습니다."
          : undefined,
    },
  };
}
