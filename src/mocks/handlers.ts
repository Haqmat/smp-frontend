import { mockUsers, mockProducts, mockConfig, mockDashboardStats } from './data';
import type { LoginResponse } from '../types/api';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authHandlers = {
  // Updated to support both username and phone login
  login: async (credentials: { username?: string; phone?: string; password: string }): Promise<LoginResponse> => {
    await delay(500);
    
    // Find user by username or phone
    let user = mockUsers.find(u => u.username === credentials.username);
    if (!user && credentials.phone) {
      user = mockUsers.find(u => u.phone === credentials.phone);
    }
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    if (!user.is_active) {
      throw new Error('Account disabled');
    }
    
    return {
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      token_type: 'Bearer',
      expires_in: 3600,
      user,
    };
  },
  refresh: async (/* refreshToken: string */) => {
    await delay(300);
    return {
      access_token: 'mock_access_token_' + Date.now(),
      token_type: 'Bearer',
      expires_in: 3600,
    };
  },
  logout: async () => {
    await delay(200);
    return { success: true };
  },
};

export const userHandlers = {
  list: async (params: { page?: number; limit?: number; role?: string; is_active?: boolean; search?: string }) => {
    await delay(300);
    let users = [...mockUsers];
    if (params.role) {
      users = users.filter(u => u.role === params.role);
    }
    if (params.is_active !== undefined) {
      users = users.filter(u => u.is_active === params.is_active);
    }
    if (params.search) {
      const search = params.search.toLowerCase();
      users = users.filter(u => 
        u.username.toLowerCase().includes(search) || 
        u.full_name.toLowerCase().includes(search)
      );
    }
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      data: users.slice(start, end),
      pagination: {
        current_page: page,
        total_pages: Math.ceil(users.length / limit),
        total_items: users.length,
        items_per_page: limit,
        has_next_page: end < users.length,
        has_previous_page: page > 1,
      },
    };
  },
  getById: async (id: string) => {
    await delay(200);
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },
};

export const productHandlers = {
  list: async (params: { type?: string; is_active?: boolean }) => {
    await delay(300);
    let products = [...mockProducts];
    if (params.type) {
      products = products.filter(p => p.type === params.type);
    }
    if (params.is_active !== undefined) {
      products = products.filter(p => p.is_active === params.is_active);
    }
    return {
      products,
      total_count: products.length,
    };
  },
};

export const configHandlers = {
  get: async () => {
    await delay(200);
    return mockConfig;
  },
};

export const dashboardHandlers = {
  get: async (/* params: { period: string; start_date?: string; end_date?: string } */) => {
    await delay(400);
    return mockDashboardStats;
  },
};

// Add grain intake handlers
export const grainIntakeHandlers = {
  list: async (params: { 
    page?: number; 
    limit?: number; 
    supplier_name?: string; 
    product_id?: string; 
    start_date?: string; 
    end_date?: string; 
    receipt_number?: string;
  }) => {
    await delay(400);
    // Return mock data - in real implementation this would filter
    return {
      data: [],
      pagination: {
        current_page: params.page || 1,
        total_pages: 1,
        total_items: 0,
        items_per_page: params.limit || 20,
        has_next_page: false,
        has_previous_page: false,
      },
    };
  },
  create: async (data: any) => {
    await delay(600);
    return {
      id: 'mock_batch_id_' + Date.now(),
      ...data,
      created_at: new Date().toISOString(),
    };
  },
  getById: async (id: string) => {
    await delay(300);
    // Return mock data
    return {
      id,
      receipt_number: 'GI-2018-0001',
      supplier_name: 'አቶ በቀለ አሰፋ',
      supplier_tin: '0009876543',
      intake_date_ethiopian: '2018-03-05',
      intake_date_gregorian: '2025-11-14',
      notes: 'Good quality white teff',
      line_items: [],
      total_quantity: 800.00,
      total_cost: 41900.00,
      linked_expenses: [],
      created_by: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        username: 'haqmat_admin',
        full_name: 'Abebe Kebede',
      },
      created_at: '2018-11-04T14:00:00.000Z',
    };
  },
};

// Add sales handlers
export const salesHandlers = {
  list: async (params: {
    page?: number;
    limit?: number;
    customer_name?: string;
    customer_tin?: string;
    product_id?: string;
    start_date?: string;
    end_date?: string;
    receipt_number?: string;
    min_amount?: number;
    max_amount?: number;
    sort_by?: string;
    sort_order?: string;
  }) => {
    await delay(400);
    return {
      data: [],
      summary: {
        total_sales_count: 0,
        total_revenue: 0,
        total_vat_collected: 0,
      },
      pagination: {
        current_page: params.page || 1,
        total_pages: 1,
        total_items: 0,
        items_per_page: params.limit || 20,
        has_next_page: false,
        has_previous_page: false,
      },
    };
  },
  create: async (data: any) => {
    await delay(600);
    return {
      manual_receipt_number: data.manual_receipt_number,
      ...data,
      created_at: new Date().toISOString(),
      financial_summary: {
        sub_total_before_vat: 0,
        extra_fee_description: '',
        extra_fee_amount: 0,
        amount_before_vat: 0,
        vat_rate: 0.15,
        vat_amount: 0,
        total_amount: 0,
      },
    };
  },
  getByReceipt: async (receiptNumber: string) => {
    await delay(300);
    return {
      manual_receipt_number: receiptNumber,
      sale_date_ethiopian: '2018-03-07',
      sale_date_gregorian: '2025-11-16',
      customer_name: 'አቶ ገብረ ሚካኤል',
      customer_tin: '0001234567',
      line_items: [],
      financial_summary: {
        sub_total_before_vat: 6025.00,
        extra_fee_description: 'ትራንስፖርት',
        extra_fee_amount: 200.00,
        amount_before_vat: 6225.00,
        vat_rate: 0.15,
        vat_amount: 903.75,
        total_amount: 7128.75,
      },
      notes: 'Regular customer - monthly bulk purchase',
      created_by: {
        id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        username: 'sales_selam',
        full_name: 'Selam Tsegaye',
      },
      created_at: '2018-11-04T16:30:00.000Z',
    };
  },
  void: async (receiptNumber: string, reason: string) => {
    await delay(500);
    return {
      manual_receipt_number: receiptNumber,
      status: 'VOIDED',
      void_reason: reason,
      voided_at: new Date().toISOString(),
      voided_by: 'haqmat_admin',
    };
  },
};

