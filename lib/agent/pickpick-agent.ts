import { SupabaseClient } from "@supabase/supabase-js";

import { RecommendRequest, RecommendResponse } from "@/lib/types";

import { reviewCatalogWithAgent } from "./catalog-review-tool";
import { buildAgentContext } from "./context-chain";
import { runIntentChain } from "./intent-chain";
import {
  LearningMemory,
  loadLearningMemory,
  persistAgentLearning,
} from "./learning-memory";
import { runProductSearchTool } from "./product-search-tool";
import { runRecommendationChain } from "./recommendation-chain";
import { createAgentState, runAgentAction } from "./runtime";
import { runSearchPlanChain } from "./search-plan-chain";

function buildWorkingMessage(message: string, memory: LearningMemory): string {
  const hints = [
    memory.likedCategories.length
      ? `선호 카테고리: ${memory.likedCategories.join(", ")}`
      : "",
    memory.likedKeywords.length
      ? `선호 키워드: ${memory.likedKeywords.join(", ")}`
      : "",
    memory.preferredPriceMin && memory.preferredPriceMax
      ? `최근 선호 가격 범위: ${memory.preferredPriceMin}~${memory.preferredPriceMax}원`
      : "",
    memory.observations.length
      ? `이전 관찰: ${memory.observations.slice(0, 3).join(" / ")}`
      : "",
  ].filter(Boolean);

  if (hints.length === 0) return message;

  return `${message}\n\n[PickPick agent memory]\n${hints.join("\n")}`;
}

export async function runPickPickAgent(
  body: Partial<RecommendRequest>,
  options: {
    maxMessageLength: number;
    supabase?: SupabaseClient | null;
    userId?: string | null;
  },
): Promise<RecommendResponse> {
  const state = createAgentState(body.message?.trim() ?? "recommend products");
  const memory = await loadLearningMemory({
    supabase: options.supabase,
    userId: options.userId,
  });

  state.context = await runAgentAction(
    state,
    "contextualize_request",
    () => {
      const result = buildAgentContext(body, options.maxMessageLength);
      return {
        result,
        observation: result.isFollowUp
          ? "이전 대화를 반영한 후속 요청으로 변환"
          : "단일 추천 요청으로 해석",
      };
    },
  );

  const workingMessage = buildWorkingMessage(
    state.context.contextualMessage,
    memory,
  );

  const intentResult = await runAgentAction(state, "understand_intent", () => {
    const result = runIntentChain(state.context?.contextualMessage ?? "");
    return {
      result,
      observation: `${result.analysis.occasion} / ${result.analysis.budget} 요청으로 이해`,
    };
  });
  state.analysis = intentResult.analysis;

  state.queryPlan = await runAgentAction(state, "plan_search", async () => {
    const result = await runSearchPlanChain(workingMessage, state.analysis!);
    return {
      result,
      observation: `${result.groups.length}개 검색 그룹 생성 (${result.mode})`,
    };
  });

  const productSearch = await runAgentAction(state, "search_products", async () => {
    const result = await runProductSearchTool(
      workingMessage,
      state.analysis!,
      state.queryPlan!.groups,
      state.context!.excludedProductIds,
    );
    const count = result.liveCatalog?.products.length ?? 0;
    return {
      result,
      observation:
        count > 0
          ? `실시간 상품 ${count}개 수집`
          : "실시간 상품이 부족해 fallback 후보 사용",
    };
  });
  state.liveCatalog = productSearch.liveCatalog;

  state.catalogReview = await runAgentAction(state, "review_catalog", () => {
    const result = reviewCatalogWithAgent({
      catalog: state.liveCatalog ?? null,
      memory,
    });
    return {
      result,
      observation: result.observations.join(" / "),
    };
  });
  state.reviewedCatalog = state.catalogReview.catalog;

  state.response = await runAgentAction(
    state,
    "compose_recommendation",
    async () => {
      const result = await runRecommendationChain({
        message: workingMessage,
        analysis: state.analysis!,
        queryPlanningMode: state.queryPlan!.mode,
        liveCatalog: state.reviewedCatalog ?? null,
      });
      return {
        result,
        observation: `${result.recommendations.length}개 대표 추천 생성`,
      };
    },
  );

  state.response.meta = {
    mode: state.response.meta?.mode ?? "fallback",
    ...state.response.meta,
    agentRunId: state.runId,
    agentTrace: state.trace,
    learningEnabled: Boolean(options.supabase && options.userId),
    learningMemoryApplied:
      memory.likedCategories.length > 0 ||
      memory.likedKeywords.length > 0 ||
      memory.observations.length > 0,
    rejectedProductCount: state.catalogReview.rejectedCount,
  };

  await persistAgentLearning({
    supabase: options.supabase,
    userId: options.userId,
    conversationId: body.context?.conversationId,
    state,
  });

  return state.response;
}
