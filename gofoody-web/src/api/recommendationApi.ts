import httpClient from './httpClient';
import type { ProductRecommendationsResponse } from './types';

export async function getFrequentlyBoughtTogether(
  productId: number,
): Promise<ProductRecommendationsResponse> {
  const response = await httpClient.get<ProductRecommendationsResponse>(
    `/api/recommendations/frequently-bought-together/${productId}`,
  );
  return response.data;
}

export async function getRecommendationsForMe(): Promise<ProductRecommendationsResponse> {
  const response = await httpClient.get<ProductRecommendationsResponse>('/api/recommendations/for-me');
  return response.data;
}
