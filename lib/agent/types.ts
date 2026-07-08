import { CatalogResult } from "@/lib/product-provider";
import { SearchPlanGroup, UserAnalysis } from "@/lib/types";

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
