import httpClient from './httpClient';
import type { ProductSearchFilterRequest, ProductSearchResponse, SearchSuggestionDto } from './types';

export async function searchProducts(
  filter: ProductSearchFilterRequest,
): Promise<ProductSearchResponse> {
  const response = await httpClient.post<ProductSearchResponse>('/api/search/products', filter);
  return response.data;
}

export async function getSearchSuggestions(query: string): Promise<SearchSuggestionDto[]> {
  const response = await httpClient.get<SearchSuggestionDto[]>('/api/search/suggestions', {
    params: { q: query },
  });
  return response.data;
}
