import { handlers } from './handlers';

export async function handleMockRequest(config: any): Promise<any> {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  const parsedData = config.data ? JSON.parse(config.data) : undefined;
  const params = config.params || {};

  // Extract ID or subpaths if necessary
  const cleanUrl = url.replace(/^\/api\/v1/, '').replace(/^https:\/\/api\.haqmat\.com\/api\/v1/, '');

  // Helper to extract ID from URL patterns like /admin/users/:id or /sales/:receipt
  const matchId = (pattern: string, path: string): string | null => {
    const patternParts = pattern.split('/');
    const pathParts = path.split('?')[0].split('/');
    if (patternParts.length !== pathParts.length) return null;
    let id: string | null = null;
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        id = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return id;
  };

  // Auth endpoints
  if (cleanUrl === '/auth/login' && method === 'post') {
    return handlers.auth.login(parsedData);
  }
  if (cleanUrl === '/auth/refresh' && method === 'post') {
    return handlers.auth.refresh();
  }
  if (cleanUrl === '/auth/logout' && method === 'post') {
    return handlers.auth.logout();
  }
  if (cleanUrl === '/auth/change-password' && method === 'post') {
    // Note: changePassword is on AuthContext but uses handler in handlers.ts
    // Let's implement it inside authHandlers in handlers.ts
    const userJson = sessionStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    if (!user) throw { status: 401, message: 'Unauthorized' };
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }

  // Users endpoints
  if (cleanUrl === '/admin/users' && method === 'get') {
    return handlers.users.list(params);
  }
  if (cleanUrl === '/admin/users' && method === 'post') {
    // Add user creation to handlers
    return (handlers.users as any).create(parsedData);
  }
  const userId = matchId('/admin/users/:id', cleanUrl);
  if (userId) {
    if (method === 'get') {
      return handlers.users.getById(userId);
    }
    if (method === 'put') {
      return (handlers.users as any).update(userId, parsedData);
    }
    if (method === 'delete') {
      return (handlers.users as any).deactivate(userId);
    }
  }

  // Products endpoints
  if (cleanUrl === '/products' && method === 'get') {
    return handlers.products.list(params);
  }
  if (cleanUrl === '/admin/products' && method === 'post') {
    return (handlers.products as any).create(parsedData);
  }
  const productId = matchId('/admin/products/:id', cleanUrl);
  if (productId && method === 'put') {
    return (handlers.products as any).update(productId, parsedData);
  }

  // Config endpoints
  if (cleanUrl === '/admin/config' && method === 'get') {
    return handlers.config.get();
  }
  if (cleanUrl === '/admin/config' && method === 'put') {
    return (handlers.config as any).update(parsedData);
  }

  // Grain Intake endpoints
  if (cleanUrl === '/inventory/grain-intake' && method === 'get') {
    return handlers.grainIntake.list(params);
  }
  if (cleanUrl === '/inventory/grain-intake' && method === 'post') {
    return handlers.grainIntake.create(parsedData);
  }
  const intakeId = matchId('/inventory/grain-intake/:id', cleanUrl);
  if (intakeId && method === 'get') {
    return handlers.grainIntake.getById(intakeId);
  }

  // Milling endpoints
  if (cleanUrl === '/inventory/milling' && method === 'get') {
    return (handlers as any).milling.list(params);
  }
  if (cleanUrl === '/inventory/milling' && method === 'post') {
    return (handlers as any).milling.create(parsedData);
  }

  // Inventory/Stock endpoints
  if (cleanUrl === '/inventory/stock-levels' && method === 'get') {
    return (handlers as any).inventory.getCurrentStockLevels(params);
  }
  const movementProductId = matchId('/inventory/stock-movements/:id', cleanUrl);
  if (movementProductId && method === 'get') {
    return (handlers as any).inventory.getStockMovementHistory(movementProductId, params);
  }

  // Sales endpoints
  if (cleanUrl === '/sales' && method === 'get') {
    return handlers.sales.list(params);
  }
  if (cleanUrl === '/sales' && method === 'post') {
    return handlers.sales.create(parsedData);
  }
  const saleReceipt = matchId('/sales/:receipt', cleanUrl);
  if (saleReceipt && method === 'get') {
    return handlers.sales.getByReceipt(saleReceipt);
  }
  const voidReceipt = matchId('/sales/:receipt/void', cleanUrl);
  if (voidReceipt && method === 'post') {
    return handlers.sales.void(voidReceipt, parsedData?.reason || 'No reason specified');
  }

  // Expenses endpoints
  if (cleanUrl === '/expenses' && method === 'get') {
    return handlers.expenses.list(params);
  }
  if (cleanUrl === '/expenses' && method === 'post') {
    return handlers.expenses.create(parsedData);
  }
  const expenseId = matchId('/expenses/:id', cleanUrl);
  if (expenseId && method === 'get') {
    return handlers.expenses.getById(expenseId);
  }

  // Dashboard stats endpoint
  if (cleanUrl === '/reports/dashboard' && method === 'get') {
    return handlers.dashboard.get(params);
  }

  // Report endpoints
  if (cleanUrl === '/reports/annual-sales' && method === 'get') {
    return handlers.reports.annualSales(params);
  }
  if (cleanUrl === '/reports/profit-loss' && method === 'get') {
    return handlers.reports.profitLoss(params);
  }
  const reportExportType = matchId('/reports/export/:type', cleanUrl);
  if (reportExportType && method === 'get') {
    return handlers.reports.export(reportExportType, params.fiscal_year, params.format);
  }

  // Default fallback (404)
  throw { status: 404, message: `Mock route not found for [${method.toUpperCase()}] ${cleanUrl}` };
}
