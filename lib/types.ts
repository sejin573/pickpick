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
  comparison: ComparisonItem[];
  buyingGuide: BuyingGuide;
  meta?: {
    mode: "fallback" | "llm-enhanced";
    llmProvider?: "openai" | "ollama" | "none";
    catalogProvider?: "sample" | "naver" | "coupang";
    catalogLabel?: string;
    notice?: string;
  };
}

export interface RecommendRequest {
  message: string;
}
