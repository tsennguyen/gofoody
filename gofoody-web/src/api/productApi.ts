import httpClient from './httpClient';
import type { PagedResult, ProductDetailDto, ProductListItemDto } from './types';

export interface ProductListQuery {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  categorySlug?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
  hasHaccp?: boolean;
  isSeasonal?: boolean;
  requiresColdShipping?: boolean;
  sort?: 'newest' | 'priceAsc' | 'priceDesc';
}

export async function getProducts(
  query: ProductListQuery,
): Promise<PagedResult<ProductListItemDto>> {
  const { data } = await httpClient.get<PagedResult<ProductListItemDto>>('/api/products', {
    params: query,
  });
  return data;
}

export async function getProductDetail(slug: string): Promise<ProductDetailDto> {
  const { data } = await httpClient.get<ProductDetailDto>(`/api/products/${slug}`);
  return data;
}
