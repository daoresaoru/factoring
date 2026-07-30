import React, { useState } from 'react';
import { FactoringInvoice, FactoringStatus } from '../types';
import { formatCurrency, formatDate, recalculateInvoiceRow } from '../utils/factoringUtils';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  ArrowUpDown,
  RefreshCcw,
  Sparkles
} from 'lucide-react';

interface DataEntrySheetProps {
  invoices: FactoringInvoice[];
  lang: 'ru' | 'en';
  onAddInvoice: () => void;
  onEditInvoice: (inv: FactoringInvoice) => void;
  onDeleteInvoice: (id: string) => void;
  onUpdateInvoiceInline: (inv: FactoringInvoice) => void;
  onBulkUpdateStatus: (ids: string[], newStatus: FactoringStatus) => void;
}

export const DataEntrySheet: React.FC<DataEntrySheetProps> = ({
  invoices,
  lang,
  onAddInvoice,
  onEditInvoice,
  onDeleteInvoice,
  onUpdateInvoiceInline,
  onBulkUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FactoringInvoice>>({});

  // Filter invoices
  const filtered = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.loadNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.brokerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.notes && inv.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Inline edit start
  const startInlineEdit = (inv: FactoringInvoice) => {
    setEditingId(inv.id);
    setEditForm({ ...inv });
  };

  // Inline edit save
  const saveInlineEdit = () => {
    if (!editingId) return;
    const updated = recalculateInvoiceRow(editForm);
    onUpdateInvoiceInline(updated as FactoringInvoice);
    setEditingId(null);
    setEditForm({});
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const getStatusBadge = (status: FactoringStatus) => {
    switch (status) {
      case 'uploaded':
        return (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 rounded-full text-[11px] font-medium">
            {lang === 'ru' ? 'Загружен' : 'Uploaded'}
          </span>
        );
      case 'purchased':
        return (
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[11px] font-medium">
            {lang === 'ru' ? 'Выкуплен' : 'Purchased'}
          </span>
        );
      case 'bank_received':
        return (
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-[11px] font-medium flex items-center gap-1">
            ✓ {lang === 'ru' ? 'Получен в QB' : 'QB Received'}
          </span>
        );
      case 'broker_paid':
        return (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-medium">
            {lang === 'ru' ? 'Брокер оплатил' : 'Broker Paid'}
          </span>
        );
      case 'released':
        return (
          <span className="px-2 py-0.5 bg-teal-100 text-teal-900 border border-teal-300 rounded-full text-[11px] font-bold">
            ★ {lang === 'ru' ? 'Резерв возвращен' : 'Reserve Released'}
          </span>
        );
      case 'chargeback':
        return (
          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-[11px] font-bold">
            ⚠ {lang === 'ru' ? 'Чарджбэк' : 'Chargeback'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Left: Search Bar */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              lang === 'ru' 
                ? 'Поиск по № Инвойса, № Груза, Брокеру...' 
                : 'Search Invoice #, Load #, Broker...'
            }
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Center: Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          <span className="text-xs text-slate-500 font-medium mr-1 hidden sm:inline">
            <Filter className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
            {lang === 'ru' ? 'Статус:' : 'Status:'}
          </span>
          {[
            { id: 'all', labelRu: 'Все', labelEn: 'All' },
            { id: 'uploaded', labelRu: 'Загружен', labelEn: 'Uploaded' },
            { id: 'bank_received', labelRu: 'Банк QB', labelEn: 'QB Received' },
            { id: 'released', labelRu: 'Возврат Резерва', labelEn: 'Reserve Released' },
            { id: 'chargeback', labelRu: 'Чарджбэк', labelEn: 'Chargeback' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lang === 'ru' ? st.labelRu : st.labelEn}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-800">
              <span className="font-bold">{selectedIds.length} {lang === 'ru' ? 'выбрано' : 'selected'}</span>
              <button
                onClick={() => onBulkUpdateStatus(selectedIds, 'bank_received')}
                className="ml-2 px-2 py-0.5 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700"
              >
                {lang === 'ru' ? 'В Банк QB' : 'Set QB Received'}
              </button>
              <button
                onClick={() => onBulkUpdateStatus(selectedIds, 'released')}
                className="px-2 py-0.5 bg-teal-600 text-white rounded font-medium hover:bg-teal-700"
              >
                {lang === 'ru' ? 'Возврат Резерва' : 'Set Released'}
              </button>
            </div>
          )}

          <button
            onClick={onAddInvoice}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ru' ? 'Внести инвойс' : 'New Invoice Row'}</span>
          </button>
        </div>

      </div>

      {/* Main Interactive Factoring Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Banner */}
        <div className="p-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {lang === 'ru' 
                ? 'Ежедневный журнал инвойсов факторинга (Таблица ввода данных)' 
                : 'Daily Factoring Invoices Log (Primary Data Entry Table)'}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400">
            {lang === 'ru'
              ? '4 ключевые даты: Загрузка | Покупка | Банк QB | Возврат от брокера'
              : '4 Required Dates: Upload | Purchase | QB Bank Deposit | Broker Payback'}
          </p>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto max-h-[650px] scrollbar-thin">
          <table className="w-full text-left text-xs whitespace-nowrap">
            
            {/* Table Header */}
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-300">
              <tr>
                <th className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="p-3">{lang === 'ru' ? 'Инвойс / Load #' : 'Invoice / Load #'}</th>
                <th className="p-3">{lang === 'ru' ? 'Брокер / Заказчик' : 'Broker Name'}</th>
                
                {/* 4 Key Required Dates */}
                <th className="p-3 bg-blue-50/80 text-blue-900">{lang === 'ru' ? 'Дата Загрузки' : 'Upload Date'}</th>
                <th className="p-3 bg-indigo-50/80 text-indigo-900">{lang === 'ru' ? 'Дата Покупки' : 'Purchase Date'}</th>
                <th className="p-3 bg-emerald-50/80 text-emerald-900">{lang === 'ru' ? 'Дата Банка QB' : 'QB Bank Date'}</th>
                <th className="p-3 bg-teal-50/80 text-teal-900">{lang === 'ru' ? 'Дата Возврата' : 'Broker Payback Date'}</th>

                {/* Key Financial Amounts */}
                <th className="p-3 text-right">{lang === 'ru' ? 'Сумма Инвойса' : 'Invoice Amount'}</th>
                <th className="p-3 text-right">{lang === 'ru' ? 'Сумма Покупки' : 'Purchase Amount'}</th>
                <th className="p-3 text-right">{lang === 'ru' ? 'Получено в QB' : 'QB Bank Deposit'}</th>
                <th className="p-3 text-right">{lang === 'ru' ? 'Резерв ($ & %)' : 'Reserve ($ & %)'}</th>
                <th className="p-3 text-right text-teal-700 bg-teal-50/50">{lang === 'ru' ? 'Возврат Резерва (Daily)' : 'Reserve Refund'}</th>
                <th className="p-3 text-right">{lang === 'ru' ? 'Комиссия Факторинга' : 'Factoring Fee'}</th>
                <th className="p-3 text-right text-rose-700">{lang === 'ru' ? 'Charge Back' : 'Chargeback'}</th>
                <th className="p-3 text-center">{lang === 'ru' ? 'Статус' : 'Status'}</th>
                <th className="p-3">{lang === 'ru' ? 'Заметки' : 'Notes'}</th>
                <th className="p-3 text-center">{lang === 'ru' ? 'Действия' : 'Actions'}</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={17} className="py-12 text-center text-slate-400 font-normal">
                    {lang === 'ru' ? 'Инвойсы не найдены по запросу' : 'No invoices match the selected filter'}
                  </td>
                </tr>
              ) : (
                filtered.map((inv, idx) => {
                  const isEditing = editingId === inv.id;
                  const isSelected = selectedIds.includes(inv.id);

                  return (
                    <tr 
                      key={inv.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-emerald-50/40' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(inv.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* Invoice & Load # */}
                      <td className="p-3 font-bold text-slate-900">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={editForm.invoiceNumber || ''}
                              onChange={(e) => setEditForm({ ...editForm, invoiceNumber: e.target.value })}
                              className="w-24 px-2 py-1 text-xs border rounded bg-white"
                            />
                            <input
                              type="text"
                              value={editForm.loadNumber || ''}
                              onChange={(e) => setEditForm({ ...editForm, loadNumber: e.target.value })}
                              className="w-24 px-2 py-1 text-xs border rounded bg-white text-slate-500"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="text-slate-900 font-bold">{inv.invoiceNumber}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{inv.loadNumber}</div>
                          </div>
                        )}
                      </td>

                      {/* Broker Name */}
                      <td className="p-3 font-semibold text-slate-800">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.brokerName || ''}
                            onChange={(e) => setEditForm({ ...editForm, brokerName: e.target.value })}
                            className="w-32 px-2 py-1 text-xs border rounded bg-white"
                          />
                        ) : (
                          <span>{inv.brokerName}</span>
                        )}
                      </td>

                      {/* 1. Upload Date */}
                      <td className="p-3 bg-blue-50/30 text-blue-900">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editForm.uploadDate || ''}
                            onChange={(e) => setEditForm({ ...editForm, uploadDate: e.target.value })}
                            className="px-1 py-1 text-xs border rounded bg-white"
                          />
                        ) : (
                          <span>{formatDate(inv.uploadDate)}</span>
                        )}
                      </td>

                      {/* 2. Purchase Date */}
                      <td className="p-3 bg-indigo-50/30 text-indigo-900">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editForm.purchaseDate || ''}
                            onChange={(e) => setEditForm({ ...editForm, purchaseDate: e.target.value })}
                            className="px-1 py-1 text-xs border rounded bg-white"
                          />
                        ) : (
                          <span>{formatDate(inv.purchaseDate)}</span>
                        )}
                      </td>

                      {/* 3. QB Bank Deposit Date */}
                      <td className="p-3 bg-emerald-50/30 text-emerald-900">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editForm.qbBankDate || ''}
                            onChange={(e) => setEditForm({ ...editForm, qbBankDate: e.target.value })}
                            className="px-1 py-1 text-xs border rounded bg-white"
                          />
                        ) : (
                          <span>{formatDate(inv.qbBankDate)}</span>
                        )}
                      </td>

                      {/* 4. Broker Payback / Refund Date */}
                      <td className="p-3 bg-teal-50/30 text-teal-900">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editForm.brokerPaybackDate || ''}
                            onChange={(e) => setEditForm({ ...editForm, brokerPaybackDate: e.target.value })}
                            className="px-1 py-1 text-xs border rounded bg-white"
                          />
                        ) : (
                          <span>{formatDate(inv.brokerPaybackDate)}</span>
                        )}
                      </td>

                      {/* Invoice Amount ($) */}
                      <td className="p-3 text-right font-bold text-slate-900">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.invoiceAmount || 0}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const recalced = recalculateInvoiceRow({ ...editForm, invoiceAmount: val });
                              setEditForm(recalced);
                            }}
                            className="w-24 px-2 py-1 text-xs border rounded text-right font-bold"
                          />
                        ) : (
                          <span>{formatCurrency(inv.invoiceAmount)}</span>
                        )}
                      </td>

                      {/* Purchase Amount ($) */}
                      <td className="p-3 text-right text-indigo-700 font-semibold">
                        <span>{formatCurrency(inv.purchaseAmount)}</span>
                      </td>

                      {/* QB Bank Deposit ($) */}
                      <td className="p-3 text-right text-emerald-700 font-bold">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.qbBankDeposit || 0}
                            onChange={(e) => setEditForm({ ...editForm, qbBankDeposit: parseFloat(e.target.value) || 0 })}
                            className="w-24 px-2 py-1 text-xs border rounded text-right"
                          />
                        ) : (
                          <span>{formatCurrency(inv.qbBankDeposit)}</span>
                        )}
                      </td>

                      {/* Reserve Amount ($) & % */}
                      <td className="p-3 text-right text-amber-800 font-semibold">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              step="0.1"
                              value={editForm.reservePercentage || 10}
                              onChange={(e) => {
                                const pct = parseFloat(e.target.value) || 0;
                                const recalced = recalculateInvoiceRow({ ...editForm, reservePercentage: pct });
                                setEditForm(recalced);
                              }}
                              className="w-12 px-1 py-1 text-xs border rounded text-right"
                            />
                            <span>%</span>
                          </div>
                        ) : (
                          <div>
                            <div>{formatCurrency(inv.reserveAmount)}</div>
                            <div className="text-[10px] text-amber-600">({inv.reservePercentage}%)</div>
                          </div>
                        )}
                      </td>

                      {/* Reserve Refund (Daily Changing!) */}
                      <td className="p-3 text-right text-teal-800 font-bold bg-teal-50/40">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.reserveRefund || 0}
                            onChange={(e) => setEditForm({ ...editForm, reserveRefund: parseFloat(e.target.value) || 0 })}
                            className="w-24 px-2 py-1 text-xs border rounded text-right font-bold text-teal-800"
                          />
                        ) : (
                          <span>{formatCurrency(inv.reserveRefund)}</span>
                        )}
                      </td>

                      {/* Factoring Fee */}
                      <td className="p-3 text-right text-violet-700">
                        <div>{formatCurrency(inv.factoringFeeAmount)}</div>
                        <div className="text-[10px] text-violet-500">({inv.factoringFeePercent}%)</div>
                      </td>

                      {/* Chargeback Amount */}
                      <td className="p-3 text-right font-bold">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.chargebackAmount || 0}
                            onChange={(e) => setEditForm({ ...editForm, chargebackAmount: parseFloat(e.target.value) || 0 })}
                            className="w-20 px-1 py-1 text-xs border rounded text-right text-rose-600"
                          />
                        ) : inv.chargebackAmount > 0 ? (
                          <span className="text-rose-600 font-bold">{formatCurrency(inv.chargebackAmount)}</span>
                        ) : (
                          <span className="text-slate-400">$0.00</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        {getStatusBadge(inv.status)}
                      </td>

                      {/* Notes */}
                      <td className="p-3 text-slate-500 max-w-xs truncate text-[11px]" title={inv.notes}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.notes || ''}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            className="w-36 px-2 py-1 text-xs border rounded"
                          />
                        ) : (
                          <span>{inv.notes || '—'}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={saveInlineEdit}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                              title="Save Changes"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={cancelInlineEdit}
                              className="p-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => startInlineEdit(inv)}
                              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                              title="Quick Edit Row"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteInvoice(inv.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Delete Row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary Counter */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {lang === 'ru' 
              ? `Всего записей в журнале: ${filtered.length}` 
              : `Total invoice entries: ${filtered.length}`}
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{lang === 'ru' ? 'Все суммы транслируются в итоговую сводку' : 'All sums feed directly into Sheet 1 Summary'}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
