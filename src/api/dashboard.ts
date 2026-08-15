import apiClient from './client';
import type { ApiResponse, DashboardStats } from '../types/api';

export const getDashboardData = async (params: {
  period: 'today' | 'yesterday' | 'this_week' | 'this_month' | 'this_year' | 'custom';
  start_date?: string;
  end_date?: string;
}): Promise<ApiResponse<DashboardStats>> => {
  const response = await apiClient.get<ApiResponse<DashboardStats>>('/reports/dashboard', { params });
  return response.data;
};
