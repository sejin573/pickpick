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
  provider: "naver";
  label: string;
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

function buildSearchQueries(message: string, analysis: UserAnalysis): string[] {
  const explicitProductTerms = [
    "노트북", "헤드폰", "이어폰", "키보드", "모니터", "향수", "지갑",
    "마사지기", "혈압계", "캐리어", "카메라", "가습기", "에어프라이어",
    "스마트워치", "의자", "드라이어", "프로젝터",
  ].filter((keyword) => message.includes(keyword));
  if (explicitProductTerms.length) {
    return [explicitProductTerms.slice(0, 2).join(" ")];
  }

  if (message.includes("여자친구") || message.includes("여친")) {
    return [
      "여성 프리미엄 향수",
      "여성 주얼리 목걸이",
      "여성 가죽 가방",
      "프리미엄 뷰티기기",
    ];
  }
  if (message.includes("남자친구") || message.includes("남친")) {
    return [
      "남성 프리미엄 향수",
      "남성 가죽 지갑",
      "노이즈캔슬링 헤드폰",
      "남성 스마트워치",
    ];
  }
  if (analysis.keywords.includes("부모님")) {
    return [
      "부모님 건강 선물",
      "프리미엄 마사지기",
      "스마트 혈압계",
      "건강관리 스마트워치",
    ];
  }

  const usefulKeywords = analysis.keywords.filter((keyword) =>
    ["여행", "건강", "뷰티", "개발", "자취"].includes(keyword),
  );
  if (usefulKeywords.length) {
    return [`${usefulKeywords.slice(0, 2).join(" ")} 추천 상품`];
  }

  const target = ["여자친구", "남자친구", "부모님", "친구"].find((keyword) =>
    message.includes(keyword),
  );
  if (target) return [`${target} ${analysis.occasion} 선물`];

  return [message
    .replace(/\d+(?:\.\d+)?\s*(?:만원|원|억)/g, "")
    .replace(/추천(?:해줘|해주세요)?/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60)];
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
  if (message.match(/\d+(?:\.\d+)?\s*만원대/)) {
    return price >= budget * 0.5 && price <= budget * 1.5;
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

  const queries = buildSearchQueries(message, analysis).filter(Boolean);
  if (!queries.length) return null;

  try {
    const responses = await Promise.all(
      queries.map(async (query) => {
        const params = new URLSearchParams({
          query,
          display: "20",
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
        return (data.items ?? []).map((item) => ({ item, query }));
      }),
    );

    const seen = new Set<string>();
    const products = responses
      .flat()
      .filter(({ item }) => !isLowQualityItem(item))
      .filter(({ item }) => isInBudgetRange(item, message, analysis.budgetValue))
      .filter(({ item }) => {
        const key = item.productId || `${stripHtml(item.title)}-${item.lprice}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(({ item, query }) => mapNaverItem(item, query))
      .filter((product) => product.price > 0 && product.productUrl);

    return products.length >= 3
      ? { products, provider: "naver", label: "네이버 쇼핑 실시간 상품" }
      : null;
  } catch {
    return null;
  }
}
