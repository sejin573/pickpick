import { CatalogResult, searchLiveProducts } from "@/lib/product-provider";
import { SearchPlanGroup, UserAnalysis } from "@/lib/types";

import { ProductSearchToolResult } from "./types";

function removePreviouslyRecommendedProducts(
  catalog: CatalogResult,
  excludedProductIds: Set<string>,
): CatalogResult | null {
  if (excludedProductIds.size === 0) return catalog;

  const groups = catalog.groups
    .map((group) => ({
      ...group,
      products: group.products.filter(
        (product) => !excludedProductIds.has(product.id),
      ),
    }))
    .filter((group) => group.products.length >= 3);

  if (groups.length === 0) return null;

  return {
    ...catalog,
    groups,
    products: groups.flatMap((group) => group.products),
  };
}

export async function runProductSearchTool(
  message: string,
  analysis: UserAnalysis,
  groups: SearchPlanGroup[],
  excludedProductIds: Set<string>,
): Promise<ProductSearchToolResult> {
  const liveCatalog = await searchLiveProducts(message, analysis, groups);

  return {
    liveCatalog: liveCatalog
      ? removePreviouslyRecommendedProducts(liveCatalog, excludedProductIds)
      : null,
  };
}
