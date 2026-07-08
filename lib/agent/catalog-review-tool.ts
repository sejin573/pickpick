import { CatalogResult } from "@/lib/product-provider";
import { Product } from "@/lib/types";

import { LearningMemory } from "./learning-memory";
import { CatalogReviewResult } from "./types";

const BLOCKED_PRODUCT_TERMS = [
  "혈압",
  "혈압계",
  "혈당",
  "혈당계",
  "의료기",
  "건강기능식품",
  "영양제",
  "중고",
  "리퍼",
  "부품",
  "케이스",
  "필름",
  "교체용",
  "호환",
  "대여",
  "렌탈",
];

function productText(product: Product): string {
  return [
    product.name,
    product.category,
    product.brand,
    product.mallName,
    product.description,
    ...product.tags,
    ...product.situations,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isBlocked(product: Product, memory: LearningMemory): boolean {
  const text = productText(product);

  if (BLOCKED_PRODUCT_TERMS.some((term) => text.includes(term))) {
    return true;
  }

  if (
    memory.dislikedCategories.some((category) =>
      text.includes(category.toLowerCase()),
    )
  ) {
    return true;
  }

  if (
    memory.dislikedKeywords.some((keyword) =>
      text.includes(keyword.toLowerCase()),
    )
  ) {
    return true;
  }

  return false;
}

function applyMemoryBoost(product: Product, memory: LearningMemory): Product {
  const text = productText(product);
  const likedCategoryMatch = memory.likedCategories.some((category) =>
    text.includes(category.toLowerCase()),
  );
  const likedKeywordMatch = memory.likedKeywords.some((keyword) =>
    text.includes(keyword.toLowerCase()),
  );

  if (!likedCategoryMatch && !likedKeywordMatch) return product;

  return {
    ...product,
    qualityScore:
      (product.qualityScore ?? 0) + (likedCategoryMatch ? 4 : 0) + (likedKeywordMatch ? 3 : 0),
    tags: Array.from(new Set([...product.tags, "learned-preference-match"])),
  };
}

export function reviewCatalogWithAgent(input: {
  catalog: CatalogResult | null;
  memory: LearningMemory;
}): CatalogReviewResult {
  const { catalog, memory } = input;
  if (!catalog) {
    return {
      catalog: null,
      rejectedCount: 0,
      keptCount: 0,
      observations: ["실시간 상품 카탈로그가 없어 샘플 추천 흐름으로 전환"],
    };
  }

  let rejectedCount = 0;
  const reviewedGroups = catalog.groups
    .map((group) => {
      const reviewedProducts = group.products
        .filter((product) => {
          const blocked = isBlocked(product, memory);
          if (blocked) rejectedCount += 1;
          return !blocked;
        })
        .map((product) => applyMemoryBoost(product, memory));

      return {
        ...group,
        products:
          reviewedProducts.length >= 3 ? reviewedProducts : group.products,
      };
    })
    .filter((group) => group.products.length >= 3);

  const reviewedCatalog =
    reviewedGroups.length > 0
      ? {
          ...catalog,
          groups: reviewedGroups,
          products: reviewedGroups.flatMap((group) => group.products),
        }
      : catalog;

  const keptCount = reviewedCatalog.products.length;

  return {
    catalog: reviewedCatalog,
    rejectedCount,
    keptCount,
    observations: [
      rejectedCount > 0
        ? `부적합하거나 선호와 맞지 않는 상품 ${rejectedCount}개 제외`
        : "상품 품질 검사에서 제외할 항목 없음",
      memory.likedCategories.length > 0 || memory.likedKeywords.length > 0
        ? "누적 선호 프로필을 상품 점수에 반영"
        : "아직 누적 선호가 적어 기본 품질 기준 사용",
    ],
  };
}
