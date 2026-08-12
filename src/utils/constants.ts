export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.haqmat.com/api/v1',
  TIMEOUT: 30000,
  IDEMPOTENCY_KEY_PREFIX: import.meta.env.VITE_IDEMPOTENCY_KEY_PREFIX || 'haqmat',
};

export const ROLES = {
  ADMIN: 'ADMIN',
  SALES: 'SALES',
  MANAGER: 'MANAGER',
  AUDITOR: 'AUDITOR',
} as const;

export const PRODUCT_TYPES = {
  RAW_GRAIN: 'RAW_GRAIN',
  FINISHED_FLOUR: 'FINISHED_FLOUR',
} as const;

export const EXPENSE_CATEGORIES = {
  TRANSPORT: 'TRANSPORT',
  SALARY: 'SALARY',
  UTILITY: 'UTILITY',
  OTHER: 'OTHER',
} as const;

export const PAYMENT_METHODS = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  MOBILE_MONEY: 'MOBILE_MONEY',
} as const;

export const STOCK_MOVEMENT_TYPES = {
  INTAKE: 'INTAKE',
  MILLING_INPUT: 'MILLING_INPUT',
  MILLING_OUTPUT: 'MILLING_OUTPUT',
  SALE: 'SALE',
} as const;