import httpClient from './httpClient';
import type {
  ShippingMethodAdminDto,
  ShippingMethodAdminUpsertRequest,
} from './types';

export async function getAdminShippingMethods(params: { isActive?: boolean } = {}): Promise<ShippingMethodAdminDto[]> {
  const response = await httpClient.get<ShippingMethodAdminDto[]>('/api/admin/shipping-methods', { params });
  return response.data;
}

export async function getAdminShippingMethodDetail(id: number): Promise<ShippingMethodAdminDto> {
  const response = await httpClient.get<ShippingMethodAdminDto>(`/api/admin/shipping-methods/${id}`);
  return response.data;
}

export async function createAdminShippingMethod(
  payload: ShippingMethodAdminUpsertRequest,
): Promise<ShippingMethodAdminDto> {
  const response = await httpClient.post<ShippingMethodAdminDto>('/api/admin/shipping-methods', payload);
  return response.data;
}

export async function updateAdminShippingMethod(
  id: number,
  payload: ShippingMethodAdminUpsertRequest,
): Promise<ShippingMethodAdminDto> {
  const response = await httpClient.put<ShippingMethodAdminDto>(`/api/admin/shipping-methods/${id}`, payload);
  return response.data;
}

export async function deleteAdminShippingMethod(id: number): Promise<void> {
  await httpClient.delete(`/api/admin/shipping-methods/${id}`);
}
