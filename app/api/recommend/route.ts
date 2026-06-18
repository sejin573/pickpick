import { NextResponse } from "next/server";

import {
  analyzeMessage,
  buildDecisionSupport,
  enhanceRecommendation,
  fallbackRecommend,
} from "@/lib/agent";
import { searchLiveProducts } from "@/lib/product-provider";
import { PriceBand, RecommendRequest, RecommendationGroup } from "@/lib/types";

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15;
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

const PRICE_BANDS: PriceBand[] = [
  { id: "low", label: "0~30만원", min: 0, max: 300000 },
  { id: "mid", label: "30~60만원", min: 300000, max: 600000 },
  { id: "high", label: "60~90만원", min: 600000, max: 900000 },
];

function getClientId(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous"
  );
}

function isRateLimited(clientId: string): boolean {
  const now = Date.now();

  if (requestBuckets.size > 1_000) {
    requestBuckets.forEach((bucket, key) => {
      if (bucket.resetAt <= now) requestBuckets.delete(key);
    });
  }

  const bucket = requestBuckets.get(clientId);

  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(getClientId(request))) {
      return NextResponse.json(
        { error: "요청이 잠시 몰렸습니다. 1분 뒤 다시 시도해 주세요." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as Partial<RecommendRequest>;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "추천받고 싶은 상황을 한 문장으로 입력해 주세요." },
        { status: 400 },
      );
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `요청은 ${MAX_MESSAGE_LENGTH}자 이내로 입력해 주세요.` },
        { status: 400 },
      );
    }

    const analysis = analyzeMessage(message);
    const liveCatalog = await searchLiveProducts(message, analysis);
    const budgetUnspecified = analysis.budgetValue === null;
    const fallback = liveCatalog
      ? fallbackRecommend(message, liveCatalog.groups[0].products, {
          provider: liveCatalog.provider,
          label: liveCatalog.label,
        })
      : fallbackRecommend(message);

    if (liveCatalog) {
      const baseGroups = liveCatalog.groups.slice(0, 3);

      if (budgetUnspecified) {
        const banded: RecommendationGroup[] = [];
        for (const band of PRICE_BANDS) {
          for (const group of baseGroups) {
            const products = group.products.filter(
              (product) =>
                product.price >= band.min && product.price < band.max,
            );
            if (products.length === 0) continue;
            const groupResult = fallbackRecommend(
              message,
              products,
              {
                provider: liveCatalog.provider,
                label: liveCatalog.label,
              },
              5,
              { diversifyByPrice: { min: band.min, max: band.max } },
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

        if (banded.length > 0) {
          fallback.recommendationGroups = banded;
          fallback.priceBands = PRICE_BANDS.filter((band) =>
            banded.some((group) => group.priceBand === band.id),
          );

          const firstActiveBand = fallback.priceBands[0]?.id;
          const primaryGroup = firstActiveBand
            ? banded.find((group) => group.priceBand === firstActiveBand)
            : banded[0];
          if (primaryGroup) {
            fallback.recommendations = primaryGroup.recommendations;
            Object.assign(
              fallback,
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
          fallback.agentSteps[2].description = `네이버 쇼핑의 실제 판매 상품 ${totalCandidates}개를 가격대(0~90만원)별로 나눠 비교했습니다.`;
          fallback.agentSteps[4].description = `${fallback.priceBands.length}개 가격대에서 카테고리별로 각각 5개 상품을 정리했습니다.`;
        }
      } else {
        fallback.recommendationGroups = baseGroups.map((group) => {
          const groupResult = fallbackRecommend(message, group.products, {
            provider: liveCatalog.provider,
            label: liveCatalog.label,
          });
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
        fallback.agentSteps[2].description = `네이버 쇼핑의 실제 판매 상품 ${totalCandidates}개를 카테고리별로 나눠 가격·판매처·적합도를 비교했습니다.`;
        fallback.agentSteps[4].description = `상황에 맞는 ${fallback.recommendationGroups.length}개 카테고리에서 각각 상위 3개 상품을 선정했습니다.`;
      }
    }

    if (budgetUnspecified) {
      return NextResponse.json(fallback);
    }

    const result = await enhanceRecommendation(
      message,
      fallback,
      liveCatalog?.groups.slice(0, 3),
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("[recommend] request failed", {
      message: error instanceof Error ? error.message : "unknown error",
    });
    return NextResponse.json(
      { error: "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
