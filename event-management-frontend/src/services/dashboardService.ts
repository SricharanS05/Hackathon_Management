import api from './api';
import type { DashboardAnalytics } from '@/types';

export const dashboardService = {
  getAnalytics: async (): Promise<DashboardAnalytics> => {
    const response = await api.get<DashboardAnalytics>('/dashboard');
    return response.data;
  },
};

export default dashboardService;
