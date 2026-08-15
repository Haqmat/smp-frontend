/** Format a number as Ethiopian Birr currency: Br 1,234.50 */
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) return 'Br 0.00';
  return `Br ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Format a number with commas: 1,234.00 */
export function formatNumber(value: number | undefined | null, decimals = 2): string {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Format a percentage: 12.5% */
export function formatPercentage(value: number | undefined | null, decimals = 1): string {
  if (value === undefined || value === null) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/** Format a change percentage with sign: +12.5% or -3.2% */
export function formatChangePercentage(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/** Format kg/kilo quantities: 1,234.50 kg */
export function formatQuantity(value: number | undefined | null, unit = 'kg'): string {
  if (value === undefined || value === null) return `0 ${unit}`;
  return `${formatNumber(value, 2)} ${unit}`;
}

/** Format an Ethiopian date string YYYY-MM-DD for display */
export function formatEthiopianDateDisplay(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  return dateString;
}

/** Format a Gregorian ISO timestamp as a short date: Nov 14, 2025 */
export function formatGregorianDate(isoString: string | undefined | null): string {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

/** Format a Gregorian ISO timestamp as a time: 2:30 PM */
export function formatTime(isoString: string | undefined | null): string {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/** Format a Gregorian ISO timestamp as date + time */
export function formatDateTime(isoString: string | undefined | null): string {
  if (!isoString) return '—';
  return `${formatGregorianDate(isoString)} ${formatTime(isoString)}`;
}

/** Format a role string for display */
export function formatRole(role: string): string {
  const map: Record<string, string> = {
    ADMIN: 'Admin',
    SALES: 'Sales',
    MANAGER: 'Manager',
    AUDITOR: 'Auditor',
  };
  return map[role] ?? role;
}

/** Format expense category for display */
export function formatCategory(category: string): string {
  const map: Record<string, string> = {
    TRANSPORT: 'Transport',
    SALARY: 'Salary',
    UTILITY: 'Utility',
    OTHER: 'Other',
  };
  return map[category] ?? category;
}

/** Format payment method for display */
export function formatPaymentMethod(method: string | undefined | null): string {
  if (!method) return '—';
  const map: Record<string, string> = {
    CASH: 'Cash',
    BANK_TRANSFER: 'Bank Transfer',
    MOBILE_MONEY: 'Mobile Money',
  };
  return map[method] ?? method;
}

/** Format movement type for display */
export function formatMovementType(type: string): string {
  const map: Record<string, string> = {
    INTAKE: 'Grain Intake',
    MILLING_INPUT: 'Milling (Input)',
    MILLING_OUTPUT: 'Milling (Output)',
    SALE: 'Sale',
  };
  return map[type] ?? type;
}

/** Truncate a string to N chars with ellipsis */
export function truncate(str: string, length = 40): string {
  return str.length > length ? str.slice(0, length) + '…' : str;
}
