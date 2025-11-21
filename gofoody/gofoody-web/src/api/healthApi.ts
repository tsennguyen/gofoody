import { httpClient } from './httpClient';

export interface HealthResponse {
  status: string;
  time: string;
  db: string;
}

// Gọi GET /api/health
export const getHealth = async (): Promise<HealthResponse> => {
  const { data } = await httpClient.get<HealthResponse>('/api/health');
  return data;
};
