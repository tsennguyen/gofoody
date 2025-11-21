import httpClient from './httpClient';
import type {
  PagedResult,
  UserAdminDetailDto,
  UserAdminListItemDto,
  UserAdminUpdateRequest,
} from './types';

export async function getAdminUsers(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  role?: string;
  isActive?: boolean;
} = {}): Promise<PagedResult<UserAdminListItemDto>> {
  const response = await httpClient.get<PagedResult<UserAdminListItemDto>>('/api/admin/users', {
    params,
  });
  return response.data;
}

export async function getAdminUserDetail(id: number): Promise<UserAdminDetailDto> {
  const response = await httpClient.get<UserAdminDetailDto>(`/api/admin/users/${id}`);
  return response.data;
}

export async function updateAdminUser(
  id: number,
  payload: UserAdminUpdateRequest,
): Promise<UserAdminDetailDto> {
  const response = await httpClient.put<UserAdminDetailDto>(`/api/admin/users/${id}`, payload);
  return response.data;
}
