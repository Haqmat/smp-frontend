// ===== Common Types =====
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next_page: boolean;
    has_previous_page: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    message_am?: string;
    details?: Array<{ field: string; message: string }>;
    timestamp: string;
    request_id: string;
  };
}

// ===== Auth Types =====
export interface LoginRequest {
  username?: string;
  phone?: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// ===== User Types =====
export interface User {
  id: string;
  username: string;
  full_name: string;
  role: 'ADMIN' | 'SALES' | 'MANAGER' | 'AUDITOR';
  email?: string;
  phone?: string;
  is_active: boolean;
  is_first_login?: boolean;
  last_login?: string;
  created_at: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  full_name: string;
  role: 'ADMIN' | 'SALES' | 'MANAGER' | 'AUDITOR';
  email?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  role?: 'ADMIN' | 'SALES' | 'MANAGER' | 'AUDITOR';
  is_active?: boolean;
  password?: string;
}

// ===== Product Types =====
export interface Product {
  id: string;
  name: string;
  name_en?: string;
  type: 'RAW_GRAIN' | 'FINISHED_FLOUR';
  unit_of_measure: string;
  default_unit_price?: number;
  category?: string;
  is_active: boolean;
  current_stock_level?: number;
  low_stock_threshold?: number;
  created_at: string;
}

export interface CreateProductRequest {
  name: string;
  name_en?: string;
  type: 'RAW_GRAIN' | 'FINISHED_FLOUR';
  unit_of_measure: string;
  default_unit_price?: number;
  category?: string;
  low_stock_threshold?: number;
}

export interface UpdateProductRequest {
  default_unit_price?: number;
  low_stock_threshold?: number;
  is_active?: boolean;
}

// ===== Config Types =====
export interface SystemConfig {
  vat_percentage: number;
  fiscal_year_start: string;
  fiscal_year_end: string;
  company_name: string;
  company_tin: string;
  company_address: string;
  default_currency: string;
  low_stock_alert_enabled: boolean;
  auto_logout_minutes: number;
}

export interface UpdateConfigRequest {
  vat_percentage?: number;
  fiscal_year_start?: string;
  fiscal_year_end?: string;
  auto_logout_minutes?: number;
  low_stock_alert_enabled?: boolean;
}

// ===== Grain Intake Types =====
export interface GrainIntakeLineItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface CreateGrainIntakeRequest {
  supplier_name: string;
  supplier_tin?: string;
  intake_date_ethiopian: string;
  receipt_number: string;
  notes?: string;
  line_items: GrainIntakeLineItem[];
}

export interface GrainIntakeBatch {
  id: string;
  receipt_number: string;
  supplier_name: string;
  supplier_tin?: string;
  intake_date_ethiopian: string;
  intake_date_gregorian: string;
  notes?: string;
  line_items: Array<{
    id: string;
    product: {
      id: string;
      name: string;
    };
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
  total_quantity: number;
  total_cost: number;
  linked_expenses?: Expense[];
  created_by: {
    id: string;
    username: string;
    full_name?: string;
  };
  created_at: string;
}

// ===== Milling Types =====
export interface MillingOutput {
  output_product_id: string;
  output_quantity: number;
}

export interface CreateMillingRequest {
  milling_date_ethiopian: string;
  input_product_id: string;
  input_quantity: number;
  notes?: string;
  outputs: MillingOutput[];
}

export interface MillingSession {
  id: string;
  milling_date_ethiopian: string;
  milling_date_gregorian: string;
  input: {
    product: {
      id: string;
      name: string;
    };
    quantity_used: number;
    cost_allocation: number;
  };
  outputs: Array<{
    product: {
      id: string;
      name: string;
    };
    quantity_produced: number;
    extraction_rate: string;
  }>;
  total_output_quantity: number;
  loss_quantity: number;
  loss_percentage: string;
  notes?: string;
  created_by: {
    id: string;
    username: string;
  };
  created_at: string;
}

// ===== Stock Types =====
export interface StockLevel {
  product_id: string;
  product_name: string;
  product_type: 'RAW_GRAIN' | 'FINISHED_FLOUR';
  unit_of_measure: string;
  current_stock: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
  last_updated: string;
}

export interface StockMovement {
  id: number;
  movement_type: 'INTAKE' | 'MILLING_INPUT' | 'MILLING_OUTPUT' | 'SALE';
  quantity_change: number;
  reference_type: string;
  reference_id: string;
  reference_summary: string;
  ethiopian_date: string;
  created_at: string;
  created_by: string;
}

// ===== Sales Types =====
export interface SaleLineItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface ExtraFee {
  description?: string;
  amount: number;
}

export interface CreateSaleRequest {
  manual_receipt_number: string;
  sale_date_ethiopian: string;
  customer_name: string;
  customer_tin?: string;
  extra_fee?: ExtraFee;
  line_items: SaleLineItem[];
  notes?: string;
}

export interface Sale {
  manual_receipt_number: string;
  sale_date_ethiopian: string;
  sale_date_gregorian: string;
  customer_name: string;
  customer_tin?: string;
  line_items: Array<{
    id: string;
    product: {
      id: string;
      name: string;
    };
    quantity: number;
    unit_price: number;
    line_total_before_vat: number;
  }>;
  financial_summary: {
    sub_total_before_vat: number;
    extra_fee_description?: string;
    extra_fee_amount: number;
    amount_before_vat: number;
    vat_rate: number;
    vat_amount: number;
    total_amount: number;
  };
  notes?: string;
  created_by: {
    id: string;
    username: string;
    full_name?: string;
  };
  created_at: string;
}

export interface VoidSaleRequest {
  reason: string;
}

// ===== Expense Types =====
export interface Expense {
  id: string;
  expense_date_ethiopian: string;
  expense_date_gregorian: string;
  category: 'TRANSPORT' | 'SALARY' | 'UTILITY' | 'OTHER';
  description: string;
  amount: number;
  linked_to?: {
    type: 'grain_intake' | 'sale';
    batch_id?: string;
    batch_receipt?: string;
    supplier_name?: string;
    reference?: string;
  };
  payment_method?: 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
  recipient_name?: string;
  receipt_reference?: string;
  created_by: {
    id: string;
    username: string;
    full_name?: string;
  };
  created_at: string;
}

export interface CreateExpenseRequest {
  expense_date_ethiopian: string;
  category: 'TRANSPORT' | 'SALARY' | 'UTILITY' | 'OTHER';
  description: string;
  amount: number;
  linked_batch_id?: string;
  linked_receipt_number?: string;
  payment_method?: 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
  recipient_name?: string;
  receipt_reference?: string;
}

// ===== Report Types =====
export interface DashboardStats {
  period: {
    type: string;
    label: string;
    start_date_ethiopian: string;
    end_date_ethiopian: string;
    start_date_gregorian: string;
    end_date_gregorian: string;
  };
  sales_revenue: {
    total_sales_count: number;
    total_revenue_before_vat: number;
    total_vat_collected: number;
    total_revenue_including_vat: number;
    average_sale_value: number;
    change_percentage_from_previous: number;
  };
  grain_intake: {
    total_batches: number;
    total_quantity_kg: number;
    total_cost: number;
    average_price_per_kg: number;
    change_percentage_from_previous: number;
  };
  expenses: {
    total_amount: number;
    breakdown: {
      TRANSPORT: number;
      SALARY: number;
      UTILITY: number;
      OTHER: number;
    };
  };
  net_position: {
    revenue: number;
    grain_cost: number;
    expenses: number;
    net_profit_loss: number;
    profit_margin_percentage: number;
  };
  milling_summary: {
    total_grain_milled_kg: number;
    total_flour_produced_kg: number;
    average_extraction_rate: string;
  };
  low_stock_alerts: Array<{
    product_id: string;
    product_name: string;
    current_stock: number;
    threshold: number;
    status: 'LOW';
  }>;
  top_selling_products: Array<{
    product_name: string;
    quantity_sold: number;
    revenue_generated: number;
  }>;
  generated_at: string;
}