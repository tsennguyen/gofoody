import httpClient from './httpClient';
import type { RevenueDailyResponse, RevenueMonthlyResponse } from './types';

export async function getRevenueByDay(params: { fromDate?: string; toDate?: string } = {}): Promise<RevenueDailyResponse> {
  const response = await httpClient.get<RevenueDailyResponse>('/api/admin/dashboard/revenue-by-day', {
    params,
  });
  return response.data;
}

export async function getRevenueByMonth(params: { year?: number } = {}): Promise<RevenueMonthlyResponse> {
  const response = await httpClient.get<RevenueMonthlyResponse>('/api/admin/dashboard/revenue-by-month', {
    params,
  });
  return response.data;
}
