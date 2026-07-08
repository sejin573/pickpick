import { CatalogResult } from "@/lib/product-provider";
import { RecommendResponse, SearchPlanGroup, UserAnalysis } from "@/lib/types";

export type AgentRuntimeContext = {
  originalMessage: string;
  contextualMessage: string;
  contextMessages: string[];
  excludedProductIds: Set<string>;
  isFollowUp: boolean;
};

export type IntentChainResult = {
  analysis: UserAnalysis;
};

export type SearchPlanChainResult = {
  groups: SearchPlanGroup[];
  mode: "rules" | "openai-assisted";
};

export type ProductSearchToolResult = {
  liveCatalog: CatalogResult | null;
};

export type CatalogReviewResult = {
  catalog: CatalogResult | null;
  rejectedCount: number;
  keptCount: number;
  observations: string[];
};

export type AgentActionName =
  | "contextualize_request"
  | "understand_intent"
  | "plan_search"
  | "search_products"
  | "review_catalog"
  | "compose_recommendation";

export type AgentTraceEntry = {
  action: AgentActionName;
  status: "completed" | "skipped" | "failed";
  observation: string;
  elapsedMs: number;
};

export type PickPickAgentState = {
  runId: string;
  goal: string;
  context?: AgentRuntimeContext;
  analysis?: UserAnalysis;
  queryPlan?: SearchPlanChainResult;
  liveCatalog?: CatalogResult | null;
  reviewedCatalog?: CatalogResult | null;
  catalogReview?: CatalogReviewResult;
  response?: RecommendResponse;
  trace: AgentTraceEntry[];
};
