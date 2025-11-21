import httpClient from './httpClient';
import type { PagedResult, ReviewCreateRequest, ReviewDto } from './types';

export async function getReviews(
  productId: number,
  page = 1,
  pageSize = 5,
): Promise<PagedResult<ReviewDto>> {
  const { data } = await httpClient.get<PagedResult<ReviewDto>>('/api/reviews', {
    params: {
      productId,
      page,
      pageSize,
      onlyApproved: true,
    },
  });
  return data;
}

export async function createReview(payload: ReviewCreateRequest): Promise<ReviewDto> {
  const { data } = await httpClient.post<ReviewDto>('/api/reviews', payload);
  return data;
}
