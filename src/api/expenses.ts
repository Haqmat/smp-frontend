import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Expense, CreateExpenseRequest } from '../types/api';

export const recordExpense = async (data: CreateExpenseRequest): Promise<ApiResponse<Expense>> => {
  const response = await apiClient.post<ApiResponse<Expense>>('/expenses', data);
  return response.data;
};

export const listExpenses = async (params: {
  page?: number;
  limit?: number;
  category?: 'TRANSPORT' | 'SALARY' | 'UTILITY' | 'OTHER';
  start_date?: string;
  end_date?: string;
  linked_type?: 'grain_intake' | 'sale';
  min_amount?: number;
  max_amount?: number;
}): Promise<ApiResponse<PaginatedResponse<Expense> & { category_summary: Record<string, number>; total_expenses: number }>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Expense> & { category_summary: Record<string, number>; total_expenses: number }>>('/expenses', { params });
  return response.data;
};

export const getExpenseDetails = async (expenseId: string): Promise<ApiResponse<Expense>> => {
  const response = await apiClient.get<ApiResponse<Expense>>(`/expenses/${expenseId}`);
  return response.data;
};
