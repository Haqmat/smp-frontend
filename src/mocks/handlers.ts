import { 
  mockUsers, 
  mockProducts, 
  mockConfig, 
  mockGrainIntakeBatches, 
  mockSales, 
  mockExpenses, 
  mockStockLevels 
} from './data';
import type { 
  User, 
  Product, 
  GrainIntakeBatch, 
  Sale, 
  Expense, 
  StockMovement, 
  MillingSession,
  LoginResponse
} from '../types/api';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Keep track of milling sessions and movements in-memory
export const mockMillingSessions: MillingSession[] = [
  {
    id: 'mill-1',
    milling_date_ethiopian: '2018-03-05',
    milling_date_gregorian: '2025-11-14',
    input: {
      product: { id: 'd4e5f6a7-b8c9-0123-defa-234567890123', name: 'ነጭ ጤፍ' },
      quantity_used: 1000.00,
      cost_allocation: 50000.00,
    },
    outputs: [
      { product: { id: 'c3d4e5f6-a7b8-9012-cdef-123456789012', name: '1ኛ ደረጃ ነጭ ጤፍ ዱቄት' }, quantity_produced: 900.00, extraction_rate: '90.0%' },
      { product: { id: 'e5f6a7b8-c9d0-1234-efab-345678901234', name: '2ኛ ደረጃ ነጭ ጤፍ ዱቄት' }, quantity_produced: 50.00, extraction_rate: '5.0%' },
    ],
    total_output_quantity: 950.00,
    loss_quantity: 50.00,
    loss_percentage: '5.0%',
    notes: 'Standard milling run.',
    created_by: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', username: 'haqmat_admin' },
    created_at: '2018-11-04T15:00:00.000Z',
  }
];

export const mockStockMovements: StockMovement[] = [
  {
    id: 1,
    movement_type: 'INTAKE',
    quantity_change: 800.00,
    reference_type: 'grain_intake',
    reference_id: 'a7b8c9d0-e1f2-3456-abcd-567890123456',
    reference_summary: 'Intake batch from አቶ በቀለ አሰፋ',
    ethiopian_date: '2018-03-05',
    created_by: 'haqmat_admin',
    created_at: '2018-11-04T14:00:00.000Z',
  }
];

// Helper to add stock movement
const addStockMovement = (
  type: 'INTAKE' | 'MILLING_INPUT' | 'MILLING_OUTPUT' | 'SALE',
  qty: number,
  refType: string,
  refId: string,
  refSummary: string,
  ethDate: string,
  username: string
) => {
  mockStockMovements.push({
    id: mockStockMovements.length + 1,
    movement_type: type,
    quantity_change: qty,
    reference_type: refType,
    reference_id: refId,
    reference_summary: refSummary,
    ethiopian_date: ethDate,
    created_by: username,
    created_at: new Date().toISOString(),
  });
};

export const authHandlers = {
  login: async (credentials: { username?: string; phone?: string; password: string }): Promise<LoginResponse> => {
    await delay(400);
    let user = mockUsers.find(u => u.username === credentials.username);
    if (!user && credentials.phone) {
      user = mockUsers.find(u => u.phone === credentials.phone);
    }
    if (!user) throw { status: 401, message: 'Invalid username/phone or password' };
    if (!user.is_active) throw { status: 403, message: 'Account is deactivated' };

    return {
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      token_type: 'Bearer',
      expires_in: 3600,
      user,
    };
  },
  refresh: async (): Promise<any> => {
    await delay(200);
    return {
      access_token: 'mock_access_token_' + Date.now(),
      token_type: 'Bearer',
      expires_in: 3600,
    };
  },
  logout: async (): Promise<any> => {
    await delay(100);
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
      const activeBool = String(params.is_active) === 'true';
      users = users.filter(u => u.is_active === activeBool);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      users = users.filter(u => u.username.toLowerCase().includes(q) || u.full_name.toLowerCase().includes(q));
    }
    const page = Number(params.page || 1);
    const limit = Number(params.limit || 20);
    const start = (page - 1) * limit;
    return {
      users: users.slice(start, start + limit),
      pagination: {
        current_page: page,
        total_pages: Math.ceil(users.length / limit),
        total_items: users.length,
        items_per_page: limit,
        has_next_page: start + limit < users.length,
        has_previous_page: page > 1,
      },
    };
  },
  getById: async (id: string) => {
    await delay(150);
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw { status: 404, message: 'User not found' };
    return user;
  },
  create: async (data: any) => {
    await delay(300);
    if (mockUsers.some(u => u.username === data.username)) {
      throw { status: 409, message: 'Username is already taken' };
    }
    const newUser: User = {
      id: generateId(),
      username: data.username,
      full_name: data.full_name,
      role: data.role,
      email: data.email,
      phone: data.phone,
      is_active: true,
      is_first_login: true,
      created_at: new Date().toISOString(),
    };
    mockUsers.unshift(newUser);
    return newUser;
  },
  update: async (id: string, data: any) => {
    await delay(200);
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw { status: 404, message: 'User not found' };
    
    if (data.full_name !== undefined) user.full_name = data.full_name;
    if (data.email !== undefined) user.email = data.email;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.role !== undefined) user.role = data.role;
    if (data.is_active !== undefined) user.is_active = data.is_active;
    
    return user;
  },
  deactivate: async (id: string) => {
    await delay(200);
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw { status: 404, message: 'User not found' };
    user.is_active = false;
    return { success: true };
  },
};

