import { FactoringInvoice, FactoringSummaryMetrics, DateFilter, BrokerSummary } from '../types';

/**
 * Filter invoices based on selected period
 */
export function filterInvoicesByDate(invoices: FactoringInvoice[], filter: DateFilter): FactoringInvoice[] {
  if (filter.period === 'all') return invoices;

  const now = new Date('2026-07-30T12:00:00Z'); // Current simulated date
  const todayStr = '2026-07-30';

  return invoices.filter(inv => {
    const uploadDate = new Date(inv.uploadDate);
    const invDateStr = inv.uploadDate;

    switch (filter.period) {
      case 'today':
        return invDateStr === todayStr;

      case 'yesterday': {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yStr = yesterday.toISOString().split('T')[0];
        return invDateStr === yStr;
      }

      case 'this_week': {
        // Monday of current week
        const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (dayOfWeek - 1));
        monday.setHours(0, 0, 0, 0);
        return uploadDate >= monday;
      }

      case 'this_month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return uploadDate >= startOfMonth;
      }

      case 'last_month': {
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        return uploadDate >= startOfLastMonth && uploadDate <= endOfLastMonth;
      }

      case 'this_quarter': {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
        return uploadDate >= startOfQuarter;
      }

      case 'year_to_date': {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return uploadDate >= startOfYear;
      }

      case 'custom': {
        if (filter.startDate && filter.endDate) {
          const start = new Date(filter.startDate);
          const end = new Date(filter.endDate);
          end.setHours(23, 59, 59);
          return uploadDate >= start && uploadDate <= end;
        }
        return true;
      }

      default:
        return true;
    }
  });
}

/**
 * Calculate Summary Metrics using strict dynamic formulas across all selected invoices
 */
export function calculateMetrics(invoices: FactoringInvoice[]): FactoringSummaryMetrics {
  const totalInvoiceAmount = invoices.reduce((sum, item) => sum + item.invoiceAmount, 0);
  const totalPurchaseAmount = invoices.reduce((sum, item) => sum + item.purchaseAmount, 0);
  const totalQbBankDeposit = invoices.reduce((sum, item) => sum + item.qbBankDeposit, 0);
  const totalReserveAmount = invoices.reduce((sum, item) => sum + item.reserveAmount, 0);
  const totalReserveRefund = invoices.reduce((sum, item) => sum + item.reserveRefund, 0);
  const totalFactoringFeeAmount = invoices.reduce((sum, item) => sum + item.factoringFeeAmount, 0);
  const totalChargebackAmount = invoices.reduce((sum, item) => sum + item.chargebackAmount, 0);

  const averageReservePercent = totalInvoiceAmount > 0 
    ? (totalReserveAmount / totalInvoiceAmount) * 100 
    : 0;

  const averageFactoringFeePercent = totalInvoiceAmount > 0 
    ? (totalFactoringFeeAmount / totalInvoiceAmount) * 100 
    : 0;

  const pendingRefundCount = invoices.filter(i => i.status !== 'released' && i.reserveAmount > 0).length;
  const activeChargebackCount = invoices.filter(i => i.chargebackAmount > 0).length;

  return {
    totalInvoiceAmount,
    totalPurchaseAmount,
    totalQbBankDeposit,
    totalReserveAmount,
    averageReservePercent,
    totalReserveRefund,
    totalFactoringFeeAmount,
    averageFactoringFeePercent,
    totalChargebackAmount,
    invoiceCount: invoices.length,
    pendingRefundCount,
    activeChargebackCount
  };
}

/**
 * Group and aggregate invoices by Broker Name
 */
