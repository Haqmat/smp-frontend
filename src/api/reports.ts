import apiClient from './client';
import type { ApiResponse } from '../types/api';

export const getAnnualSalesReport = async (params: {
  fiscal_year: number;
  format?: 'json' | 'pdf' | 'excel';
  include_voided?: boolean;
}): Promise<ApiResponse<any>> => {
  const response = await apiClient.get<ApiResponse<any>>('/reports/annual-sales', { params });
  return response.data;
};

export const getProfitLossReport = async (params: {
  fiscal_year: number;
  format?: 'json' | 'pdf' | 'excel';
}): Promise<ApiResponse<any>> => {
  const response = await apiClient.get<ApiResponse<any>>('/reports/profit-loss', { params });
  return response.data;
};

export const exportReport = async (
  reportType: 'annual-sales' | 'profit-loss' | 'expense-summary',
  params: {
    fiscal_year: number;
    format: 'pdf' | 'excel';
  }
): Promise<Blob> => {
  const response = await apiClient.get(`/reports/export/${reportType}`, {
    params,
    responseType: 'blob',
  });
  return response.data;
};
