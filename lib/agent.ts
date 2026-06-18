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
  "휴식/놀이": [
    "놀거", "놀 것", "놀고 싶", "일하기 싫", "심심", "스트레스",
    "쉬고 싶", "힐링", "재미있는", "재밌는", "취미",
  ],
  "피로 회복": ["피곤", "지쳤", "피로", "힘들", "뻐근", "쉬어야", "휴식 필요"],
  "집중": ["집중", "공부하기 싫", "일이 안", "능률", "생산성", "몰입"],
  "수면": ["잠이 안", "불면", "잘 자고", "숙면", "잠 좀", "수면"],
  "운동": ["운동하고", "살 빼", "다이어트", "몸 만들", "홈트", "헬스"],
  "요리/먹거리": ["배고", "뭐 먹", "요리", "간식", "커피 마시", "홈카페"],
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
  if (keywords.includes("휴식/놀이")) return "휴식/놀이";
  if (keywords.includes("피로 회복")) return "피로 회복";
  if (keywords.includes("집중")) return "집중/생산성";
  if (keywords.includes("수면")) return "수면 개선";
  if (keywords.includes("운동")) return "운동/건강 관리";
  if (keywords.includes("요리/먹거리")) return "식사/홈카페";
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
  const preferences = [
    "실용", "감성", "가성비", "건강", "뷰티", "여행", "개발",
    "휴식/놀이", "피로 회복", "집중", "수면", "운동", "요리/먹거리",
  ]
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

function contextualBudgetScore(
  price: number,
  budget: number | null,
  message: string,
): number {
  if (!budget) return 12;
  const ratio = price / budget;

  const priceBand = message.match(/(\d+)\s*만원대/);
  if (priceBand) {
    const amount = priceBand[1];
    const bandSize = 10 ** Math.max(0, amount.length - 1) * 10000;
    if (price >= budget && price < budget + bandSize) return 30;
    return -35;
  }

  return budgetScore(price, budget, message.includes("이하"));
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
  score += contextualBudgetScore(product.price, analysis.budgetValue, message);
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
  maxItems: number = 3,
  options?: {
    diversifyByPrice?: { min: number; max: number };
  },
): RecommendResponse {
  const analysis = analyzeMessage(message);
  const allRanked = catalog
    .map((product) => ({ product, ...scoreProduct(product, analysis, message) }))
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price);

  let ranked = allRanked.slice(0, maxItems);

  if (options?.diversifyByPrice && allRanked.length > maxItems) {
    const { min, max } = options.diversifyByPrice;
    const range = Math.max(max - min, 1);
    const slot = range / maxItems;
    const picked: typeof allRanked = [];
    const pickedIds = new Set<string>();

    for (let i = 0; i < maxItems; i++) {
      const subMin = min + i * slot;
      const subMax = i === maxItems - 1 ? max : min + (i + 1) * slot;
      const candidate = allRanked.find(
        ({ product }) =>
          !pickedIds.has(product.id) &&
          product.price >= subMin &&
          product.price < subMax,
      );
      if (candidate) {
        picked.push(candidate);
        pickedIds.add(candidate.product.id);
      }
    }

    for (const entry of allRanked) {
      if (picked.length >= maxItems) break;
      if (pickedIds.has(entry.product.id)) continue;
      picked.push(entry);
      pickedIds.add(entry.product.id);
    }

    ranked = picked.sort((a, b) => a.product.price - b.product.price);
  }
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
      selectionMode: "rules",
      catalogProvider: catalogMeta?.provider ?? "sample",
      catalogLabel: catalogMeta?.label ?? "PickPick 샘플 상품",
    },
  };
}

type LlmCopy = {
  groupSelections: Array<{
    groupId: string;
    subtitle: string;
    selected: Array<{
      id: string;
      reason: string;
      fitFor: string;
    }>;
  }>;
  buyingGuide: BuyingGuide;
};

type CandidateGroup = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  products: Product[];
};

function applyLlmCopy(
  message: string,
  result: RecommendResponse,
  copy: LlmCopy,
  candidateGroups?: CandidateGroup[],
): RecommendResponse {
  const analysis = analyzeMessage(message);
  const enhancedGroups = result.recommendationGroups?.map((group) => {
    const selection = copy.groupSelections.find(
      (item) => item.groupId === group.id,
    );
    const candidates = candidateGroups?.find(
      (item) => item.id === group.id,
    )?.products;

    if (!selection) return group;

    const selectedRecommendations = selection.selected
      .map((selected) => {
        const product = candidates?.find((item) => item.id === selected.id);
        if (!product) {
          const existing = group.recommendations.find(
            (item) => item.id === selected.id,
          );
          return existing
            ? {
                ...existing,
                reason: selected.reason,
                fitFor: selected.fitFor,
              }
            : null;
        }

        const scored = scoreProduct(product, analysis, message);
        return {
          ...buildRecommendation(
            product,
            scored.score,
            scored.matched,
            analysis,
          ),
          reason: selected.reason,
          fitFor: selected.fitFor,
        };
      })
      .filter((item): item is Recommendation => Boolean(item));

    return {
      ...group,
      subtitle: selection.subtitle || group.subtitle,
      recommendations:
        selectedRecommendations.length === 3
          ? selectedRecommendations
          : group.recommendations,
    };
  });

  const primaryRecommendations =
    enhancedGroups?.[0]?.recommendations ?? result.recommendations;

  return {
    ...result,
    recommendations: primaryRecommendations,
    recommendationGroups: enhancedGroups,
    comparison: primaryRecommendations.map((item) => {
      const source = candidateGroups
        ?.flatMap((group) => group.products)
        .find((product) => product.id === item.id);
      return {
        name: item.name,
        price: item.price,
        purposeFit: item.score,
        practicality: source?.practicalScore ?? 80,
        emotional: source?.emotionalScore ?? 75,
        value: source?.valueScore ?? 80,
        risk: source?.riskScore ?? 24,
      };
    }),
    buyingGuide: copy.buyingGuide,
    meta: {
      ...result.meta,
      mode: "llm-enhanced",
      llmProvider: "openai",
      selectionMode: "openai-assisted",
    },
  };
}

