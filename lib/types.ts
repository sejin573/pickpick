export type ProductCategory =
  | "선물"
  | "전자기기"
  | "생활/자취"
  | "뷰티/패션"
  | "여행"
  | "건강"
  | "개발/업무";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  tags: string[];
  targetUsers: string[];
  situations: string[];
  strengths: string[];
  cautions: string[];
  emotionalScore: number;
  practicalScore: number;
  valueScore: number;
  riskScore: number;
  description: string;
  imageUrl?: string;
  productUrl?: string;
  mallName?: string;
  brand?: string;
  source?: "sample" | "naver" | "coupang";
  isLive?: boolean;
  popularityRank?: number;
  qualityScore?: number;
}

export interface UserAnalysis {
  intent: string;
  target: string;
  budget: string;
  budgetValue: number | null;
  occasion: string;
  preferences: string[];
  constraints: string[];
  keywords: string[];
}

export interface AgentStep {
  title: string;
  description: string;
}

export interface Recommendation {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  score: number;
  reason: string;
  pros: string[];
  cons: string[];
  fitFor: string;
  imageUrl?: string;
  productUrl?: string;
  mallName?: string;
  brand?: string;
  source?: "sample" | "naver" | "coupang";
  isLive?: boolean;
}

export interface RecommendationGroup {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  priceBand?: string;
  recommendations: Recommendation[];
}

export interface PriceBand {
  id: string;
  label: string;
  min: number;
  max: number;
}

export interface SearchPlanGroup {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  queries: string[];
}

export interface ComparisonItem {
  name: string;
  price: number;
  purposeFit: number;
  practicality: number;
  emotional: number;
  value: number;
  risk: number;
}

export interface BuyingGuide {
  bestChoice: string;
  buyNowIf: string[];
  thinkMoreIf: string[];
  checkBeforeBuying: string[];
}

export interface RecommendResponse {
  analysis: Omit<UserAnalysis, "budgetValue" | "keywords">;
  agentSteps: AgentStep[];
  recommendations: Recommendation[];
  recommendationGroups?: RecommendationGroup[];
  priceBands?: PriceBand[];
  comparison: ComparisonItem[];
  buyingGuide: BuyingGuide;
  meta?: {
    mode: "fallback" | "llm-enhanced";
    llmProvider?: "openai" | "none";
    selectionMode?: "rules" | "openai-assisted";
    catalogProvider?: "sample" | "naver" | "coupang";
    catalogLabel?: string;
    notice?: string;
    queryPlanningMode?: "rules" | "openai-assisted";
  };
}

export interface RecommendRequest {
  message: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredConversation extends ConversationSummary {
  userMessage: string;
  response: RecommendResponse;
}
