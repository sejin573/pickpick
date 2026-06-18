import { SearchPlanGroup, UserAnalysis } from "@/lib/types";

const queryPlanSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    groups: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          subtitle: { type: "string" },
          category: { type: "string" },
          queries: {
            type: "array",
            minItems: 2,
            maxItems: 4,
            items: { type: "string" },
          },
        },
        required: ["id", "title", "subtitle", "category", "queries"],
      },
    },
  },
  required: ["groups"],
} as const;

function normalizeGroups(groups: SearchPlanGroup[]): SearchPlanGroup[] {
  return groups.slice(0, 3).map((group, index) => {
    const normalizedId =
      group.id
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "planned";

    return {
      id: `${normalizedId}-${index + 1}`,
      title: group.title.trim().slice(0, 45),
      subtitle: group.subtitle.trim().slice(0, 70),
      category: group.category.trim().slice(0, 24),
      queries: Array.from(
        new Set(
          group.queries
            .map((query) => query.replace(/\s+/g, " ").trim().slice(0, 40))
            .filter(Boolean),
        ),
      ).slice(0, 4),
    };
  });
}

export async function planSearchGroups(
  message: string,
  analysis: UserAnalysis,
  ruleGroups: SearchPlanGroup[],
): Promise<{
  groups: SearchPlanGroup[];
  mode: "rules" | "openai-assisted";
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { groups: ruleGroups, mode: "rules" };

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
        store: false,
        reasoning: { effort: "low" },
        text: {
          format: {
            type: "json_schema",
            name: "pickpick_query_plan",
            strict: true,
            schema: queryPlanSchema,
          },
          verbosity: "low",
        },
        input: [
          {
            role: "developer",
            content:
              "당신은 한국 네이버 쇼핑 검색을 위한 쿼리 플래너다. 사용자 요청을 실제로 구매 가능한 상품 관점 3개로 나누고 각 관점에 검색어 2~4개를 만든다. 상품이 아닌 서비스·콘텐츠·의료 효능을 제안하지 않는다. 사용자가 특정 상품 유형을 말하면 세 그룹 모두 그 목적에서 벗어나지 않게 한다. 예: '사무실 작은 식물'은 조명이나 수면용품이 아니라 소형 식물, 관리 쉬운 식물, 화분/관리용품으로 계획한다. 가격 표현은 검색어에 억지로 넣지 않는다. 제목과 부제는 짧은 한국어로 작성한다. id는 영문 소문자와 하이픈만 사용한다.",
          },
          {
            role: "user",
            content: JSON.stringify({
              request: message,
              analysis,
              ruleBasedDraft: ruleGroups,
            }),
          },
        ],
        max_output_tokens: 1100,
      }),
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      console.error("[query-planner] OpenAI response failed", {
        status: response.status,
      });
      return { groups: ruleGroups, mode: "rules" };
    }

    const data = (await response.json()) as {
      output?: Array<{
        content?: Array<{ type?: string; text?: string }>;
      }>;
    };
    const content = data.output
      ?.flatMap((item) => item.content ?? [])
      .find((item) => item.type === "output_text")?.text;
    if (!content) return { groups: ruleGroups, mode: "rules" };

    const parsed = JSON.parse(content) as { groups: SearchPlanGroup[] };
    let groups = normalizeGroups(parsed.groups);
    if (analysis.keywords.includes("식물/플랜테리어")) {
      groups = groups.map((group) => ({
        ...group,
        queries: group.queries.map((query) =>
          /식물|화분|플랜테리어|다육|수경재배|테라리움/.test(query)
            ? query
            : `${query} 식물`.slice(0, 40),
        ),
      }));
    }
    if (
      groups.length !== 3 ||
      groups.some((group) => group.queries.length < 2)
    ) {
      return { groups: ruleGroups, mode: "rules" };
    }

    return { groups, mode: "openai-assisted" };
  } catch (error) {
    console.error("[query-planner] planning failed", {
      message: error instanceof Error ? error.message : "unknown error",
    });
    return { groups: ruleGroups, mode: "rules" };
  }
}
