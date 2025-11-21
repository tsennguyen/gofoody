import httpClient from './httpClient';
import type {
  CartSummaryDto,
  CartItemAddRequest,
  CartItemUpdateRequest,
} from './types';

export async function getCart(): Promise<CartSummaryDto> {
  const response = await httpClient.get<CartSummaryDto>('/api/cart');
  return response.data;
}

export async function addToCart(payload: CartItemAddRequest): Promise<CartSummaryDto> {
  const response = await httpClient.post<CartSummaryDto>('/api/cart/items', payload);
  return response.data;
}

export async function updateCartItem(
  itemId: number,
  payload: CartItemUpdateRequest,
): Promise<CartSummaryDto> {
  const response = await httpClient.put<CartSummaryDto>(`/api/cart/items/${itemId}`, payload);
  return response.data;
}

export async function removeCartItem(itemId: number): Promise<CartSummaryDto> {
  const response = await httpClient.delete<CartSummaryDto>(`/api/cart/items/${itemId}`);
  return response.data;
}

export async function clearCart(): Promise<CartSummaryDto> {
  const response = await httpClient.delete<CartSummaryDto>('/api/cart');
  return response.data;
}
