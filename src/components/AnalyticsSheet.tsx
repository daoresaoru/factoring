import React from 'react';
import { FactoringInvoice, BrokerSummary } from '../types';
import { formatCurrency } from '../utils/factoringUtils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  ShieldAlert, 
  PieChart as PieIcon, 
  BarChart3, 
  CalendarDays,
  Clock
} from 'lucide-react';

interface AnalyticsSheetProps {
  invoices: FactoringInvoice[];
  brokerSummaries: BrokerSummary[];
  lang: 'ru' | 'en';
}

export const AnalyticsSheet: React.FC<AnalyticsSheetProps> = ({
  invoices,
  brokerSummaries,
  lang,
}) => {
  // Aging buckets based on upload/payback dates
  const aging = {
    current: 0,   // 0-30 days
    days30: 0,    // 31-60 days
    days60: 0,    // 61-90 days
    days90Plus: 0, // 90+ days
  };

  const now = new Date('2026-07-30');

  invoices.forEach(inv => {
    if (inv.status !== 'released') {
      const upload = new Date(inv.uploadDate);
      const diffTime = Math.abs(now.getTime() - upload.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) aging.current += inv.invoiceAmount;
      else if (diffDays <= 60) aging.days30 += inv.invoiceAmount;
      else if (diffDays <= 90) aging.days60 += inv.invoiceAmount;
      else aging.days90Plus += inv.invoiceAmount;
    }
  });

  // Recharts Monthly Volume Data
  const monthlyData = [
    {
      month: lang === 'ru' ? 'Май' : 'May',
      Invoices: 18500,
      Purchases: 16650,
      QbBank: 16650,
    },
    {
      month: lang === 'ru' ? 'Июнь' : 'June',
      Invoices: 24200,
      Purchases: 21780,
      QbBank: 21780,
    },
    {
      month: lang === 'ru' ? 'Июль' : 'July',
      Invoices: invoices.reduce((s, i) => s + i.invoiceAmount, 0),
      Purchases: invoices.reduce((s, i) => s + i.purchaseAmount, 0),
      QbBank: invoices.reduce((s, i) => s + i.qbBankDeposit, 0),
    }
  ];

  // Pie chart data for reserve status
  const totalReserve = invoices.reduce((s, i) => s + i.reserveAmount, 0);
  const releasedReserve = invoices.reduce((s, i) => s + i.reserveRefund, 0);
  const chargebacks = invoices.reduce((s, i) => s + i.chargebackAmount, 0);
  const pendingReserve = Math.max(0, totalReserve - releasedReserve - chargebacks);

  const reservePieData = [
    { name: lang === 'ru' ? 'Возвращенный резерв' : 'Released Reserve', value: releasedReserve, color: '#10b981' },
    { name: lang === 'ru' ? 'Резерв в ожидании' : 'Pending Reserve', value: pendingReserve, color: '#f59e0b' },
    { name: lang === 'ru' ? 'Чарджбэк' : 'Chargeback', value: chargebacks, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span>{lang === 'ru' ? 'Аналитика и Выдержка факторинга' : 'Factoring Analytics & Aging'}</span>
          </h2>
          <p className="text-xs text-slate-500">
            {lang === 'ru'
              ? 'Глубокий анализ старения задолженности, структуры резервов и прибыльности по брокерам'
              : 'Aging schedule, reserve distribution breakdown, and broker volume trends'}
          </p>
        </div>
      </div>

      {/* 1. Aging Matrix (Выдержка по срокам оплаты) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {lang === 'ru' ? 'Выдержка по срокам задолженности (Aging Report)' : 'Broker Aging Matrix (Unreleased Invoices)'}
            </h3>
          </div>
          <span className="text-xs text-slate-500">{lang === 'ru' ? 'Сроки от даты загрузки' : 'Age relative to upload'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
            <div className="text-xs font-semibold text-emerald-800 uppercase">0 - 30 {lang === 'ru' ? 'Дней' : 'Days'}</div>
            <div className="text-2xl font-black text-emerald-900 mt-1">{formatCurrency(aging.current)}</div>
            <p className="text-[11px] text-emerald-700 mt-1">{lang === 'ru' ? 'Текущая активная задолженность' : 'Standard active cycle'}</p>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
            <div className="text-xs font-semibold text-amber-800 uppercase">31 - 60 {lang === 'ru' ? 'Дней' : 'Days'}</div>
            <div className="text-2xl font-black text-amber-900 mt-1">{formatCurrency(aging.days30)}</div>
            <p className="text-[11px] text-amber-700 mt-1">{lang === 'ru' ? 'Умеренная просрочка' : 'Moderate aging'}</p>
          </div>

          <div className="bg-orange-50/60 border border-orange-200 rounded-xl p-4">
            <div className="text-xs font-semibold text-orange-800 uppercase">61 - 90 {lang === 'ru' ? 'Дней' : 'Days'}</div>
            <div className="text-2xl font-black text-orange-900 mt-1">{formatCurrency(aging.days60)}</div>
            <p className="text-[11px] text-orange-700 mt-1">{lang === 'ru' ? 'Высокий риск задержки' : 'High delay risk'}</p>
          </div>

          <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4">
            <div className="text-xs font-semibold text-rose-800 uppercase">90+ {lang === 'ru' ? 'Дней (Просрочено)' : 'Days (Overdue)'}</div>
            <div className="text-2xl font-black text-rose-900 mt-1">{formatCurrency(aging.days90Plus)}</div>
            <p className="text-[11px] text-rose-700 mt-1">{lang === 'ru' ? 'Критический чарджбэк риск' : 'Critical chargeback alert'}</p>
          </div>

        </div>
      </div>

      {/* 2. Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Chart 1: Volume Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'ru' ? 'Динамика объемов: Инвойсы vs Выкуп vs Банк QB' : 'Monthly Volume vs Bank Deposits'}</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            {lang === 'ru' ? 'Сравнение общей суммы инвойсов и фактических выплат в банк' : 'Comparing total invoice volume against bank deposits'}
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Invoices" fill="#3b82f6" radius={[4, 4, 0, 0]} name={lang === 'ru' ? 'Сумма Инвойсов' : 'Invoice Amount'} />
                <Bar dataKey="Purchases" fill="#6366f1" radius={[4, 4, 0, 0]} name={lang === 'ru' ? 'Выкуп (Purchases)' : 'Purchases'} />
                <Bar dataKey="QbBank" fill="#10b981" radius={[4, 4, 0, 0]} name={lang === 'ru' ? 'Банк QB' : 'QB Bank'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Reserve Breakdown Pie */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-600" />
            <span>{lang === 'ru' ? 'Статус Резерва' : 'Reserve Status'}</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            {lang === 'ru' ? 'Возвращен / В ожидании / Чарджбэк' : 'Status of held reserve funds'}
          </p>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reservePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {reservePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => formatCurrency(val)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2 text-xs">
            {reservePieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-slate-900">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
