import { Product, ProductCategory, UserAnalysis } from "@/lib/types";

type NaverShoppingItem = {
  title: string;
  link: string;
  image: string;
  lprice: string;
  mallName: string;
  maker: string;
  brand: string;
  category1: string;
  category2: string;
  category3: string;
  category4: string;
  productId: string;
};

type NaverShoppingResponse = {
  items?: NaverShoppingItem[];
};

export type CatalogResult = {
  products: Product[];
  groups: Array<{
    id: string;
    title: string;
    subtitle: string;
    category: string;
    products: Product[];
  }>;
  provider: "naver";
  label: string;
};

type SearchGroup = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  queries: string[];
};

const categoryKeywords: Array<[ProductCategory, string[]]> = [
  ["개발/업무", ["노트북", "개발", "코딩", "업무", "키보드", "모니터"]],
  ["건강", ["건강", "부모님", "마사지", "운동", "수면"]],
  ["여행", ["여행", "캐리어", "캠핑", "출장"]],
  ["뷰티/패션", ["뷰티", "향수", "패션", "피부", "헤어"]],
  ["생활/자취", ["자취", "집들이", "생활", "주방", "수납"]],
  ["전자기기", ["전자", "헤드폰", "스마트", "카메라", "가전"]],
];

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .trim();
}

function inferCategory(text: string): ProductCategory {
  const match = categoryKeywords.find(([, keywords]) =>
    keywords.some((keyword) => text.includes(keyword)),
  );
  return match?.[0] ?? "선물";
}