export const productHandlers = {
  list: async (params?: { type?: 'RAW_GRAIN' | 'FINISHED_FLOUR'; is_active?: boolean }) => {
    await delay(250);
    let products = [...mockProducts];
    if (params?.type) {
      products = products.filter(p => p.type === params.type);
    }
    if (params?.is_active !== undefined) {
      const activeBool = String(params.is_active) === 'true';
      products = products.filter(p => p.is_active === activeBool);
    }
    return {
      products,
      total_count: products.length,
    };
  },
  create: async (data: any) => {
    await delay(250);
    if (mockProducts.some(p => p.name === data.name)) {
      throw { status: 409, message: 'Product name already exists' };
    }
    const newProduct: Product = {
      id: generateId(),
      name: data.name,
      name_en: data.name_en,
      type: data.type,
      unit_of_measure: data.unit_of_measure,
      default_unit_price: data.default_unit_price,
      category: data.category,
      is_active: true,
      current_stock_level: 0,
      low_stock_threshold: data.low_stock_threshold || 100,
      created_at: new Date().toISOString(),
    };
    mockProducts.push(newProduct);
    
    // Add to stock levels list
    mockStockLevels.push({
      product_id: newProduct.id,
      product_name: newProduct.name,
      product_type: newProduct.type,
      unit_of_measure: newProduct.unit_of_measure === 'ኪሎ' ? 'ኪሎ' : 'ኪግ',
      current_stock: 0,
      low_stock_threshold: newProduct.low_stock_threshold || 100,
      is_low_stock: true,
      last_updated: new Date().toISOString(),
    });

    return newProduct;
  },
  update: async (id: string, data: any) => {
    await delay(200);
    const prod = mockProducts.find(p => p.id === id);
    if (!prod) throw { status: 404, message: 'Product not found' };

    if (data.default_unit_price !== undefined) prod.default_unit_price = data.default_unit_price;
    if (data.low_stock_threshold !== undefined) prod.low_stock_threshold = data.low_stock_threshold;
    if (data.is_active !== undefined) prod.is_active = data.is_active;

    // Update matching stock level
    const sl = mockStockLevels.find(s => s.product_id === id);
    if (sl) {
      if (data.low_stock_threshold !== undefined) {
        sl.low_stock_threshold = data.low_stock_threshold;
        sl.is_low_stock = sl.current_stock < sl.low_stock_threshold;
      }
      sl.last_updated = new Date().toISOString();
    }

    return prod;
  },
};

export const configHandlers = {
  get: async () => {
    await delay(100);
    return mockConfig;
  },
  update: async (data: any) => {
    await delay(200);
    Object.assign(mockConfig, data);
    return { updated_keys: Object.keys(data) };
  },
};

