import { RecommendRequest } from "@/lib/types";

import { AgentRuntimeContext } from "./types";

const FOLLOW_UP_PATTERN =
  /다른|말고|새로운|비슷한|조금 더|다시|만원|예산|색상|가벼운|저렴|비싼|더 좋은|딴 거|다른 거/;

export function buildAgentContext(
  body: Partial<RecommendRequest>,
  maxMessageLength: number,
): AgentRuntimeContext {
  const originalMessage = body.message?.trim() ?? "";
  const contextMessages = Array.isArray(body.context?.messages)
    ? body.context.messages
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().slice(0, maxMessageLength))
        .filter(Boolean)
        .slice(-6)
    : [];

  const isFollowUp =
    contextMessages.length > 0 && FOLLOW_UP_PATTERN.test(originalMessage);

  const contextualMessage = isFollowUp
    ? `${contextMessages[0]} 이어지는 요청: ${originalMessage}. 이전 추천과 겹치지 않는 다른 상품을 추천해줘.`
    : originalMessage;

  const excludedProductIds = new Set(
    Array.isArray(body.context?.excludedProductIds)
      ? body.context.excludedProductIds
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.slice(0, 200))
          .slice(0, 100)
      : [],
  );

  return {
    originalMessage,
    contextualMessage,
    contextMessages,
    excludedProductIds,
    isFollowUp,
  };
}