// Add expense handlers
export const expenseHandlers = {
  list: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    start_date?: string;
    end_date?: string;
    linked_type?: string;
    min_amount?: number;
    max_amount?: number;
  }) => {
    await delay(400);
    return {
      data: [],
      category_summary: {
        TRANSPORT: 0,
        SALARY: 0,
        UTILITY: 0,
        OTHER: 0,
      },
      total_expenses: 0,
      pagination: {
        current_page: params.page || 1,
        total_pages: 1,
        total_items: 0,
        items_per_page: params.limit || 20,
        has_next_page: false,
        has_previous_page: false,
      },
    };
  },
  create: async (data: any) => {
    await delay(500);
    return {
      id: 'mock_expense_id_' + Date.now(),
      ...data,
      created_at: new Date().toISOString(),
    };
  },
  getById: async (id: string) => {
    await delay(300);
    return {
      id,
      expense_date_ethiopian: '2018-03-05',
      expense_date_gregorian: '2025-11-14',
      category: 'TRANSPORT',
      description: 'Transport cost for grain delivery',
      amount: 1500.00,
      payment_method: 'CASH',
      recipient_name: 'አቶ ተስፋዬ መንግስቱ',
      receipt_reference: 'EXP-2018-0015',
      created_by: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        username: 'haqmat_admin',
        full_name: 'Abebe Kebede',
      },
      created_at: '2018-11-04T17:30:00.000Z',
    };
  },
};

// Add report handlers
export const reportHandlers = {
  annualSales: async (params: { fiscal_year: number; format?: string; include_voided?: boolean }) => {
    await delay(800);
    return {
      report_metadata: {
        fiscal_year: `${params.fiscal_year}/${params.fiscal_year + 1}`,
        period_ethiopian: 'ከ ሐምሌ 8, 2018 እስከ ሐምሌ 7, 2019',
        period_gregorian: 'From July 16, 2025 to July 15, 2026',
        generated_at: new Date().toISOString(),
        generated_by: 'haqmat_admin',
        company_name: 'Haqmat Manufacturing PLC',
        company_tin: '0001234567',
      },
      detailed_sales: [],
      summary_by_flour_type: [],
      grand_totals: {
        total_quantity_all_kg: 0,
        total_revenue_before_vat: 0,
        total_vat: 0,
        total_revenue_including_vat: 0,
      },
    };
  },
  profitLoss: async (params: { fiscal_year: number; format?: string }) => {
    await delay(800);
    return {
      report_metadata: {
        fiscal_year: `${params.fiscal_year}/${params.fiscal_year + 1}`,
        period_ethiopian: 'ከ ሐምሌ 8, 2018 እስከ ሐምሌ 7, 2019',
        generated_at: new Date().toISOString(),
      },
      revenue: {
        total_sales_revenue_before_vat: 0,
        extra_fees_collected: 0,
        total_revenue: 0,
      },
      cost_of_goods_sold: {
        grain_purchases: 0,
        opening_stock_value: 0,
        closing_stock_value: 0,
        total_cogs: 0,
      },
      gross_profit: {
        amount: 0,
        margin_percentage: '0%',
      },
      operating_expenses: {
        TRANSPORT: 0,
        SALARY: 0,
        UTILITY: 0,
        OTHER: 0,
        total_operating_expenses: 0,
      },
      net_profit_loss: {
        amount: 0,
        margin_percentage: '0%',
      },
      tax_liability: {
        vat_collected_on_sales: 0,
        vat_paid_on_purchases: 0,
        net_vat_payable: 0,
      },
    };
  },
  export: async (/* reportType: string, fiscalYear: number, format: string */) => {
    await delay(1000);
    // Return a mock blob
    return new Blob(['Mock report content'], { 
      type: 'application/pdf'
    });
  },
};

// Export all handlers
export const handlers = {
  auth: authHandlers,
  users: userHandlers,
  products: productHandlers,
  config: configHandlers,
  dashboard: dashboardHandlers,
  grainIntake: grainIntakeHandlers,
  sales: salesHandlers,
  expenses: expenseHandlers,
  reports: reportHandlers,
};