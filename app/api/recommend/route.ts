import { NextResponse } from "next/server";

import { enhanceWithOpenAI, fallbackRecommend } from "@/lib/agent";
import { RecommendRequest } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<RecommendRequest>;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "추천받고 싶은 상황을 한 문장으로 입력해 주세요." },
        { status: 400 },
      );
    }

    const fallback = fallbackRecommend(message);
    const result = await enhanceWithOpenAI(message, fallback);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