function buildSearchGroups(message: string, analysis: UserAnalysis): SearchGroup[] {
  const explicitProductTerms = [
    "노트북", "헤드폰", "이어폰", "키보드", "모니터", "향수", "지갑",
    "마사지기", "혈압계", "캐리어", "카메라", "가습기", "에어프라이어",
    "스마트워치", "의자", "드라이어", "프로젝터",
  ].filter((keyword) => message.includes(keyword));
  if (explicitProductTerms.length) {
    const query = explicitProductTerms.slice(0, 2).join(" ");
    return [{
      id: "direct-match",
      title: `${query} 추천`,
      subtitle: "요청한 제품군에서 조건에 가장 가까운 상품이에요.",
      category: inferCategory(query),
      queries: [query],
    }];
  }

  if (message.includes("여자친구") || message.includes("여친")) {
    return [
      {
        id: "beauty-fashion",
        title: "뷰티·패션으로 마음을 전하는 선물",
        subtitle: "취향을 담기 좋고 생일 선물다운 특별함이 큰 선택이에요.",
        category: "뷰티/패션",
        queries: ["14K 여성 목걸이", "여성 가죽 가방", "프리미엄 여성 향수"],
      },
      {
        id: "smart-device",
        title: "매일 쓰는 프리미엄 디바이스",
        subtitle: "기억에 남는 감성과 꾸준히 쓰는 실용성을 함께 잡았어요.",
        category: "전자기기",
        queries: ["다이슨 에어랩", "애플워치 여성", "노이즈캔슬링 헤드폰"],
      },
      {
        id: "lifestyle",
        title: "취향을 넓혀주는 라이프스타일 선물",
        subtitle: "데이트와 일상에서 새로운 경험을 만들어 주는 상품이에요.",
        category: "선물/라이프",
        queries: ["휴대용 빔프로젝터", "포토 프린터", "프리미엄 커피머신"],
      },
    ];
  }
  if (message.includes("남자친구") || message.includes("남친")) {
    return [
      {
        id: "fashion",
        title: "센스 있는 패션 선물",
        subtitle: "매일 사용할 수 있으면서 선물의 인상도 분명한 선택이에요.",
        category: "뷰티/패션",
        queries: ["남성 프리미엄 향수", "남성 가죽 지갑"],
      },
      {
        id: "device",
        title: "취향을 업그레이드하는 디바이스",
        subtitle: "음악과 건강 관리 등 일상의 만족도를 높여줘요.",
        category: "전자기기",
        queries: ["노이즈캔슬링 헤드폰", "남성 스마트워치"],
      },
    ];
  }
  if (analysis.keywords.includes("부모님")) {
    return [
      {
        id: "health",
        title: "매일 챙기는 건강 선물",
        subtitle: "부담 없이 꾸준히 활용할 수 있는 건강 관리 상품이에요.",
        category: "건강",
        queries: ["프리미엄 마사지기", "스마트 혈압계"],
      },
      {
        id: "smart-health",
        title: "편리한 스마트 건강 기기",
        subtitle: "건강 기록과 생활 편의를 함께 챙길 수 있어요.",
        category: "전자기기",
        queries: ["건강관리 스마트워치", "수면 케어 기기"],
      },
    ];
  }

  const usefulKeywords = analysis.keywords.filter((keyword) =>
    ["여행", "건강", "뷰티", "개발", "자취"].includes(keyword),
  );
  if (usefulKeywords.length) {
    const query = `${usefulKeywords.slice(0, 2).join(" ")} 추천 상품`;
    return [{
      id: "context-match",
      title: "상황 맞춤 추천",
      subtitle: "입력한 목적과 활용도를 중심으로 골랐어요.",
      category: inferCategory(query),
      queries: [query],
    }];
  }

  const target = ["여자친구", "남자친구", "부모님", "친구"].find((keyword) =>
    message.includes(keyword),
  );
  if (target) {
    return [{
      id: "gift-match",
      title: `${target}을 위한 선물`,
      subtitle: `${analysis.occasion}에 잘 어울리는 상품을 모았어요.`,
      category: "선물",
      queries: [`${target} ${analysis.occasion} 선물`],
    }];
  }

  const query = message
    .replace(/\d+(?:\.\d+)?\s*(?:만원|원|억)/g, "")
    .replace(/추천(?:해줘|해주세요)?/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
  return [{
    id: "general",
    title: "PickPick 추천",
    subtitle: "입력한 상황과 예산을 함께 고려했어요.",
    category: "추천",
    queries: [query],
  }];
}

function isLowQualityItem(item: NaverShoppingItem): boolean {
  const text = stripHtml(`${item.title} ${item.mallName}`).toLowerCase();
  return [
    "렌탈", "대여", "중고", "리퍼", "해외직구", "구매대행", "도서",
    "강의", "교육", "학원", "부품", "케이스", "보호필름",
    "이벤트용품", "파티용품", "촛불", "캔들 숫자", "케이크 토퍼",
    "현수막", "풍선", "프로포즈 용품", "답프로포즈", "용돈박스",
    "포장지", "쇼핑백", "스티커", "엽서",
  ].some((keyword) => text.includes(keyword));
}

function isInBudgetRange(
  item: NaverShoppingItem,
  message: string,
  budget: number | null,
): boolean {
  if (!budget) return true;
  const price = Number(item.lprice);
  if (!price) return false;

  if (message.includes("이하")) return price <= budget && price >= budget * 0.15;
  const priceBand = message.match(/(\d+)\s*만원대/);
  if (priceBand) {
    const amount = priceBand[1];
    const bandSize = 10 ** Math.max(0, amount.length - 1) * 10000;
    return price >= budget && price < budget + bandSize;
  }
  return price >= budget * 0.3 && price <= budget * 1.35;
}

function mapNaverItem(item: NaverShoppingItem, query: string): Product {
  const name = stripHtml(item.title);
  const categoryText = [
    item.category1,
    item.category2,
    item.category3,
    item.category4,
    query,
  ].join(" ");
  const category = inferCategory(categoryText);
  const mallName = stripHtml(item.mallName || "네이버 쇼핑");
  const brand = stripHtml(item.brand || item.maker || "");

  return {
    id: `naver-${item.productId || encodeURIComponent(name)}`,
    name,
    category,
    price: Number(item.lprice) || 0,
    tags: [query, category, brand, mallName].filter(Boolean),
    targetUsers: ["온라인 쇼핑 사용자"],
    situations: [query, "실시간 상품 탐색"],
    strengths: ["현재 판매 중인 상품 정보", `${mallName} 판매 페이지로 바로 이동`],
    cautions: ["판매처에서 최종 가격과 재고 확인", "옵션에 따라 가격이 달라질 수 있음"],
    emotionalScore: category === "선물" || category === "뷰티/패션" ? 84 : 72,
    practicalScore: ["전자기기", "생활/자취", "개발/업무"].includes(category) ? 90 : 80,
    valueScore: 82,
    riskScore: 24,
    description: `${mallName}에서 판매 중인 ${brand ? `${brand} ` : ""}${category} 상품`,
    imageUrl: item.image,
    productUrl: item.link,
    mallName,
    brand: brand || undefined,
    source: "naver",
    isLive: true,
  };
}

export async function searchLiveProducts(
  message: string,
  analysis: UserAnalysis,
): Promise<CatalogResult | null> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const searchGroups = buildSearchGroups(message, analysis);
  if (!searchGroups.length) return null;

  try {
    const responses = await Promise.all(
      searchGroups.flatMap((group) => group.queries.map(async (query) => {
        const params = new URLSearchParams({
          query,
          display: "100",
          start: "1",
          sort: "sim",
          exclude: "used:rental:cbshop",
        });
        const response = await fetch(
          `https://openapi.naver.com/v1/search/shop.json?${params.toString()}`,
          {
            headers: {
              "X-Naver-Client-Id": clientId,
              "X-Naver-Client-Secret": clientSecret,
            },
            signal: AbortSignal.timeout(6000),
            next: { revalidate: 900 },
          },
        );
        if (!response.ok) return [];
        const data = (await response.json()) as NaverShoppingResponse;
        return (data.items ?? []).map((item) => ({ item, query, groupId: group.id }));
      })),
    );

    const seen = new Set<string>();
    const mapped = responses
      .flat()
      .filter(({ item }) => !isLowQualityItem(item))
      .filter(({ item }) => isInBudgetRange(item, message, analysis.budgetValue))
      .filter(({ item }) => {
        const key = item.productId || `${stripHtml(item.title)}-${item.lprice}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(({ item, query, groupId }) => ({
        product: mapNaverItem(item, query),
        groupId,
      }))
      .filter(({ product }) => product.price > 0 && product.productUrl);

    const groups = searchGroups
      .map((group) => ({
        ...group,
        products: mapped
          .filter((entry) => entry.groupId === group.id)
          .map((entry) => entry.product),
      }))
      .filter((group) => group.products.length >= 3);

    const products = groups
      .flatMap((group) => group.products)
      .filter((product) => product.price > 0 && product.productUrl);

    return groups.length
      ? { products, groups, provider: "naver", label: "네이버 쇼핑 실시간 상품" }
      : null;
  } catch {
    return null;
  }
}
