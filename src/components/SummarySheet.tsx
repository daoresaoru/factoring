import React, { useState } from 'react';
import { FactoringSummaryMetrics, BrokerSummary, FactoringInvoice } from '../types';
import { SummaryTopCards } from './SummaryTopCards';
import { formatCurrency } from '../utils/factoringUtils';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Plus, 
  MessageSquare,
  Sparkles,
  Calculator
} from 'lucide-react';

interface SummarySheetProps {
  metrics: FactoringSummaryMetrics;
  brokerSummaries: BrokerSummary[];
  invoices: FactoringInvoice[];
  lang: 'ru' | 'en';
  onNavigateToDataEntry: () => void;
}

export const SummarySheet: React.FC<SummarySheetProps> = ({
  metrics,
  brokerSummaries,
  invoices,
  lang,
  onNavigateToDataEntry,
}) => {
  const [globalNotes, setGlobalNotes] = useState<string[]>([
    'Проверена сверка с банком за июль 2026. Ошибок расхождения не обнаружено.',
    'Ожидается выплата резерва от C.H. Robinson на следующей неделе.',
  ]);
  const [newNote, setNewNote] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setGlobalNotes([newNote.trim(), ...globalNotes]);
    setNewNote('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Cards Bar */}
      <SummaryTopCards 
        metrics={metrics} 
        lang={lang} 
        latestNotes={globalNotes} 
      />

      {/* Formula Relation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-5 text-white shadow-lg border border-slate-700/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-slate-100">
                {lang === 'ru' 
                  ? 'Динамическая протяжка формул со 2-го листа (Журнал инвойсов)' 
                  : 'Dynamic Formula Sync from Sheet 2 (Invoice Log)'}
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'ru'
                ? 'Все итоговые показатели вверху и в таблице брокеров связываются формулами с ежедневными строками. Каждая запись инвойса автоматически пересчитывает Сумму Покупки, Резерв, Комиссию и Ежедневный Возврат.'
                : 'All top KPI values & broker aggregates pull automatically from individual daily entries. Each load automatically calculates Purchase, Reserve, Fee, and Daily Refund.'}
            </p>
          </div>

          <button
            onClick={onNavigateToDataEntry}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer shrink-0"
          >
            <span>{lang === 'ru' ? 'Перейти в Журнал Ввода →' : 'Go to Daily Invoices Log →'}</span>
          </button>
        </div>

        {/* Dynamic Formula Flow Diagram */}
        <div className="mt-4 pt-4 border-t border-slate-700/60 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase">{lang === 'ru' ? 'Формула Покупки' : 'Purchase Formula'}</span>
            <span className="font-mono text-emerald-300 font-bold">Invoices - Reserve</span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase">{lang === 'ru' ? 'Формула Резерва' : 'Reserve Formula'}</span>
            <span className="font-mono text-amber-300 font-bold">Invoice × % Reserve</span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase">{lang === 'ru' ? 'Комиссия Факторинга' : 'Factoring Fee'}</span>
            <span className="font-mono text-violet-300 font-bold">Invoice × % Fee</span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase">{lang === 'ru' ? 'Ежедневный Возврат' : 'Daily Refund'}</span>
            <span className="font-mono text-teal-300 font-bold">Reserve - Chargebacks</span>
          </div>
        </div>
      </div>

      {/* Aggregated Broker Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>{lang === 'ru' ? 'Сводка по брокерам / клиентам' : 'Broker Performance Breakdown'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'ru' 
                ? 'Агрегированные суммы, сгруппированные по брокерам с расчетом резервов и возврата' 
                : 'Totals aggregated by broker showing advance, reserves, fees and chargebacks'}
            </p>
          </div>

          <div className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            {lang === 'ru' ? 'Всего брокеров:' : 'Total Brokers:'} <strong className="text-slate-900">{brokerSummaries.length}</strong>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{lang === 'ru' ? 'Брокер / Заказчик' : 'Broker / Client'}</th>
                <th className="py-3 px-3 text-center">{lang === 'ru' ? 'Кол-во' : 'Count'}</th>
                <th className="py-3 px-3 text-right">{lang === 'ru' ? 'Сумма Инвойсов' : 'Invoice Total'}</th>
                <th className="py-3 px-3 text-right">{lang === 'ru' ? 'Сумма Покупки' : 'Purchases'}</th>
                <th className="py-3 px-3 text-right">{lang === 'ru' ? 'Банк QB' : 'QB Bank'}</th>
                <th className="py-3 px-3 text-right">{lang === 'ru' ? 'Резерв' : 'Reserve'}</th>
                <th className="py-3 px-3 text-right text-teal-700">{lang === 'ru' ? 'Возврат Резерва' : 'Reserve Refund'}</th>
                <th className="py-3 px-3 text-right">{lang === 'ru' ? 'Комиссия ($)' : 'Fee ($)'}</th>
                <th className="py-3 px-3 text-right text-rose-700">{lang === 'ru' ? 'Charge Back' : 'Chargeback'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {brokerSummaries.map((b, idx) => (
                <tr key={b.brokerName} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    {b.brokerName}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full font-mono text-slate-700">
                      {b.invoiceCount}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    {formatCurrency(b.totalInvoiceAmount)}
                  </td>
                  <td className="py-3 px-3 text-right text-indigo-700 font-semibold">
                    {formatCurrency(b.totalPurchaseAmount)}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-700 font-semibold">
                    {formatCurrency(b.totalQbBankDeposit)}
                  </td>
                  <td className="py-3 px-3 text-right text-amber-800 font-semibold">
                    {formatCurrency(b.totalReserveAmount)}
                  </td>
                  <td className="py-3 px-3 text-right text-teal-700 font-bold bg-teal-50/40">
                    {formatCurrency(b.totalReserveRefund)}
                  </td>
                  <td className="py-3 px-3 text-right text-violet-700">
                    {formatCurrency(b.totalFactoringFee)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold">
                    {b.totalChargeback > 0 ? (
                      <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {formatCurrency(b.totalChargeback)}
                      </span>
                    ) : (
                      <span className="text-slate-400">$0.00</span>
                    )}
                  </td>
                </tr>
              ))}

              {/* Total Summary Row */}
              <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-900">
                <td className="py-3.5 px-4">{lang === 'ru' ? 'ИТОГО (ВСЕ БРОКЕРЫ):' : 'TOTAL (ALL BROKERS):'}</td>
                <td className="py-3.5 px-3 text-center text-emerald-400 font-mono">{metrics.invoiceCount}</td>
                <td className="py-3.5 px-3 text-right text-blue-300">{formatCurrency(metrics.totalInvoiceAmount)}</td>
                <td className="py-3.5 px-3 text-right text-indigo-300">{formatCurrency(metrics.totalPurchaseAmount)}</td>
                <td className="py-3.5 px-3 text-right text-emerald-400">{formatCurrency(metrics.totalQbBankDeposit)}</td>
                <td className="py-3.5 px-3 text-right text-amber-300">{formatCurrency(metrics.totalReserveAmount)}</td>
                <td className="py-3.5 px-3 text-right text-teal-300 font-black">{formatCurrency(metrics.totalReserveRefund)}</td>
                <td className="py-3.5 px-3 text-right text-violet-300">{formatCurrency(metrics.totalFactoringFeeAmount)}</td>
                <td className="py-3.5 px-3 text-right text-rose-300">{formatCurrency(metrics.totalChargebackAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes & Audit Log Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-teal-600" />
          <span>{lang === 'ru' ? 'Заметки & Комментарии к периоду' : 'Period Audit Notes'}</span>
        </h3>

        <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder={
              lang === 'ru'
                ? 'Введите заметку (например: "Ожидается возврат резерва за рейсы #1002")'
                : 'Enter comment or note for factoring reconciliation...'
            }
            className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ru' ? 'Добавить' : 'Add Note'}</span>
          </button>
        </form>

        <div className="space-y-2">
          {globalNotes.map((note, index) => (
            <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 flex items-start justify-between">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{note}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">July 2026</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