export const grainIntakeHandlers = {
  list: async (params: { page?: number; limit?: number; supplier_name?: string; product_id?: string; start_date?: string; end_date?: string; receipt_number?: string }) => {
    await delay(300);
    let list = [...mockGrainIntakeBatches];
    if (params.supplier_name) {
      const q = params.supplier_name.toLowerCase();
      list = list.filter(item => item.supplier_name.toLowerCase().includes(q));
    }
    if (params.receipt_number) {
      const q = params.receipt_number.toLowerCase();
      list = list.filter(item => item.receipt_number.toLowerCase().includes(q));
    }
    if (params.product_id) {
      list = list.filter(item => item.line_items.some(li => li.product.id === params.product_id));
    }
    if (params.start_date) {
      list = list.filter(item => item.intake_date_ethiopian >= params.start_date!);
    }
    if (params.end_date) {
      list = list.filter(item => item.intake_date_ethiopian <= params.end_date!);
    }

    const page = Number(params.page || 1);
    const limit = Number(params.limit || 20);
    const start = (page - 1) * limit;

    return {
      data: list.slice(start, start + limit),
      pagination: {
        current_page: page,
        total_pages: Math.ceil(list.length / limit),
        total_items: list.length,
        items_per_page: limit,
        has_next_page: start + limit < list.length,
        has_previous_page: page > 1,
      },
    };
  },
  create: async (data: any) => {
    await delay(400);
    if (mockGrainIntakeBatches.some(b => b.receipt_number === data.receipt_number)) {
      throw { status: 409, message: 'Receipt number already exists' };
    }

    const id = generateId();
    let totalQty = 0;
    let totalCost = 0;

    const lineItems = data.line_items.map((item: any) => {
      const product = mockProducts.find(p => p.id === item.product_id);
      if (!product) throw { status: 404, message: `Product ${item.product_id} not found` };
      
      const lineTotal = item.quantity * item.unit_price;
      totalQty += item.quantity;
      totalCost += lineTotal;

      // Update in-memory stock level
      const stockLevel = mockStockLevels.find(sl => sl.product_id === product.id);
      if (stockLevel) {
        stockLevel.current_stock += item.quantity;
        stockLevel.is_low_stock = stockLevel.current_stock < stockLevel.low_stock_threshold;
        stockLevel.last_updated = new Date().toISOString();
      }
      product.current_stock_level = (product.current_stock_level || 0) + item.quantity;

      // Add Stock Movement
      addStockMovement(
        'INTAKE',
        item.quantity,
        'grain_intake',
        id,
        `Intake batch ${data.receipt_number} from ${data.supplier_name}`,
        data.intake_date_ethiopian,
        'haqmat_admin'
      );

      return {
        id: generateId(),
        product: { id: product.id, name: product.name },
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: lineTotal,
      };
    });

    const newBatch: GrainIntakeBatch = {
      id,
      receipt_number: data.receipt_number,
      supplier_name: data.supplier_name,
      supplier_tin: data.supplier_tin,
      intake_date_ethiopian: data.intake_date_ethiopian,
      intake_date_gregorian: new Date().toISOString().split('T')[0],
      notes: data.notes,
      line_items: lineItems,
      total_quantity: totalQty,
      total_cost: totalCost,
      linked_expenses: [],
      created_by: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', username: 'haqmat_admin', full_name: 'Abebe Kebede' },
      created_at: new Date().toISOString(),
    };

    (mockGrainIntakeBatches as any).unshift(newBatch);

    return {
      batch: newBatch,
      stock_update_summary: lineItems.map((li: any) => ({
        product_id: li.product.id,
        previous_stock: (mockStockLevels.find(s => s.product_id === li.product.id)?.current_stock || 0) - li.quantity,
        new_stock: mockStockLevels.find(s => s.product_id === li.product.id)?.current_stock || 0
      }))
    };
  },
  getById: async (id: string) => {
    await delay(150);
    const batch = mockGrainIntakeBatches.find(b => b.id === id);
    if (!batch) throw { status: 404, message: 'Grain intake batch not found' };
    return { batch };
  },
};

export const millingHandlers = {
  list: async (params: { page?: number; limit?: number; input_product_id?: string; output_product_id?: string; start_date?: string; end_date?: string }) => {
    await delay(300);
    let list = [...mockMillingSessions];
    if (params.input_product_id) {
      list = list.filter(item => item.input.product.id === params.input_product_id);
    }
    if (params.start_date) {
      list = list.filter(item => item.milling_date_ethiopian >= params.start_date!);
    }
    if (params.end_date) {
      list = list.filter(item => item.milling_date_ethiopian <= params.end_date!);
    }

    const page = Number(params.page || 1);
    const limit = Number(params.limit || 20);
    const start = (page - 1) * limit;

    return {
      data: list.slice(start, start + limit),
      pagination: {
        current_page: page,
        total_pages: Math.ceil(list.length / limit),
        total_items: list.length,
        items_per_page: limit,
        has_next_page: start + limit < list.length,
        has_previous_page: page > 1,
      },
    };
  },
  create: async (data: any) => {
    await delay(500);
    const inputProduct = mockProducts.find(p => p.id === data.input_product_id);
    if (!inputProduct) throw { status: 404, message: 'Input product not found' };

    const inputStock = mockStockLevels.find(s => s.product_id === data.input_product_id);
    if (!inputStock || inputStock.current_stock < data.input_quantity) {
      throw { status: 400, message: `Insufficient stock for ${inputProduct.name}. Available: ${inputStock?.current_stock || 0} kg` };
    }

    const sessionId = generateId();

    // Deduct input stock
    inputStock.current_stock -= data.input_quantity;
    inputStock.is_low_stock = inputStock.current_stock < inputStock.low_stock_threshold;
    inputStock.last_updated = new Date().toISOString();
    inputProduct.current_stock_level = inputStock.current_stock;

    // Add movement for input
    addStockMovement(
      'MILLING_INPUT',
      -data.input_quantity,
      'milling_session',
      sessionId,
      `Used in milling session ${sessionId}`,
      data.milling_date_ethiopian,
      'haqmat_admin'
    );

    let totalOutputQty = 0;
    const outputs = data.outputs.map((out: any) => {
      const outputProduct = mockProducts.find(p => p.id === out.output_product_id);
      if (!outputProduct) throw { status: 404, message: `Output product ${out.output_product_id} not found` };

      const outputStock = mockStockLevels.find(s => s.product_id === out.output_product_id);
      if (outputStock) {
        outputStock.current_stock += out.output_quantity;
        outputStock.is_low_stock = outputStock.current_stock < outputStock.low_stock_threshold;
        outputStock.last_updated = new Date().toISOString();
        outputProduct.current_stock_level = outputStock.current_stock;
      }
      totalOutputQty += out.output_quantity;

      // Add movement for output
      addStockMovement(
        'MILLING_OUTPUT',
        out.output_quantity,
        'milling_session',
        sessionId,
        `Produced in milling session ${sessionId}`,
        data.milling_date_ethiopian,
        'haqmat_admin'
      );

      const rate = ((out.output_quantity / data.input_quantity) * 100).toFixed(1) + '%';

      return {
        product: { id: outputProduct.id, name: outputProduct.name },
        quantity_produced: out.output_quantity,
        extraction_rate: rate,
      };
    });

    const lossQty = data.input_quantity - totalOutputQty;
    const loss_percentage = ((lossQty / data.input_quantity) * 100).toFixed(1) + '%';

    const newSession: MillingSession = {
      id: sessionId,
      milling_date_ethiopian: data.milling_date_ethiopian,
      milling_date_gregorian: new Date().toISOString().split('T')[0],
      input: {
        product: { id: inputProduct.id, name: inputProduct.name },
        quantity_used: data.input_quantity,
        cost_allocation: data.input_quantity * 50, // rough cost mock
      },
      outputs,
      total_output_quantity: totalOutputQty,
      loss_quantity: lossQty,
      loss_percentage,
      notes: data.notes,
      created_by: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', username: 'haqmat_admin' },
      created_at: new Date().toISOString(),
    };

    mockMillingSessions.unshift(newSession);

    return { milling_session: newSession };
  },
};

