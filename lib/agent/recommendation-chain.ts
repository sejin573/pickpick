import {
  buildDecisionSupport,
  enhanceRecommendation,
  extractBudget,
  fallbackRecommend,
} from "@/lib/agent";
import { CatalogResult } from "@/lib/product-provider";
import {
  PriceBand,
  RecommendationGroup,
  RecommendResponse,
  UserAnalysis,
} from "@/lib/types";

const DEFAULT_PRICE_BANDS: PriceBand[] = [
  { id: "low", label: "0~30만원", min: 0, max: 300000 },
  { id: "mid", label: "30~60만원", min: 300000, max: 600000 },
  { id: "high", label: "60~90만원", min: 600000, max: 900000 },
];

function buildAdjacentPriceBands(message: string): PriceBand[] | null {
  const match = message.replace(/\s/g, "").match(/(\d+)만원대/);
  const budget = extractBudget(message);
  if (!match || budget === null) return null;

  const amount = match[1];
  const bandSize = 10 ** Math.max(0, amount.length - 1) * 10_000;

  return [0, -1, 1].map((offset) => {
    const min = Math.max(0, budget + offset * bandSize);
    const max = min + bandSize;

    return {
      id: offset === 0 ? "requested" : offset < 0 ? "lower" : "upper",
      label: `${Math.round(min / 10_000)}만원대`,
      min,
      max,
    };
  });
}

function annotatePlanningMode(
  result: RecommendResponse,
  analysis: UserAnalysis,
  queryPlanningMode: "rules" | "openai-assisted",
) {
  if (result.meta) {
    result.meta.queryPlanningMode = queryPlanningMode;
  }

  if (result.agentSteps[1]) {
    result.agentSteps[1].description =
      queryPlanningMode === "openai-assisted"
        ? "OpenAI가 요청을 실제 구매 가능한 상품군과 네이버 검색어로 다시 정리했어요."
        : `예산, 대상, 상황과 ${analysis.preferences.join(", ")} 선호를 규칙 기반으로 정리했어요.`;
  }
}

function buildInitialRecommendation(
  message: string,
  liveCatalog: CatalogResult | null,
): RecommendResponse {
  return liveCatalog
    ? fallbackRecommend(message, liveCatalog.groups[0].products, {
        provider: liveCatalog.provider,
        label: liveCatalog.label,
      })
    : fallbackRecommend(message);
}

function applyBandedRecommendations(
  result: RecommendResponse,
  message: string,
  liveCatalog: CatalogResult,
  activePriceBands: PriceBand[],
  adjacentPriceBands: PriceBand[] | null,
) {
  const baseGroups = liveCatalog.groups.slice(0, 3);
  const banded: RecommendationGroup[] = [];

  for (const band of activePriceBands) {
    const usedProductIds = new Set<string>();

    for (const group of baseGroups) {
      const products = group.products.filter(
        (product) => product.price >= band.min && product.price < band.max,
      );
      if (products.length === 0) continue;

      const uniqueProducts = products.filter(
        (product) => !usedProductIds.has(product.id),
      );
      const candidateProducts =
        uniqueProducts.length >= 3 ? uniqueProducts : products;
      const groupResult = fallbackRecommend(
        message,
        candidateProducts,
        {
          provider: liveCatalog.provider,
          label: liveCatalog.label,
        },
        5,
        { diversifyByPrice: { min: band.min, max: band.max } },
      );

      groupResult.recommendations.forEach((item) =>
        usedProductIds.add(item.id),
      );
      banded.push({
        id: `${band.id}-${group.id}`,
        title: group.title,
        subtitle: group.subtitle,
        category: group.category,
        priceBand: band.id,
        recommendations: groupResult.recommendations,
      });
    }
  }

  if (banded.length === 0) return;

  result.recommendationGroups = banded;
  result.priceBands = activePriceBands.filter((band) =>
    banded.some((group) => group.priceBand === band.id),
  );

  const firstActiveBand =
    result.priceBands.find((band) => band.id === "requested")?.id ??
    result.priceBands[0]?.id;
  const primaryGroup = firstActiveBand
    ? banded.find((group) => group.priceBand === firstActiveBand)
    : banded[0];

  if (primaryGroup) {
    result.recommendations = primaryGroup.recommendations;
    Object.assign(
      result,
      buildDecisionSupport(
        message,
        primaryGroup.recommendations,
        baseGroups.flatMap((group) => group.products),
      ),
    );
  }

  const totalCandidates = banded.reduce(
    (sum, group) => sum + group.recommendations.length,
    0,
  );

  if (result.agentSteps[2]) {
    result.agentSteps[2].description = adjacentPriceBands
      ? `네이버 쇼핑의 실제 판매 상품 ${totalCandidates}개를 요청 예산과 위아래 10만원 가격대로 나눠 비교했어요.`
      : `네이버 쇼핑의 실제 판매 상품 ${totalCandidates}개를 가격대별로 나눠 비교했어요.`;
  }

  if (result.agentSteps[4]) {
    result.agentSteps[4].description = `${result.priceBands.length}개 가격대에서 카테고리별로 각각 5개 상품을 정리했어요.`;
  }
}

