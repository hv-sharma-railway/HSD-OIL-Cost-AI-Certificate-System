import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PriceData } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes period price data:
 * Ensures all components are whole integers and that
 * base_price + excise + vat + overhead === all_inclusive_rate.
 */
export function normalizePeriodPrice(data: {
  base_price: number;
  excise: number;
  vat: number;
  overhead?: number;
  other_charges?: number;
  freight?: number;
  discount?: number;
  all_inclusive_rate?: number;
  pdf_base64?: string;
}): PriceData {
  const base = Math.round(Number(data.base_price) || 0);
  const excise = Math.round(Number(data.excise) || 0);
  const vat = Math.round(Number(data.vat) || 0);

  let overhead = 0;
  if (data.overhead !== undefined) {
    overhead = Math.round(Number(data.overhead) || 0);
  } else {
    const other = Number(data.other_charges) || 0;
    const freight = Number(data.freight) || 0;
    const discount = Number(data.discount) || 0;
    overhead = Math.round((other + freight) - discount);
  }

  if (data.all_inclusive_rate !== undefined && data.all_inclusive_rate > 0) {
    const targetAllInclusive = Math.round(Number(data.all_inclusive_rate));
    const currentSum = base + excise + vat + overhead;
    const diff = targetAllInclusive - currentSum;
    overhead += diff;
  }

  return {
    base_price: base,
    excise: excise,
    vat: vat,
    overhead: overhead,
    pdf_base64: data.pdf_base64
  };
}

/**
 * Calculates the Average period row for Price Master:
 * Rules per Western Railway finance specifications:
 * 1. All 3 rows (p1, p2, average) have to be integers.
 * 2. Total rate of 1st-15th meets the all-inclusive rate of the uploaded document.
 * 3. Total rate of 16th-End meets the all-inclusive rate of the uploaded document.
 * 4. Average row total rate must NOT exceed the true mathematical average (uses Math.floor).
 *    "making sure it doesnt ask for more than average in total rate... and if rounded up, doesnt have to increase the All Inclusive Rate".
 * 5. Values are whole integers, no halves or thirds.
 */
export function calculateAveragePeriod(p1: PriceData, p2: PriceData): PriceData {
  const t1 = Math.round(p1.base_price + p1.excise + p1.vat + p1.overhead);
  const t2 = Math.round(p2.base_price + p2.excise + p2.vat + p2.overhead);

  if (t1 === 0 && t2 > 0) return { ...p2 };
  if (t2 === 0 && t1 > 0) return { ...p1 };
  if (t1 === 0 && t2 === 0) {
    return { base_price: 0, excise: 0, vat: 0, overhead: 0 };
  }

  // Maximum allowed average total rate, strictly <= (t1 + t2) / 2
  const targetAvgTotal = Math.floor((t1 + t2) / 2);

  const avgBase = Math.round((p1.base_price + p2.base_price) / 2);
  const avgExcise = Math.round((p1.excise + p2.excise) / 2);
  const avgVat = Math.round((p1.vat + p2.vat) / 2);
  const avgOverhead = targetAvgTotal - (avgBase + avgExcise + avgVat);

  return {
    base_price: avgBase,
    excise: avgExcise,
    vat: avgVat,
    overhead: avgOverhead,
  };
}
