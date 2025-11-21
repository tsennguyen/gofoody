import httpClient from './httpClient';
import type { CategoryDto } from './types';

export async function getCategories(): Promise<CategoryDto[]> {
  const { data } = await httpClient.get<CategoryDto[]>('/api/categories');
  return data;
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDto> {
  const { data } = await httpClient.get<CategoryDto>(`/api/categories/${slug}`);
  return data;
}
