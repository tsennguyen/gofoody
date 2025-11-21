import httpClient from './httpClient';
import type {
  CategoryAdminDetailDto,
  CategoryAdminListItemDto,
  CategoryAdminUpsertRequest,
  PagedResult,
} from './types';

export async function getAdminCategories(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  isActive?: boolean;
} = {}): Promise<PagedResult<CategoryAdminListItemDto>> {
  const response = await httpClient.get<PagedResult<CategoryAdminListItemDto>>('/api/admin/categories', {
    params,
  });
  return response.data;
}

export async function getAdminCategoryDetail(id: number): Promise<CategoryAdminDetailDto> {
  const response = await httpClient.get<CategoryAdminDetailDto>(`/api/admin/categories/${id}`);
  return response.data;
}

export async function createAdminCategory(
  payload: CategoryAdminUpsertRequest,
): Promise<CategoryAdminDetailDto> {
  const response = await httpClient.post<CategoryAdminDetailDto>('/api/admin/categories', payload);
  return response.data;
}

export async function updateAdminCategory(
  id: number,
  payload: CategoryAdminUpsertRequest,
): Promise<CategoryAdminDetailDto> {
  const response = await httpClient.put<CategoryAdminDetailDto>(`/api/admin/categories/${id}`, payload);
  return response.data;
}

export async function deleteAdminCategory(id: number): Promise<void> {
  await httpClient.delete(`/api/admin/categories/${id}`);
}
