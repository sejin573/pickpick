import { RecommendRequest, RecommendResponse } from "@/lib/types";

import { buildAgentContext } from "./context-chain";
import { runIntentChain } from "./intent-chain";
import { runProductSearchTool } from "./product-search-tool";
import { runRecommendationChain } from "./recommendation-chain";
import { runSearchPlanChain } from "./search-plan-chain";

export async function runPickPickAgent(
  body: Partial<RecommendRequest>,
  options: { maxMessageLength: number },
): Promise<RecommendResponse> {
  const runtimeContext = buildAgentContext(body, options.maxMessageLength);
  const { analysis } = runIntentChain(runtimeContext.contextualMessage);
  const queryPlan = await runSearchPlanChain(
    runtimeContext.contextualMessage,
    analysis,
  );
  const { liveCatalog } = await runProductSearchTool(
    runtimeContext.contextualMessage,
    analysis,
    queryPlan.groups,
    runtimeContext.excludedProductIds,
  );

  return runRecommendationChain({
    message: runtimeContext.contextualMessage,
    analysis,
    queryPlanningMode: queryPlan.mode,
    liveCatalog,
  });
}
