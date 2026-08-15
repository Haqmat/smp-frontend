/**
 * Ethiopian Calendar Utility
 * Converts between Ethiopian (Ge'ez) and Gregorian calendars.
 *
 * Ethiopian calendar epoch (1 Meskerem, Year 1) = Julian Aug 29, AD 8
 * JDN of epoch = 1724221
 *
 * Ethiopian leap year: year divisible by 4 (Pagume has 6 days instead of 5)
 */

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
}

const ET_EPOCH_JDN = 1724221;

const MONTH_NAMES_AM = [
  'መስከረም', 'ጥቅምቲ', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ',
];

const MONTH_NAMES_EN = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
  'Megabit', 'Miyazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume',
];

/** Convert Ethiopian date to Julian Day Number */
function toJDN(year: number, month: number, day: number): number {
  return ET_EPOCH_JDN + (year - 1) * 365 + Math.floor((year - 1) / 4) + (month - 1) * 30 + day - 1;
}

/** Convert Julian Day Number to Gregorian {year, month, day} */
function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

/** Convert Gregorian Date object to Julian Day Number */
function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

/** Convert JDN to Ethiopian date */
function jdnToEthiopian(jdn: number): EthiopianDate {
  const r = jdn - ET_EPOCH_JDN;
  const n = r % 1461; // days within 4-year cycle
  const q = Math.floor(r / 1461); // complete 4-year cycles

  let year: number;
  let dayInYear: number;

  if (n < 365) {
    year = 4 * q + 1;
    dayInYear = n;
  } else if (n < 730) {
    year = 4 * q + 2;
    dayInYear = n - 365;
  } else if (n < 1095) {
    year = 4 * q + 3;
    dayInYear = n - 730;
  } else {
    year = 4 * q + 4;
    dayInYear = n - 1095;
  }

  const month = Math.floor(dayInYear / 30) + 1;
  const day = (dayInYear % 30) + 1;

  return { year, month, day };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Convert a Gregorian JS Date to an EthiopianDate */
export function toEthiopian(gregorianDate: Date): EthiopianDate {
  const jdn = gregorianToJDN(
    gregorianDate.getFullYear(),
    gregorianDate.getMonth() + 1,
    gregorianDate.getDate(),
  );
  return jdnToEthiopian(jdn);
}

/** Convert an EthiopianDate to a Gregorian JS Date */
export function toGregorian(ethiopianDate: EthiopianDate): Date {
  const jdn = toJDN(ethiopianDate.year, ethiopianDate.month, ethiopianDate.day);
  const { year, month, day } = jdnToGregorian(jdn);
  return new Date(year, month - 1, day);
}

/** Format Ethiopian date as YYYY-MM-DD string */
export function formatEthiopian(
  eth: EthiopianDate,
  fmt: 'YYYY-MM-DD' | 'D MMM YYYY' = 'YYYY-MM-DD',
): string {
  const y = String(eth.year).padStart(4, '0');
  const m = String(eth.month).padStart(2, '0');
  const d = String(eth.day).padStart(2, '0');
  if (fmt === 'YYYY-MM-DD') return `${y}-${m}-${d}`;
  return `${eth.day} ${MONTH_NAMES_EN[eth.month - 1]} ${eth.year}`;
}

/** Return today's Ethiopian date */
export function getTodayEthiopian(): EthiopianDate {
  return toEthiopian(new Date());
}

/** Return today as YYYY-MM-DD Ethiopian string */
export function getTodayEthiopianString(): string {
  return formatEthiopian(getTodayEthiopian());
}

/** Parse YYYY-MM-DD Ethiopian string into EthiopianDate */
export function parseEthiopianDateString(dateString: string): EthiopianDate {
  const [year, month, day] = dateString.split('-').map(Number);
  return { year, month, day };
}

/** Validate Ethiopian date string format and value */
export function isValidEthiopianDate(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const { year, month, day } = parseEthiopianDateString(dateString);
  if (month < 1 || month > 13) return false;
  if (month <= 12 && (day < 1 || day > 30)) return false;
  if (month === 13) {
    const isLeap = year % 4 === 0;
    if (day < 1 || day > (isLeap ? 6 : 5)) return false;
  }
  return true;
}

/** Get Amharic month name */
export function getEthiopianMonthName(month: number, lang: 'am' | 'en' = 'en'): string {
  if (month < 1 || month > 13) return '';
  return lang === 'am' ? MONTH_NAMES_AM[month - 1] : MONTH_NAMES_EN[month - 1];
}

/** Get all month names */
export function getEthiopianMonthNames(lang: 'am' | 'en' = 'en'): string[] {
  return lang === 'am' ? MONTH_NAMES_AM : MONTH_NAMES_EN;
}

/** Number of days in a given Ethiopian month */
export function daysInEthiopianMonth(year: number, month: number): number {
  if (month <= 12) return 30;
  return year % 4 === 0 ? 6 : 5; // Pagume
}

/** Compare two Ethiopian date strings. Returns -1, 0, or 1 */
export function compareEthiopianDates(a: string, b: string): -1 | 0 | 1 {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** Format for display: shows "YYYY-MM-DD (Mon D, YYYY Gregorian)" */
export function formatEthiopianWithGregorian(ethString: string): string {
  if (!isValidEthiopianDate(ethString)) return ethString;
  const eth = parseEthiopianDateString(ethString);
  const greg = toGregorian(eth);
  const gregFormatted = greg.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${ethString} (${gregFormatted})`;
}

/** Get fiscal year label, e.g. "2018/2019" */
export function getFiscalYearLabel(year: number): string {
  return `${year}/${year + 1}`;
}

/** Get array of fiscal years from 2015 to current ET year + 1 */
export function getAvailableFiscalYears(): number[] {
  const currentEt = getTodayEthiopian();
  const years: number[] = [];
  for (let y = 2015; y <= currentEt.year; y++) {
    years.push(y);
  }
  return years.reverse();
}