export const inventoryHandlers = {
  getCurrentStockLevels: async (params?: { type?: 'RAW_GRAIN' | 'FINISHED_FLOUR'; low_stock_only?: boolean; product_id?: string }) => {
    await delay(200);
    let list = [...mockStockLevels];
    if (params?.type) {
      list = list.filter(sl => sl.product_type === params.type);
    }
    if (params?.low_stock_only) {
      const isLowStockBool = String(params.low_stock_only) === 'true';
      if (isLowStockBool) {
        list = list.filter(sl => sl.is_low_stock);
      }
    }
    if (params?.product_id) {
      list = list.filter(sl => sl.product_id === params.product_id);
    }

    const rawCount = list.filter(sl => sl.product_type === 'RAW_GRAIN').length;
    const finishedCount = list.filter(sl => sl.product_type === 'FINISHED_FLOUR').length;
    const lowCount = list.filter(sl => sl.is_low_stock).length;

    return {
      stock_levels: list,
      summary: {
        total_raw_grains: rawCount,
        total_finished_flours: finishedCount,
        low_stock_alerts_count: lowCount,
      },
      as_of: new Date().toISOString(),
    };
  },
  getStockMovementHistory: async (productId: string, params?: { page?: number; limit?: number; movement_type?: string; start_date?: string; end_date?: string }) => {
    await delay(250);
    const product = mockProducts.find(p => p.id === productId);
    if (!product) throw { status: 404, message: 'Product not found' };

    let list = mockStockMovements.filter(m => {
      // Find movements matching product ID in reference summaries or if mapped directly
      // In a real DB it resolves by product; let's simulate by matching product details in reference summaries
      return m.reference_summary.includes(product.name) || m.reference_summary.includes(productId);
    });

    if (params?.movement_type) {
      list = list.filter(m => m.movement_type === params.movement_type);
    }

    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 20);
    const start = (page - 1) * limit;

    const currentStock = mockStockLevels.find(s => s.product_id === productId)?.current_stock || 0;

    return {
      data: list.slice(start, start + limit),
      pagination: {
        current_page: page,
        total_pages: Math.ceil(list.length / limit),
        total_items: list.length,
        items_per_page: limit,
        has_next_page: start + limit < list.length,
        has_previous_page: page > 1,
      },
      current_stock_balance: currentStock,
      product: { id: product.id, name: product.name }
    };
  },
};

