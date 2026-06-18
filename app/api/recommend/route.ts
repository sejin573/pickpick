import { NextResponse } from "next/server";

import {
  analyzeMessage,
  enhanceRecommendation,
  fallbackRecommend,
} from "@/lib/agent";
import { searchLiveProducts } from "@/lib/product-provider";
import { RecommendRequest } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<RecommendRequest>;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "추천받고 싶은 상황을 한 문장으로 입력해 주세요." },
        { status: 400 },
      );
    }

    const analysis = analyzeMessage(message);
    const liveCatalog = await searchLiveProducts(message, analysis);
    const fallback = liveCatalog
      ? fallbackRecommend(message, liveCatalog.groups[0].products, {
          provider: liveCatalog.provider,
          label: liveCatalog.label,
        })
      : fallbackRecommend(message);
    if (liveCatalog) {
      fallback.recommendationGroups = liveCatalog.groups.slice(0, 3).map((group) => {
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

      const totalCandidates = liveCatalog.groups
        .slice(0, 3)
        .reduce((sum, group) => sum + group.products.length, 0);
      fallback.agentSteps[2].description =
        `네이버 쇼핑의 실제 판매 상품 ${totalCandidates}개를 카테고리별로 나눠 가격·판매처·적합도를 비교했습니다.`;
      fallback.agentSteps[4].description =
        `상황에 맞는 ${fallback.recommendationGroups.length}개 카테고리에서 각각 상위 3개 상품을 선정했습니다.`;
    }
    const result = await enhanceRecommendation(message, fallback);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
