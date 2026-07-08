import { buildSearchGroups } from "@/lib/product-provider";
import { planSearchGroups } from "@/lib/query-planner";
import { UserAnalysis } from "@/lib/types";

import { SearchPlanChainResult } from "./types";

export async function runSearchPlanChain(
  message: string,
  analysis: UserAnalysis,
): Promise<SearchPlanChainResult> {
  return planSearchGroups(
    message,
    analysis,
    buildSearchGroups(message, analysis),
  );
}