export const salesHandlers = {
  list: async (params: { page?: number; limit?: number; customer_name?: string; customer_tin?: string; product_id?: string; start_date?: string; end_date?: string; receipt_number?: string; min_amount?: number; max_amount?: number }) => {
    await delay(350);
    let list = [...mockSales];

    if (params.customer_name) {
      const q = params.customer_name.toLowerCase();
      list = list.filter(item => item.customer_name.toLowerCase().includes(q));
    }
    if (params.customer_tin) {
      list = list.filter(item => item.customer_tin?.includes(params.customer_tin!));
    }
    if (params.receipt_number) {
      const q = params.receipt_number.toLowerCase();
      list = list.filter(item => item.manual_receipt_number.toLowerCase().includes(q));
    }
    if (params.product_id) {
      list = list.filter(item => item.line_items.some(li => li.product.id === params.product_id));
    }
    if (params.start_date) {
      list = list.filter(item => item.sale_date_ethiopian >= params.start_date!);
    }
    if (params.end_date) {
      list = list.filter(item => item.sale_date_ethiopian <= params.end_date!);
    }
    if (params.min_amount) {
      list = list.filter(item => item.financial_summary.total_amount >= params.min_amount!);
    }
    if (params.max_amount) {
      list = list.filter(item => item.financial_summary.total_amount <= params.max_amount!);
    }

    const page = Number(params.page || 1);
    const limit = Number(params.limit || 20);
    const start = (page - 1) * limit;

    let totalRevenue = 0;
    let totalVat = 0;
    list.forEach(sale => {
      totalRevenue += sale.financial_summary.amount_before_vat;
      totalVat += sale.financial_summary.vat_amount;
    });

    return {
      data: list.slice(start, start + limit),
      summary: {
        total_sales_count: list.length,
        total_revenue: totalRevenue,
        total_vat_collected: totalVat,
      },
      pagination: {
        current_page: page,
        total_pages: Math.ceil(list.length / limit),
        total_items: list.length,
        items_per_page: limit,
        has_next_page: start + limit < list.length,
        has_previous_page: page > 1,
      },
    };
  },
  create: async (data: any) => {
    await delay(500);
    if (mockSales.some(s => s.manual_receipt_number === data.manual_receipt_number)) {
      throw { status: 409, message: 'Receipt number already exists' };
    }

    // Validate and deduct stock
    data.line_items.forEach((item: any) => {
      const stock = mockStockLevels.find(s => s.product_id === item.product_id);
      if (!stock || stock.current_stock < item.quantity) {
        const prodName = mockProducts.find(p => p.id === item.product_id)?.name || 'Unknown Product';
        throw { status: 400, message: `Insufficient stock for ${prodName}. Available: ${stock?.current_stock || 0} kg` };
      }
    });

    let subTotal = 0;
    const lineItems = data.line_items.map((item: any) => {
      const product = mockProducts.find(p => p.id === item.product_id);
      if (!product) throw { status: 404, message: `Product ${item.product_id} not found` };
      const lineTotal = item.quantity * item.unit_price;
      subTotal += lineTotal;

      // Deduct stock
      const stock = mockStockLevels.find(s => s.product_id === product.id);
      if (stock) {
        stock.current_stock -= item.quantity;
        stock.is_low_stock = stock.current_stock < stock.low_stock_threshold;
        stock.last_updated = new Date().toISOString();
        product.current_stock_level = stock.current_stock;
      }

      // Add movement
      addStockMovement(
        'SALE',
        -item.quantity,
        'sale',
        data.manual_receipt_number,
        `Sale ${data.manual_receipt_number} to ${data.customer_name}`,
        data.sale_date_ethiopian,
        'haqmat_admin'
      );

      return {
        id: generateId(),
        product: { id: product.id, name: product.name },
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total_before_vat: lineTotal,
      };
    });

    const extraFeeAmount = data.extra_fee?.amount || 0;
    const extraFeeDesc = data.extra_fee?.description || '';
    const amountBeforeVat = subTotal + extraFeeAmount;
    const vatRate = 0.15;
    const vatAmount = amountBeforeVat * vatRate;
    const totalAmount = amountBeforeVat + vatAmount;

    const newSale: Sale = {
      manual_receipt_number: data.manual_receipt_number,
      sale_date_ethiopian: data.sale_date_ethiopian,
      sale_date_gregorian: new Date().toISOString().split('T')[0],
      customer_name: data.customer_name,
      customer_tin: data.customer_tin,
      line_items: lineItems,
      financial_summary: {
        sub_total_before_vat: subTotal,
        extra_fee_description: extraFeeDesc,
        extra_fee_amount: extraFeeAmount,
        amount_before_vat: amountBeforeVat,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        total_amount: totalAmount,
      },
      notes: data.notes,
      created_by: { id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', username: 'sales_selam', full_name: 'Selam Tsegaye' },
      created_at: new Date().toISOString(),
    };

    (mockSales as any).unshift(newSale);

    return {
      sale: newSale,
      stock_updates: lineItems.map((li: any) => ({
        product_id: li.product.id,
        current_stock: mockStockLevels.find(s => s.product_id === li.product.id)?.current_stock || 0
      }))
    };
  },
  getByReceipt: async (receiptNumber: string) => {
    await delay(150);
    const sale = mockSales.find(s => s.manual_receipt_number === receiptNumber);
    if (!sale) throw { status: 404, message: 'Sale not found' };
    return sale;
  },
  void: async (receiptNumber: string, reason: string) => {
    await delay(400);
    const saleIndex = mockSales.findIndex(s => s.manual_receipt_number === receiptNumber);
    if (saleIndex === -1) throw { status: 404, message: 'Sale not found' };
    const sale = mockSales[saleIndex];

    // Mark as voided in notes or add voided structure
    (sale as any).status = 'VOIDED';
    (sale as any).void_reason = reason;
    (sale as any).voided_at = new Date().toISOString();
    (sale as any).voided_by = 'haqmat_admin';

    // Reverse stocks
    sale.line_items.forEach((item: any) => {
      const stock = mockStockLevels.find(s => s.product_id === item.product.id);
      if (stock) {
        stock.current_stock += item.quantity;
        stock.is_low_stock = stock.current_stock < stock.low_stock_threshold;
        stock.last_updated = new Date().toISOString();
      }
      
      const prod = mockProducts.find(p => p.id === item.product.id);
      if (prod) {
        prod.current_stock_level = stock ? stock.current_stock : 0;
      }

      // Add movement
      addStockMovement(
        'INTAKE', // Treated as reversal intake
        item.quantity,
        'sale_void',
        receiptNumber,
        `Voided sale ${receiptNumber} - Stock reversal`,
        sale.sale_date_ethiopian,
        'haqmat_admin'
      );
    });

    return {
      manual_receipt_number: receiptNumber,
      status: 'VOIDED',
      void_reason: reason,
      voided_at: new Date().toISOString(),
      voided_by: 'haqmat_admin',
      stock_reversal: sale.line_items.map((li: any) => ({
        product_id: li.product.id,
        restored_quantity: li.quantity,
      }))
    };
  },
};

export const expenseHandlers = {
  list: async (params: { page?: number; limit?: number; category?: 'TRANSPORT' | 'SALARY' | 'UTILITY' | 'OTHER'; start_date?: string; end_date?: string; linked_type?: string; min_amount?: number; max_amount?: number }) => {
    await delay(300);
    let list = [...mockExpenses];

    if (params.category) {
      list = list.filter(item => item.category === params.category);
    }
    if (params.start_date) {
      list = list.filter(item => item.expense_date_ethiopian >= params.start_date!);
    }
    if (params.end_date) {
      list = list.filter(item => item.expense_date_ethiopian <= params.end_date!);
    }
    if (params.linked_type) {
      list = list.filter(item => item.linked_to?.type === params.linked_type);
    }
    if (params.min_amount) {
      list = list.filter(item => item.amount >= params.min_amount!);
    }
    if (params.max_amount) {
      list = list.filter(item => item.amount <= params.max_amount!);
    }

    const page = Number(params.page || 1);
    const limit = Number(params.limit || 20);
    const start = (page - 1) * limit;

    const summary = {
      TRANSPORT: 0,
      SALARY: 0,
      UTILITY: 0,
      OTHER: 0,
    };
    list.forEach(exp => {
      if (exp.category in summary) {
        summary[exp.category] += exp.amount;
      }
    });

    const totalExpenses = list.reduce((sum, item) => sum + item.amount, 0);

    return {
      data: list.slice(start, start + limit),
      category_summary: summary,
      total_expenses: totalExpenses,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(list.length / limit),
        total_items: list.length,
        items_per_page: limit,
        has_next_page: start + limit < list.length,
        has_previous_page: page > 1,
      },
    };
  },
  create: async (data: any) => {
    await delay(300);
    const newExpense: Expense = {
      id: generateId(),
      expense_date_ethiopian: data.expense_date_ethiopian,
      expense_date_gregorian: new Date().toISOString().split('T')[0],
      category: data.category,
      description: data.description,
      amount: data.amount,
      payment_method: data.payment_method || 'CASH',
      recipient_name: data.recipient_name,
      receipt_reference: data.receipt_reference,
      created_by: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', username: 'haqmat_admin', full_name: 'Abebe Kebede' },
      created_at: new Date().toISOString(),
    };

    if (data.linked_batch_id) {
      const batch = mockGrainIntakeBatches.find(b => b.id === data.linked_batch_id);
      if (batch) {
        newExpense.linked_to = {
          type: 'grain_intake',
          batch_id: batch.id,
          batch_receipt: batch.receipt_number,
          supplier_name: batch.supplier_name,
        };
        if (!batch.linked_expenses) batch.linked_expenses = [];
        (batch.linked_expenses as any).push(newExpense);
      }
    }

    (mockExpenses as any).unshift(newExpense);
    return newExpense;
  },
  getById: async (id: string) => {
    await delay(150);
    const exp = mockExpenses.find(e => e.id === id);
    if (!exp) throw { status: 404, message: 'Expense not found' };
    return exp;
  },
};

