import apiClient from './client';
import type { ApiResponse, StockLevel, StockMovement, PaginatedResponse } from '../types/api';

export const getCurrentStockLevels = async (params?: {
  type?: 'RAW_GRAIN' | 'FINISHED_FLOUR';
  low_stock_only?: boolean;
  product_id?: string;
}): Promise<ApiResponse<{ stock_levels: StockLevel[]; summary: { total_raw_grains: number; total_finished_flours: number; low_stock_alerts_count: number }; as_of: string }>> => {
  const response = await apiClient.get<ApiResponse<{ stock_levels: StockLevel[]; summary: { total_raw_grains: number; total_finished_flours: number; low_stock_alerts_count: number }; as_of: string }>>('/inventory/stock-levels', { params });
  return response.data;
};

export const getStockMovementHistory = async (
  productId: string,
  params?: {
    page?: number;
    limit?: number;
    movement_type?: 'INTAKE' | 'MILLING_INPUT' | 'MILLING_OUTPUT' | 'SALE';
    start_date?: string;
    end_date?: string;
  }
): Promise<ApiResponse<PaginatedResponse<StockMovement> & { current_stock_balance: number; product: { id: string; name: string } }>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<StockMovement> & { current_stock_balance: number; product: { id: string; name: string } }>>(`/inventory/stock-movements/${productId}`, { params });
  return response.data;
};
