import { NextResponse } from "next/server";

import { getAuthenticatedUserId } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type FeedbackBody = {
  runId?: string;
  conversationId?: string | null;
  productId?: string;
  category?: string;
  keywords?: string[];
  rating?: "like" | "dislike" | "more_like_this" | "less_like_this";
  note?: string;
};

function incrementMap(base: unknown, keys: string[]) {
  const map: Record<string, number> =
    base && typeof base === "object" && !Array.isArray(base)
      ? { ...(base as Record<string, number>) }
      : {};

  for (const key of keys.map((item) => item.trim()).filter(Boolean)) {
    map[key] = (map[key] ?? 0) + 1;
  }

  return map;
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "학습 저장소가 아직 설정되지 않았어요." },
      { status: 503 },
    );
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json()) as FeedbackBody;
  if (!body.runId || !body.rating) {
    return NextResponse.json(
      { error: "피드백 대상과 평가값이 필요합니다." },
      { status: 400 },
    );
  }

  const keywords = [
    body.category,
    ...(Array.isArray(body.keywords) ? body.keywords : []),
  ].filter((item): item is string => Boolean(item));
  const isPositive =
    body.rating === "like" || body.rating === "more_like_this";

  await supabase.from("agent_learning_events").insert({
    user_id: userId,
    conversation_id: body.conversationId ?? null,
    run_id: body.runId,
    event_type: "user_feedback",
    input_message: body.note ?? null,
    payload: {
      productId: body.productId,
      category: body.category,
      keywords,
      rating: body.rating,
      note: body.note,
    },
  });

  const previous = await supabase
    .from("user_preference_profiles")
    .select(
      "liked_categories,disliked_categories,liked_keywords,disliked_keywords,last_observations",
    )
    .eq("user_id", userId)
    .maybeSingle();
  const previousProfile = previous.data;
  const observations = [
    `${isPositive ? "선호" : "비선호"} 피드백: ${keywords.slice(0, 4).join(", ")}`,
    ...(Array.isArray(previousProfile?.last_observations)
      ? previousProfile.last_observations.filter(
          (item: unknown): item is string => typeof item === "string",
        )
      : []),
  ].slice(0, 10);

  await supabase.from("user_preference_profiles").upsert({
    user_id: userId,
    liked_categories: isPositive
      ? incrementMap(previousProfile?.liked_categories, [body.category ?? ""])
      : previousProfile?.liked_categories ?? {},
    disliked_categories: !isPositive
      ? incrementMap(previousProfile?.disliked_categories, [body.category ?? ""])
      : previousProfile?.disliked_categories ?? {},
    liked_keywords: isPositive
      ? incrementMap(previousProfile?.liked_keywords, keywords)
      : previousProfile?.liked_keywords ?? {},
    disliked_keywords: !isPositive
      ? incrementMap(previousProfile?.disliked_keywords, keywords)
      : previousProfile?.disliked_keywords ?? {},
    last_observations: observations,
    updated_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