export const dashboardHandlers = {
  get: async (params: { period: string; start_date?: string; end_date?: string }) => {
    await delay(400);

    // Dynamic calculations based on mock datasets
    const salesCount = mockSales.length;
    const totalSalesRev = mockSales.reduce((sum, s) => sum + s.financial_summary.amount_before_vat, 0);
    const totalVat = mockSales.reduce((sum, s) => sum + s.financial_summary.vat_amount, 0);
    const totalSalesIncVat = totalSalesRev + totalVat;
    const avgSaleValue = salesCount > 0 ? totalSalesRev / salesCount : 0;

    const intakeCount = mockGrainIntakeBatches.length;
    const intakeQty = mockGrainIntakeBatches.reduce((sum, b) => sum + b.total_quantity, 0);
    const intakeCost = mockGrainIntakeBatches.reduce((sum, b) => sum + b.total_cost, 0);
    const avgIntakePrice = intakeQty > 0 ? intakeCost / intakeQty : 0;

    const expenseBreakdown = {
      TRANSPORT: 0,
      SALARY: 0,
      UTILITY: 0,
      OTHER: 0,
    };
    mockExpenses.forEach(exp => {
      if (exp.category in expenseBreakdown) {
        expenseBreakdown[exp.category] += exp.amount;
      }
    });
    const totalExpenses = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const netPosition = totalSalesRev - intakeCost - totalExpenses;
    const profitMargin = totalSalesRev > 0 ? (netPosition / totalSalesRev) * 100 : 0;

    const lowStockAlerts = mockStockLevels
      .filter(sl => sl.is_low_stock)
      .map(sl => ({
        product_id: sl.product_id,
        product_name: sl.product_name,
        current_stock: sl.current_stock,
        threshold: sl.low_stock_threshold,
        status: 'LOW' as const
      }));

    return {
      period: {
        type: params.period || 'this_month',
        label: 'Dynamic Live Dashboard',
        start_date_ethiopian: '2018-01-01',
        end_date_ethiopian: '2018-13-05',
        start_date_gregorian: '2025-09-11',
        end_date_gregorian: '2026-08-15',
      },
      sales_revenue: {
        total_sales_count: salesCount,
        total_revenue_before_vat: totalSalesRev,
        total_vat_collected: totalVat,
        total_revenue_including_vat: totalSalesIncVat,
        average_sale_value: avgSaleValue,
        change_percentage_from_previous: 12.5,
      },
      grain_intake: {
        total_batches: intakeCount,
        total_quantity_kg: intakeQty,
        total_cost: intakeCost,
        average_price_per_kg: avgIntakePrice,
        change_percentage_from_previous: -3.5,
      },
      expenses: {
        total_amount: totalExpenses,
        breakdown: expenseBreakdown,
      },
      net_position: {
        revenue: totalSalesRev,
        grain_cost: -intakeCost,
        expenses: -totalExpenses,
        net_profit_loss: netPosition,
        profit_margin_percentage: profitMargin,
      },
      milling_summary: {
        total_grain_milled_kg: mockMillingSessions.reduce((sum, s) => sum + s.input.quantity_used, 0),
        total_flour_produced_kg: mockMillingSessions.reduce((sum, s) => sum + s.total_output_quantity, 0),
        average_extraction_rate: '95.0%',
      },
      low_stock_alerts: lowStockAlerts,
      top_selling_products: [
        {
          product_name: '1ኛ ደረጃ ነጭ ጤፍ ዱቄት',
          quantity_sold: mockSales.reduce((sum, s) => {
            const li = s.line_items.find(l => l.product.name.includes('1ኛ ደረጃ'));
            return sum + (li?.quantity || 0);
          }, 0) || 500,
          revenue_generated: mockSales.reduce((sum, s) => {
            const li = s.line_items.find(l => l.product.name.includes('1ኛ ደረጃ'));
            return sum + (li?.line_total_before_vat || 0);
          }, 0) || 45000,
        }
      ],
      generated_at: new Date().toISOString(),
    };
  },
};