export function getBrokerSummaries(invoices: FactoringInvoice[]): BrokerSummary[] {
  const map = new Map<string, BrokerSummary>();

  for (const inv of invoices) {
    const key = inv.brokerName || 'Unknown Broker';
    const existing = map.get(key) || {
      brokerName: key,
      invoiceCount: 0,
      totalInvoiceAmount: 0,
      totalPurchaseAmount: 0,
      totalQbBankDeposit: 0,
      totalReserveAmount: 0,
      totalReserveRefund: 0,
      totalFactoringFee: 0,
      totalChargeback: 0,
      averageDaysToPay: 25,
    };

    existing.invoiceCount += 1;
    existing.totalInvoiceAmount += inv.invoiceAmount;
    existing.totalPurchaseAmount += inv.purchaseAmount;
    existing.totalQbBankDeposit += inv.qbBankDeposit;
    existing.totalReserveAmount += inv.reserveAmount;
    existing.totalReserveRefund += inv.reserveRefund;
    existing.totalFactoringFee += inv.factoringFeeAmount;
    existing.totalChargeback += inv.chargebackAmount;

    map.set(key, existing);
  }

  return Array.from(map.values()).sort((a, b) => b.totalInvoiceAmount - a.totalInvoiceAmount);
}

/**
 * Auto-calculate formulas for a single factoring invoice row
 */
export function recalculateInvoiceRow(
  partial: Partial<FactoringInvoice>, 
  defaultReservePct = 10, 
  defaultFeePct = 2.5
): Partial<FactoringInvoice> {
  const invAmt = partial.invoiceAmount ?? 0;
  const resPct = partial.reservePercentage ?? defaultReservePct;
  const feePct = partial.factoringFeePercent ?? defaultFeePct;

  const reserveAmount = Math.round((invAmt * (resPct / 100)) * 100) / 100;
  const purchaseAmount = Math.round((invAmt - reserveAmount) * 100) / 100;
  const feeAmount = Math.round((invAmt * (feePct / 100)) * 100) / 100;
  
  // Bank deposit is usually the purchase amount if status is funded
  let qbBankDeposit = partial.qbBankDeposit ?? 0;
  if (partial.status && partial.status !== 'uploaded' && qbBankDeposit === 0) {
    qbBankDeposit = purchaseAmount;
  }

  const chargeback = partial.chargebackAmount ?? 0;

  // Reserve refund changes daily based on status:
  let reserveRefund = partial.reserveRefund ?? 0;
  if (partial.status === 'released' || partial.status === 'broker_paid') {
    reserveRefund = Math.max(0, Math.round((reserveAmount - chargeback) * 100) / 100);
  }

  return {
    ...partial,
    reservePercentage: resPct,
    factoringFeePercent: feePct,
    reserveAmount,
    purchaseAmount,
    factoringFeeAmount: feeAmount,
    qbBankDeposit,
    reserveRefund,
  };
}

/**
 * Format currency in USD with commas
 */
export function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val || 0);
}

/**
 * Format date string YYYY-MM-DD into readable date
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Export invoices to CSV file
 */
export function exportInvoicesToCSV(invoices: FactoringInvoice[]): void {
  const headers = [
    'Invoice Number',
    'Load Number',
    'Broker Name',
    'Upload Date (Дата загрузки)',
    'Purchase Date (Дата покупки)',
    'QB Bank Date (Дата банка QB)',
    'Broker Payback Date (Дата возврата от брокера)',
    'Invoice Amount ($)',
    'Purchase Amount ($)',
    'QB Bank Deposit ($)',
    'Reserve Amount ($)',
    'Reserve %',
    'Reserve Refund ($)',
    'Factoring Fee %',
    'Factoring Fee ($)',
    'Chargeback ($)',
    'Status',
    'Notes'
  ];

  const rows = invoices.map(i => [
    `"${i.invoiceNumber}"`,
    `"${i.loadNumber}"`,
    `"${i.brokerName}"`,
    `"${i.uploadDate}"`,
    `"${i.purchaseDate}"`,
    `"${i.qbBankDate}"`,
    `"${i.brokerPaybackDate}"`,
    i.invoiceAmount.toFixed(2),
    i.purchaseAmount.toFixed(2),
    i.qbBankDeposit.toFixed(2),
    i.reserveAmount.toFixed(2),
    i.reservePercentage.toFixed(1),
    i.reserveRefund.toFixed(2),
    i.factoringFeePercent.toFixed(1),
    i.factoringFeeAmount.toFixed(2),
    i.chargebackAmount.toFixed(2),
    `"${i.status}"`,
    `"${(i.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Factoring_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
