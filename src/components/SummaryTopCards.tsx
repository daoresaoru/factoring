import React from 'react';
import { 
  FileText, 
  ShoppingBag, 
  Landmark, 
  Lock, 
  RotateCcw, 
  Percent, 
  AlertTriangle, 
  MessageSquareText, 
  TrendingUp,
  Info
} from 'lucide-react';
import { FactoringSummaryMetrics } from '../types';
import { formatCurrency } from '../utils/factoringUtils';

interface SummaryTopCardsProps {
  metrics: FactoringSummaryMetrics;
  lang: 'ru' | 'en';
  latestNotes?: string[];
}

export const SummaryTopCards: React.FC<SummaryTopCardsProps> = ({ metrics, lang, latestNotes = [] }) => {
  return (
    <div className="space-y-4">
      {/* Top Section Header with Formula Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>{lang === 'ru' ? 'Сводка факторинга' : 'Factoring Executive Summary'}</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5">
              {lang === 'ru' ? 'Авто-формулы из журнала' : 'Auto-Calculated Formulas'}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {lang === 'ru'
              ? 'Все показания суммируются и высчитываются из таблицы 2 листа в реальном времени'
              : 'All totals dynamically pulled and calculated from Sheet 2 in real-time'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-lg">
          <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {lang === 'ru' ? 'Инвойсов в выбранном периоде:' : 'Invoices in filter:'} <strong>{metrics.invoiceCount}</strong>
          </span>
        </div>
      </div>

      {/* Main Grid of 8 KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* 1. Summa Invoica (Total Invoice Amount) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2 h-full bg-blue-500" />
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {lang === 'ru' ? 'Сумма инвойсов' : 'Invoice Amount'}
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(metrics.totalInvoiceAmount)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{lang === 'ru' ? 'Всего загружено' : 'Total Factor Uploads'}</span>
            <span className="font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              {metrics.invoiceCount} {lang === 'ru' ? 'шт' : 'inv'}
            </span>
          </div>
        </div>

        {/* 2. Summa Purchases (Total Purchases / Advanced Amount) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500" />
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {lang === 'ru' ? 'Сумма покупки (Purchases)' : 'Purchases Amount'}
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(metrics.totalPurchaseAmount)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{lang === 'ru' ? 'Выкуплено факторингом' : 'Advanced by Factor'}</span>
            <span className="font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
              {metrics.totalInvoiceAmount > 0 
                ? ((metrics.totalPurchaseAmount / metrics.totalInvoiceAmount) * 100).toFixed(1) 
                : '0'}%
            </span>
          </div>
        </div>

        {/* 3. Summa Poluchennaya na Bank, QB (QB Bank Deposit) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {lang === 'ru' ? 'Получено на банк (QB)' : 'QB Bank Deposit'}
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 tracking-tight">
            {formatCurrency(metrics.totalQbBankDeposit)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{lang === 'ru' ? 'Факт поступления' : 'Cleared in Bank'}</span>
            <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
              ✓ QB Synced
            </span>
          </div>
        </div>

        {/* 4. Summa Reserva & % Reserve */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {lang === 'ru' ? 'Сумма резерва & %' : 'Reserve Amount & %'}
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-800 tracking-tight">
            {formatCurrency(metrics.totalReserveAmount)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{lang === 'ru' ? 'Удержанный резерв' : 'Held in Reserve'}</span>
            <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              {metrics.averageReservePercent.toFixed(1)}% {lang === 'ru' ? 'резерв' : 'reserve'}
            </span>
          </div>
        </div>

        {/* 5. Summa Vozvrata (Reserve Refund - Changing Daily!) */}
        <div className="bg-gradient-to-br from-teal-900 to-slate-900 rounded-xl border border-teal-700/50 p-4 shadow-md text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2 h-full bg-teal-400" />
          <div className="flex items-center justify-between text-teal-200 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5 text-teal-400 animate-spin-slow" />
              {lang === 'ru' ? 'Сумма возврата (Daily)' : 'Reserve Refund (Daily)'}
            </span>
            <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-1.5 py-0.5 rounded font-mono">
              {lang === 'ru' ? 'Ежедневная' : 'Live Daily'}
            </span>
          </div>
          <div className="text-2xl font-black text-teal-300 tracking-tight">
            {formatCurrency(metrics.totalReserveRefund)}
          </div>
          <div className="mt-2 text-xs text-teal-200/80 flex items-center justify-between">
            <span>{lang === 'ru' ? 'Возвращено брокерами' : 'Refunded from brokers'}</span>
            <span className="text-xs text-teal-300 font-medium">
              {lang === 'ru' ? 'Меняется ежедневно' : 'Daily updating'}
            </span>
          </div>
        </div>

        {/* 6. Factoring Fee % & Amount */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2 h-full bg-violet-500" />
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {lang === 'ru' ? '% и комиссия факторинга' : 'Factoring Fee % & Amount'}
            </span>
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(metrics.totalFactoringFeeAmount)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{lang === 'ru' ? 'Комиссия услуги' : 'Average Fee Rate'}</span>
            <span className="font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
              ~{metrics.averageFactoringFeePercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* 7. Charge Back Amount */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {lang === 'ru' ? 'Сумма Charge Back' : 'Charge Back Amount'}
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 tracking-tight">
            {formatCurrency(metrics.totalChargebackAmount)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{lang === 'ru' ? 'Оспорено / Вычтено' : 'Disputed Amount'}</span>
            <span className={`px-2 py-0.5 rounded font-bold ${
              metrics.totalChargebackAmount > 0 
                ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                : 'bg-emerald-50 text-emerald-700'
            }`}>
              {metrics.activeChargebackCount} {lang === 'ru' ? 'чарджбэк' : 'claims'}
            </span>
          </div>
        </div>

        {/* 8. Notes & Comments Widget */}
        <div className="bg-slate-900 text-slate-200 rounded-xl border border-slate-800 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <MessageSquareText className="w-3.5 h-3.5" />
                {lang === 'ru' ? 'Заметки & Комментарии' : 'Notes & Remarks'}
              </span>
              <Info className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <p className="text-xs text-slate-300 italic line-clamp-2">
              "{latestNotes[0] || (lang === 'ru' ? 'Все инвойсы сверяются ежедневно с реестром банка.' : 'All invoices reconciled daily with bank statement.')}"
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{lang === 'ru' ? 'Активные комментарии' : 'Recent audit log'}</span>
            <span className="text-emerald-400 font-medium">Updated live</span>
          </div>
        </div>

      </div>
    </div>
  );
};
