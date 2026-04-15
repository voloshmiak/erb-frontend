import { apiClient } from '@/6_shared/api/api-client';
import type { Locomotive } from '../model/type';

export const locomotiveApi = {
  getLocomotives: async (): Promise<Locomotive[]> => {
    const res = await apiClient.get<Locomotive[]>('/locomotives');
    return res.data;
  },

  getLocomotiveById: async (id: string): Promise<Locomotive> => {
    const res = await apiClient.get<Locomotive>(`/locomotives/${id}`);
    return res.data;
  },
};