function llmPrompt(
  message: string,
  result: RecommendResponse,
  candidateGroups?: CandidateGroup[],
) {
  const analysis = analyzeMessage(message);
  const groups = candidateGroups?.slice(0, 3).map((group) => ({
    id: group.id,
    title: group.title,
    category: group.category,
    currentSubtitle: group.subtitle,
    candidates: group.products
      .map((product) => ({
        product,
        score: scoreProduct(product, analysis, message).score,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ product, score }) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        brand: product.brand ?? "",
        category: product.category,
        codeScore: score,
        strengths: product.strengths.slice(0, 2),
        cautions: product.cautions.slice(0, 1),
      })),
  })) ?? result.recommendationGroups?.map((group) => ({
    id: group.id,
    title: group.title,
    category: group.category,
    currentSubtitle: group.subtitle,
    candidates: group.recommendations.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      brand: item.brand ?? "",
      category: item.category,
      codeScore: item.score,
      strengths: item.pros.slice(0, 2),
      cautions: item.cons.slice(0, 1),
    })),
  })) ?? [{
    id: "top-picks",
    title: "추천",
    category: "추천",
    currentSubtitle: "",
    candidates: result.recommendations.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      brand: item.brand ?? "",
      category: item.category,
      codeScore: item.score,
      strengths: item.pros.slice(0, 2),
      cautions: item.cons.slice(0, 1),
    })),
  }];

  return JSON.stringify({
    request: message,
    analysis: result.analysis,
    groups,
  });
}

const recommendationSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    groupSelections: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          groupId: { type: "string" },
          subtitle: { type: "string" },
          selected: {
            type: "array",
            minItems: 3,
            maxItems: 3,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                id: { type: "string" },
                reason: { type: "string" },
                fitFor: { type: "string" },
              },
              required: ["id", "reason", "fitFor"],
            },
          },
        },
        required: ["groupId", "subtitle", "selected"],
      },
    },
    buyingGuide: {
      type: "object",
      additionalProperties: false,
      properties: {
        bestChoice: { type: "string" },
        buyNowIf: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: { type: "string" },
        },
        thinkMoreIf: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: { type: "string" },
        },
        checkBeforeBuying: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: { type: "string" },
        },
      },
      required: [
        "bestChoice",
        "buyNowIf",
        "thinkMoreIf",
        "checkBeforeBuying",
      ],
    },
  },
  required: ["groupSelections", "buyingGuide"],
} as const;

async function enhanceWithOpenAI(
  message: string,
  result: RecommendResponse,
  candidateGroups?: CandidateGroup[],
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
        model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
        store: false,
        reasoning: { effort: "low" },
        text: {
          format: {
            type: "json_schema",
            name: "pickpick_recommendation",
            strict: true,
            schema: recommendationSchema,
          },
          verbosity: "low",
        },
        input: [
          {
            role: "developer",
            content:
              "당신은 한국어 커머스 추천 에이전트다. 각 그룹의 실제 후보 중 사용자 요청에 가장 적합한 상품 ID 정확히 3개를 고른다. 코드 점수는 참고하되 대상·상황·활용도·선물 적합성을 함께 비교한다. 제공된 후보에 없는 상품이나 사실을 만들지 않고 가격·상품명을 변경하지 않는다. 의료 효과를 단정하지 않는다. 그룹 부제는 35자 이내, 추천 이유는 구체적인 한 문장, fitFor는 25자 이내로 간결하게 쓴다. 구매 가이드 각 항목도 한 문장으로 쓴다.",
          },
          {
            role: "user",
            content: llmPrompt(message, result, candidateGroups),
          },
        ],
        max_output_tokens: 2200,
      }),
      signal: AbortSignal.timeout(18000),
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

    return applyLlmCopy(message, result, copy, candidateGroups);
  } catch {
    return result;
  }
}

export async function enhanceRecommendation(
  message: string,
  result: RecommendResponse,
  candidateGroups?: CandidateGroup[],
): Promise<RecommendResponse> {
  const enhanced = await enhanceWithOpenAI(message, result, candidateGroups);

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