function applyCategoryRecommendations(
  result: RecommendResponse,
  message: string,
  liveCatalog: CatalogResult,
) {
  const baseGroups = liveCatalog.groups.slice(0, 3);
  const usedProductIds = new Set<string>();

  result.recommendationGroups = baseGroups.map((group) => {
    const uniqueProducts = group.products.filter(
      (product) => !usedProductIds.has(product.id),
    );
    const candidateProducts =
      uniqueProducts.length >= 3 ? uniqueProducts : group.products;
    const groupResult = fallbackRecommend(message, candidateProducts, {
      provider: liveCatalog.provider,
      label: liveCatalog.label,
    });

    groupResult.recommendations.forEach((item) => usedProductIds.add(item.id));

    return {
      id: group.id,
      title: group.title,
      subtitle: group.subtitle,
      category: group.category,
      recommendations: groupResult.recommendations,
    };
  });

  const totalCandidates = baseGroups.reduce(
    (sum, group) => sum + group.products.length,
    0,
  );

  if (result.agentSteps[2]) {
    result.agentSteps[2].description = `네이버 쇼핑의 실제 판매 상품 ${totalCandidates}개를 카테고리별로 나눠 가격, 판매처, 적합도를 비교했어요.`;
  }

  if (result.agentSteps[4]) {
    result.agentSteps[4].description = `상황에 맞는 ${result.recommendationGroups.length}개 카테고리에서 각각 상위 3개 상품을 선정했어요.`;
  }
}

export async function runRecommendationChain(input: {
  message: string;
  analysis: UserAnalysis;
  queryPlanningMode: "rules" | "openai-assisted";
  liveCatalog: CatalogResult | null;
}): Promise<RecommendResponse> {
  const { message, analysis, queryPlanningMode, liveCatalog } = input;
  const budgetUnspecified = analysis.budgetValue === null;
  const adjacentPriceBands = buildAdjacentPriceBands(message);
  const result = buildInitialRecommendation(message, liveCatalog);

  annotatePlanningMode(result, analysis, queryPlanningMode);

  if (liveCatalog) {
    if (budgetUnspecified || adjacentPriceBands) {
      applyBandedRecommendations(
        result,
        message,
        liveCatalog,
        adjacentPriceBands ?? DEFAULT_PRICE_BANDS,
        adjacentPriceBands,
      );
    } else {
      applyCategoryRecommendations(result, message, liveCatalog);
    }
  }

  if (budgetUnspecified || adjacentPriceBands) {
    return result;
  }

  return enhanceRecommendation(
    message,
    result,
    liveCatalog?.groups.slice(0, 3),
  );
}
