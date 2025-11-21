import httpClient from './httpClient';
import type {
  PagedResult,
  ProductAdminDetailDto,
  ProductAdminListItemDto,
  ProductAdminUpsertRequest,
} from './types';

export async function getAdminProducts(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: number;
  isActive?: boolean;
} = {}): Promise<PagedResult<ProductAdminListItemDto>> {
  const response = await httpClient.get<PagedResult<ProductAdminListItemDto>>('/api/admin/products', {
    params,
  });
  return response.data;
}

export async function getAdminProductDetail(id: number): Promise<ProductAdminDetailDto> {
  const response = await httpClient.get<ProductAdminDetailDto>(`/api/admin/products/${id}`);
  return response.data;
}

export async function createAdminProduct(
  payload: ProductAdminUpsertRequest,
): Promise<ProductAdminDetailDto> {
  const response = await httpClient.post<ProductAdminDetailDto>('/api/admin/products', payload);
  return response.data;
}

export async function updateAdminProduct(
  id: number,
  payload: ProductAdminUpsertRequest,
): Promise<ProductAdminDetailDto> {
  const response = await httpClient.put<ProductAdminDetailDto>(`/api/admin/products/${id}`, payload);
  return response.data;
}

export async function deleteAdminProduct(id: number): Promise<void> {
  await httpClient.delete(`/api/admin/products/${id}`);
}
