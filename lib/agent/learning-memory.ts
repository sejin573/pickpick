import { SupabaseClient } from "@supabase/supabase-js";

import { RecommendResponse, UserAnalysis } from "@/lib/types";

import { PickPickAgentState } from "./types";

export type LearningMemory = {
  likedCategories: string[];
  dislikedCategories: string[];
  likedKeywords: string[];
  dislikedKeywords: string[];
  preferredPriceMin: number | null;
  preferredPriceMax: number | null;
  observations: string[];
};

const EMPTY_MEMORY: LearningMemory = {
  likedCategories: [],
  dislikedCategories: [],
  likedKeywords: [],
  dislikedKeywords: [],
  preferredPriceMin: null,
  preferredPriceMax: null,
  observations: [],
};

type CountMap = Record<string, number>;

function topKeys(value: unknown, limit = 8): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];

  return Object.entries(value as CountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}

function incrementMap(base: unknown, keys: string[]): CountMap {
  const map: CountMap =
    base && typeof base === "object" && !Array.isArray(base)
      ? { ...(base as CountMap) }
      : {};

  for (const key of keys.map((item) => item.trim()).filter(Boolean)) {
    map[key] = (map[key] ?? 0) + 1;
  }

  return map;
}

export async function loadLearningMemory(input: {
  supabase?: SupabaseClient | null;
  userId?: string | null;
}): Promise<LearningMemory> {
  const { supabase, userId } = input;
  if (!supabase || !userId) return EMPTY_MEMORY;

  const { data, error } = await supabase
    .from("user_preference_profiles")
    .select(
      "liked_categories,disliked_categories,liked_keywords,disliked_keywords,preferred_price_min,preferred_price_max,last_observations",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return EMPTY_MEMORY;

  return {
    likedCategories: topKeys(data.liked_categories),
    dislikedCategories: topKeys(data.disliked_categories),
    likedKeywords: topKeys(data.liked_keywords),
    dislikedKeywords: topKeys(data.disliked_keywords),
    preferredPriceMin: data.preferred_price_min ?? null,
    preferredPriceMax: data.preferred_price_max ?? null,
    observations: Array.isArray(data.last_observations)
      ? data.last_observations.filter(
          (item: unknown): item is string => typeof item === "string",
        )
      : [],
  };
}

function summarizeRunForLearning(
  analysis: UserAnalysis,
  response: RecommendResponse,
): {
  categories: string[];
  keywords: string[];
  prices: number[];
  observations: string[];
} {
  const recommendations = response.recommendationGroups?.length
    ? response.recommendationGroups.flatMap((group) => group.recommendations)
    : response.recommendations;

  const categories = Array.from(
    new Set(
      recommendations
        .map((item) => item.category)
        .filter(Boolean)
        .map((item) => String(item)),
    ),
  );
  const keywords = Array.from(
    new Set([
      ...analysis.keywords,
      ...analysis.preferences,
      analysis.occasion,
      analysis.target,
    ]),
  ).slice(0, 12);
  const prices = recommendations
    .map((item) => item.price)
    .filter((price) => Number.isFinite(price) && price > 0);
  const observations = [
    `최근 요청: ${analysis.occasion} / ${analysis.budget}`,
    categories.length ? `최근 추천 카테고리: ${categories.slice(0, 4).join(", ")}` : "",
  ].filter(Boolean);

  return { categories, keywords, prices, observations };
}

export async function persistAgentLearning(input: {
  supabase?: SupabaseClient | null;
  userId?: string | null;
  conversationId?: string | null;
  state: PickPickAgentState;
}) {
  const { supabase, userId, conversationId, state } = input;
  if (!supabase || !userId || !state.analysis || !state.response) return;

  const learned = summarizeRunForLearning(state.analysis, state.response);
  const previous = await supabase
    .from("user_preference_profiles")
    .select(
      "liked_categories,liked_keywords,preferred_price_min,preferred_price_max,last_observations",
    )
    .eq("user_id", userId)
    .maybeSingle();

  const previousProfile = previous.data;
  const priceMin = learned.prices.length
    ? Math.min(...learned.prices)
    : previousProfile?.preferred_price_min ?? null;
  const priceMax = learned.prices.length
    ? Math.max(...learned.prices)
    : previousProfile?.preferred_price_max ?? null;
  const observations = [
    ...learned.observations,
    ...(Array.isArray(previousProfile?.last_observations)
      ? previousProfile.last_observations.filter(
          (item: unknown): item is string => typeof item === "string",
        )
      : []),
  ].slice(0, 10);

  await supabase.from("agent_learning_events").insert({
    user_id: userId,
    conversation_id: conversationId ?? null,
    run_id: state.runId,
    event_type: "agent_run",
    input_message: state.context?.originalMessage ?? state.goal,
    payload: {
      goal: state.goal,
      contextualMessage: state.context?.contextualMessage,
      analysis: state.analysis,
      trace: state.trace,
      catalogReview: state.catalogReview,
      recommendationIds: state.response.recommendations.map((item) => item.id),
      recommendationGroups: state.response.recommendationGroups?.map((group) => ({
        id: group.id,
        priceBand: group.priceBand,
        recommendationIds: group.recommendations.map((item) => item.id),
      })),
    },
  });

  await supabase.from("user_preference_profiles").upsert({
    user_id: userId,
    liked_categories: incrementMap(
      previousProfile?.liked_categories,
      learned.categories,
    ),
    liked_keywords: incrementMap(previousProfile?.liked_keywords, learned.keywords),
    preferred_price_min: priceMin,
    preferred_price_max: priceMax,
    last_observations: observations,
    updated_at: new Date().toISOString(),
  });
}
