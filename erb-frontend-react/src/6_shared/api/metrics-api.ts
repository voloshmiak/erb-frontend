import { apiClient } from './api-client';

export interface MatchingMetrics {
  totalDeliveredAssignments: number;
  totalEmptyRunKm: number;
  totalCostEmptyRun: number;
  totalLoadedRunKm: number;
  totalRevenue: number;
  costSavedVsNaive: number;
  naiveCost: number;
  optimizedCost: number;
  matchRate: number;
  avgEmptyRunKm: number;
  ordersMatched: number;
  ordersUnmatched: number;
}

export const metricsApi = {
  async getMetrics(): Promise<MatchingMetrics> {
    const response = await apiClient.get<MatchingMetrics>('/metrics');
    return response.data;
  },
};