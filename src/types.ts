export type FactoringStatus = 
  | 'uploaded'      // Загружен в факторинг
  | 'purchased'     // Выкуплен факторингом (Advanced)
  | 'bank_received' // Поступили деньги в банк / QB
  | 'broker_paid'   // Брокер оплатил
  | 'released'      // Резерв возвращен (Reserve Refunded)
  | 'chargeback';   // Чарджбэк / Оспорен

export interface FactoringInvoice {
  id: string;
  invoiceNumber: string;    // № Инвойса
  loadNumber: string;       // № Груза / Load #
  brokerName: string;       // Брокер / Заказчик

  // Dates (Даты)
  uploadDate: string;       // Дата загрузки в факторинг (Invoice / Factor Upload Date)
  purchaseDate: string;     // Дата покупки факторингом (Purchase / Advance Date)
  qbBankDate: string;       // Дата поступления денег на банк QB (QB / Bank Deposit Date)
  brokerPaybackDate: string;// Дата возврата денег с брокеров / оплата брокером (Broker Payback Date)

  // Financial Amounts ($)
  invoiceAmount: number;    // Сумма инвойса ($)
  purchaseAmount: number;   // Сумма выкупа/покупки ($)
  qbBankDeposit: number;    // Сумма полученная на банк QB ($)
  reserveAmount: number;    // Сумма резерва ($)
  reservePercentage: number;// % резерва
  reserveRefund: number;    // Сумма возврата резерва ($ - меняется ежедневно)
  factoringFeePercent: number; // % услуг факторинга
  factoringFeeAmount: number;  // Сумма услуг факторинга ($)
  chargebackAmount: number;    // Сумма charge back ($)

  status: FactoringStatus;
  notes: string;            // Заметки / Комментарии
  lastUpdated: string;
}

export type TimePeriodOption = 
  | 'all'
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'year_to_date'
  | 'custom';

export interface DateFilter {
  period: TimePeriodOption;
  startDate?: string;
  endDate?: string;
}

export interface FactoringSummaryMetrics {
  totalInvoiceAmount: number;      // Сумма инвойсов
  totalPurchaseAmount: number;     // Сумма выкупа
  totalQbBankDeposit: number;      // Сумма полученная на банк QB
  totalReserveAmount: number;      // Сумма резерва
  averageReservePercent: number;   // Средний % резерва
  totalReserveRefund: number;      // Сумма возврата резерва (меняется)
  totalFactoringFeeAmount: number; // Сумма услуг факторинга
  averageFactoringFeePercent: number; // Средний % услуг факторинга
  totalChargebackAmount: number;   // Сумма chargeback
  invoiceCount: number;
  pendingRefundCount: number;
  activeChargebackCount: number;
}

export interface BrokerSummary {
  brokerName: string;
  invoiceCount: number;
  totalInvoiceAmount: number;
  totalPurchaseAmount: number;
  totalQbBankDeposit: number;
  totalReserveAmount: number;
  totalReserveRefund: number;
  totalFactoringFee: number;
  totalChargeback: number;
  averageDaysToPay: number;
}

export interface FormulaConfig {
  defaultReservePercent: number;    // e.g. 10%
  defaultFactoringFeePercent: number; // e.g. 2.5%
}