export const reportHandlers = {
  annualSales: async (params: { fiscal_year: number; format?: string; include_voided?: boolean }) => {
    await delay(500);

    const yearPrefix = String(params.fiscal_year);
    // Filter sales within that fiscal year (simplistic filter based on dates starting with prefix)
    const salesInYear = mockSales.filter(s => s.sale_date_ethiopian.startsWith(yearPrefix));

    const grandTotals = {
      total_quantity_all_kg: 0,
      total_revenue_before_vat: 0,
      total_vat: 0,
      total_revenue_including_vat: 0,
    };

    salesInYear.forEach(s => {
      grandTotals.total_revenue_before_vat += s.financial_summary.amount_before_vat;
      grandTotals.total_vat += s.financial_summary.vat_amount;
      grandTotals.total_revenue_including_vat += s.financial_summary.total_amount;
      s.line_items.forEach(li => {
        grandTotals.total_quantity_all_kg += li.quantity;
      });
    });

    return {
      report_metadata: {
        fiscal_year: `${params.fiscal_year}/${params.fiscal_year + 1}`,
        period_ethiopian: `ከ መስከረም 1, ${params.fiscal_year} እስከ ጳጉሜ 6, ${params.fiscal_year}`,
        period_gregorian: 'Ethiopian Fiscal Year Report',
        generated_at: new Date().toISOString(),
        generated_by: 'haqmat_admin',
        company_name: 'Haqmat Manufacturing PLC',
        company_tin: '0001234567',
      },
      detailed_sales: salesInYear,
      summary_by_flour_type: [
        {
          product_name: '1ኛ ደረጃ ነጭ ጤፍ ዱቄት',
          quantity_sold: salesInYear.reduce((sum, s) => {
            const li = s.line_items.find(l => l.product.name.includes('1ኛ ደረጃ'));
            return sum + (li?.quantity || 0);
          }, 0),
          revenue: salesInYear.reduce((sum, s) => {
            const li = s.line_items.find(l => l.product.name.includes('1ኛ ደረጃ'));
            return sum + (li?.line_total_before_vat || 0);
          }, 0)
        }
      ],
      grand_totals: grandTotals,
    };
  },
  profitLoss: async (params: { fiscal_year: number; format?: string }) => {
    await delay(500);
    const yearPrefix = String(params.fiscal_year);

    const salesInYear = mockSales.filter(s => s.sale_date_ethiopian.startsWith(yearPrefix));
    const intakesInYear = mockGrainIntakeBatches.filter(b => b.intake_date_ethiopian.startsWith(yearPrefix));
    const expensesInYear = mockExpenses.filter(e => e.expense_date_ethiopian.startsWith(yearPrefix));

    const totalSalesRev = salesInYear.reduce((sum, s) => sum + s.financial_summary.amount_before_vat, 0);
    const extraFeesCollected = salesInYear.reduce((sum, s) => sum + s.financial_summary.extra_fee_amount, 0);
    const totalRevenue = totalSalesRev + extraFeesCollected;

    const grainPurchases = intakesInYear.reduce((sum, b) => sum + b.total_cost, 0);
    const openingStock = 20000.00; // Mock fixed
    const closingStock = 25000.00; // Mock fixed
    const totalCogs = openingStock + grainPurchases - closingStock;

    const grossProfit = totalRevenue - totalCogs;
    const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) + '%' : '0%';

    const expBreakdown = {
      TRANSPORT: 0,
      SALARY: 0,
      UTILITY: 0,
      OTHER: 0,
    };
    expensesInYear.forEach(exp => {
      if (exp.category in expBreakdown) {
        expBreakdown[exp.category] += exp.amount;
      }
    });

    const totalOpEx = expensesInYear.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = grossProfit - totalOpEx;
    const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) + '%' : '0%';

    const vatCollected = salesInYear.reduce((sum, s) => sum + s.financial_summary.vat_amount, 0);
    const vatPaidOnPurchases = grainPurchases * 0.15; // rough estimate
    const netVatPayable = Math.max(0, vatCollected - vatPaidOnPurchases);

    return {
      report_metadata: {
        fiscal_year: `${params.fiscal_year}/${params.fiscal_year + 1}`,
        period_ethiopian: `ከ መስከረም 1, ${params.fiscal_year} እስከ ጳጉሜ 6, ${params.fiscal_year}`,
        generated_at: new Date().toISOString(),
      },
      revenue: {
        total_sales_revenue_before_vat: totalSalesRev,
        extra_fees_collected: extraFeesCollected,
        total_revenue: totalRevenue,
      },
      cost_of_goods_sold: {
        grain_purchases: grainPurchases,
        opening_stock_value: openingStock,
        closing_stock_value: closingStock,
        total_cogs: totalCogs,
      },
      gross_profit: {
        amount: grossProfit,
        margin_percentage: grossMargin,
      },
      operating_expenses: {
        TRANSPORT: expBreakdown.TRANSPORT,
        SALARY: expBreakdown.SALARY,
        UTILITY: expBreakdown.UTILITY,
        OTHER: expBreakdown.OTHER,
        total_operating_expenses: totalOpEx,
      },
      net_profit_loss: {
        amount: netProfit,
        margin_percentage: netMargin,
      },
      tax_liability: {
        vat_collected_on_sales: vatCollected,
        vat_paid_on_purchases: vatPaidOnPurchases,
        net_vat_payable: netVatPayable,
      },
    };
  },
  export: async (reportType: string, fiscalYear: number, format: string) => {
    await delay(1000);
    return new Blob([`Mock Report Export\nType: ${reportType}\nYear: ${fiscalYear}\nFormat: ${format}`], {
      type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  },
};

export const handlers = {
  auth: authHandlers,
  users: userHandlers,
  products: productHandlers,
  config: configHandlers,
  grainIntake: grainIntakeHandlers,
  milling: millingHandlers,
  inventory: inventoryHandlers,
  sales: salesHandlers,
  expenses: expenseHandlers,
  dashboard: dashboardHandlers,
  reports: reportHandlers,
};