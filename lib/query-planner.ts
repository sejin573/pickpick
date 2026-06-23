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
          requiredTerms: {
            type: "array",
            minItems: 2,
            maxItems: 8,
            items: { type: "string" },
          },
        },
        required: [
          "id",
          "title",
          "subtitle",
          "category",
          "queries",
          "requiredTerms",
        ],
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
      requiredTerms: Array.from(
        new Set(
          (group.requiredTerms ?? [])
            .map((term) => term.replace(/\s+/g, " ").trim().slice(0, 24))
            .filter(Boolean),
        ),
      ).slice(0, 8),
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
              "당신은 한국 네이버 쇼핑 검색을 위한 쿼리 플래너다. 사용자 요청을 서로 겹치지 않는 실제 구매 상품 관점 3개로 나누고 각 관점에 구체적인 상품명 검색어 2~4개를 만든다. 각 그룹의 requiredTerms에는 해당 그룹 상품의 이름 또는 네이버 카테고리에 반드시 등장해야 하는 제품 명사와 동의어를 2~8개 작성한다. 예를 들어 백색소음기 그룹은 백색소음기·화이트노이즈·사운드머신이며 공기청정기를 넣지 않는다. '건강가전 인기 상품', '프리미엄 선물', '생활용품'처럼 범위가 넓은 검색어와 핵심어는 금지한다. 각 검색어에는 발마사지기, 온열찜질기, 에어프라이어, 경량 노트북처럼 네이버 상품명에 실제로 등장할 핵심 제품 명사가 반드시 있어야 한다. 혈압계와 혈압측정기는 어떤 요청에서도 계획하거나 추천하지 않는다. 상품이 아닌 서비스·콘텐츠·의료 효능, 산업용 장비, 부품과 소모품을 제안하지 않는다. 사용자가 특정 상품 유형을 말하면 세 그룹 모두 그 목적에서 벗어나지 않게 한다. 예: '사무실 작은 식물'은 소형 생화 식물, 관리 쉬운 식물, 자동급수 화분으로 계획하고 조명·인조 식물·화분 덮개는 제외한다. '부모님 건강 선물'은 마사지기·찜질기·체성분 체중계처럼 가정용 완제품으로 계획하고 혈압계·탐지기·산업용 측정기·필터는 제외한다. 세 그룹의 category와 검색어는 가능한 한 중복되지 않아야 한다. 가격 표현은 검색어에 억지로 넣지 않는다. 제목과 부제는 짧은 한국어로 작성한다. id는 영문 소문자와 하이픈만 사용한다.",
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
        requiredTerms: Array.from(
          new Set([
            ...(group.requiredTerms ?? []),
            "식물",
            "화분",
            "다육",
            "수경재배",
          ]),
        ),
      }));
    }
    if (
      groups.length !== 3 ||
      groups.some(
        (group) =>
          group.queries.length < 2 || (group.requiredTerms?.length ?? 0) < 2,
      )
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
