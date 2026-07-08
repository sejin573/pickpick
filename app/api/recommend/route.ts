import { NextResponse } from "next/server";

import { runPickPickAgent } from "@/lib/agent/pickpick-agent";
import { getAuthenticatedUserId } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { RecommendRequest } from "@/lib/types";

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15;
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

function getClientId(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous"
  );
}

function isRateLimited(clientId: string): boolean {
  const now = Date.now();

  if (requestBuckets.size > 1_000) {
    requestBuckets.forEach((bucket, key) => {
      if (bucket.resetAt <= now) requestBuckets.delete(key);
    });
  }

  const bucket = requestBuckets.get(clientId);

  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(getClientId(request))) {
      return NextResponse.json(
        { error: "요청이 잠시 몰렸어요. 1분 뒤 다시 시도해 주세요." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as Partial<RecommendRequest>;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "추천받고 싶은 상황을 문장으로 입력해 주세요." },
        { status: 400 },
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `요청은 ${MAX_MESSAGE_LENGTH}자 이내로 입력해 주세요.` },
        { status: 400 },
      );
    }

    const auth = isSupabaseConfigured()
      ? await getAuthenticatedUserId()
      : { supabase: null, userId: null };

    const result = await runPickPickAgent(body, {
      maxMessageLength: MAX_MESSAGE_LENGTH,
      supabase: auth.supabase,
      userId: auth.userId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[recommend] request failed", {
      message: error instanceof Error ? error.message : "unknown error",
    });
    return NextResponse.json(
      { error: "요청을 처리하지 못했어요. 잠시 뒤 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
