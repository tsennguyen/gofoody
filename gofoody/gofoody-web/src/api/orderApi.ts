import httpClient from './httpClient';
import type {
  ShippingMethodDto,
  PaymentMethodDto,
  CheckoutRequest,
  OrderCreatedDto,
  PagedResult,
  OrderListItemDto,
  OrderDetailDto,
  OrderStatsDto,
  OrderStatusUpdateRequest,
  OrderStatus,
  PaymentStatus,
} from './types';

const statusMap: Record<OrderStatus, number> = {
  Pending: 0,
  Confirmed: 1,
  Shipping: 2,
  Completed: 3,
  Cancelled: 4,
};

const paymentStatusMap: Record<PaymentStatus, number> = {
  Unpaid: 0,
  Paid: 1,
  Refunded: 2,
};

const statusReverseMap: Record<number, OrderStatus> = {
  0: 'Pending',
  1: 'Confirmed',
  2: 'Shipping',
  3: 'Completed',
  4: 'Cancelled',
};

const paymentStatusReverseMap: Record<number, PaymentStatus> = {
  0: 'Unpaid',
  1: 'Paid',
  2: 'Refunded',
};

const normalizeStatus = (value: number | OrderStatus): OrderStatus =>
  typeof value === 'number' ? statusReverseMap[value] ?? 'Pending' : value;

const normalizePaymentStatus = (value: number | PaymentStatus): PaymentStatus =>
  typeof value === 'number' ? paymentStatusReverseMap[value] ?? 'Unpaid' : value;

const normalizeOrderListItem = (item: OrderListItemDto): OrderListItemDto => ({
  ...item,
  status: normalizeStatus(item.status as any),
  paymentStatus: normalizePaymentStatus(item.paymentStatus as any),
});

const normalizeOrderDetail = (order: OrderDetailDto): OrderDetailDto => ({
  ...order,
  status: normalizeStatus(order.status as any),
  paymentStatus: normalizePaymentStatus(order.paymentStatus as any),
});

export async function getShippingMethods(): Promise<ShippingMethodDto[]> {
  const response = await httpClient.get<ShippingMethodDto[]>('/api/shipping-methods');
  return response.data;
}

export async function getPaymentMethods(): Promise<PaymentMethodDto[]> {
  const response = await httpClient.get<PaymentMethodDto[]>('/api/payment-methods');
  return response.data;
}

export async function checkout(payload: CheckoutRequest): Promise<OrderCreatedDto> {
  const response = await httpClient.post<OrderCreatedDto>('/api/orders/checkout', payload);
  return response.data;
}

export interface MyOrdersQuery {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
}

export async function getMyOrders(query: MyOrdersQuery = {}): Promise<PagedResult<OrderListItemDto>> {
  const response = await httpClient.get<PagedResult<OrderListItemDto>>('/api/orders/my', {
    params: {
      ...query,
      status: query.status ? statusMap[query.status] : undefined,
    },
  });
  const data = response.data;
  return {
    ...data,
    items: data.items.map(normalizeOrderListItem),
  };
}

export async function getMyOrderDetail(orderCode: string): Promise<OrderDetailDto> {
  const response = await httpClient.get<OrderDetailDto>(`/api/orders/my/${orderCode}`);
  return normalizeOrderDetail(response.data);
}

export interface AdminOrdersQuery {
  userId?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
  orderCode?: string;
  page?: number;
  pageSize?: number;
}

export async function getAdminOrders(query: AdminOrdersQuery = {}): Promise<PagedResult<OrderListItemDto>> {
  const response = await httpClient.get<PagedResult<OrderListItemDto>>('/api/admin/orders', {
    params: {
      ...query,
      status: query.status ? statusMap[query.status] : undefined,
      paymentStatus: query.paymentStatus ? paymentStatusMap[query.paymentStatus] : undefined,
    },
  });
  const data = response.data;
  return {
    ...data,
    items: data.items.map(normalizeOrderListItem),
  };
}

export async function getAdminOrderDetail(orderId: number): Promise<OrderDetailDto> {
  const response = await httpClient.get<OrderDetailDto>(`/api/admin/orders/${orderId}`);
  return normalizeOrderDetail(response.data);
}

export async function updateOrderStatus(
  orderId: number,
  payload: OrderStatusUpdateRequest,
): Promise<OrderDetailDto> {
  const response = await httpClient.put<OrderDetailDto>(`/api/admin/orders/${orderId}/status`, {
    status: statusMap[payload.status],
    paymentStatus: payload.paymentStatus ? paymentStatusMap[payload.paymentStatus] : undefined,
  });
  return normalizeOrderDetail(response.data);
}

export async function getOrderStats(fromDate?: string, toDate?: string): Promise<OrderStatsDto> {
  const response = await httpClient.get<OrderStatsDto>('/api/admin/orders/stats', {
    params: { fromDate, toDate },
  });
  return response.data;
}
