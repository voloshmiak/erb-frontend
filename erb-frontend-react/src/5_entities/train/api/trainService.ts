import { apiClient } from '@/6_shared/api/api-client';
import type { Train } from '../model/type';

export const trainService = {
  getTrains: async (): Promise<Train[]> => {
    const res = await apiClient.get<Train[]>('/trains');
    return res.data;
  },

  getTrainById: async (id: string): Promise<Train> => {
    const res = await apiClient.get<Train>(`/trains/${id}`);
    return res.data;
  },

  createTrain: async (payload: { wagonIds: string[]; route: string[] }): Promise<Train> => {
    const res = await apiClient.post<Train>('/trains', payload);
    return res.data;
  },

  dispatchTrain: async (id: string): Promise<Train> => {
    const res = await apiClient.post<Train>(`/trains/${id}/dispatch`);
    return res.data;
  },
};
