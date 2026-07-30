import React, { useState, useEffect } from 'react';
import { FactoringInvoice, FactoringStatus } from '../types';
import { recalculateInvoiceRow } from '../utils/factoringUtils';
import { X, Check, Calculator, Calendar, DollarSign, Building2 } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: FactoringInvoice) => void;
  initialInvoice?: FactoringInvoice | null;
  lang: 'ru' | 'en';
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialInvoice,
  lang,
}) => {
  const [formData, setFormData] = useState<Partial<FactoringInvoice>>({
    invoiceNumber: '',
    loadNumber: '',
    brokerName: '',
    uploadDate: new Date().toISOString().split('T')[0],
    purchaseDate: new Date().toISOString().split('T')[0],
    qbBankDate: new Date().toISOString().split('T')[0],
    brokerPaybackDate: '',
    invoiceAmount: 3500,
    reservePercentage: 10,
    factoringFeePercent: 2.5,
    qbBankDeposit: 3150,
    chargebackAmount: 0,
    reserveRefund: 0,
    status: 'bank_received',
    notes: '',
  });

  useEffect(() => {
    if (initialInvoice) {
      setFormData({ ...initialInvoice });
    } else {
      const recalculated = recalculateInvoiceRow({
        invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        loadNumber: `LD-${Math.floor(90000 + Math.random() * 10000)}`,
        brokerName: 'C.H. Robinson',
        uploadDate: new Date().toISOString().split('T')[0],
        purchaseDate: new Date().toISOString().split('T')[0],
        qbBankDate: new Date().toISOString().split('T')[0],
        brokerPaybackDate: '',
        invoiceAmount: 4000,
        reservePercentage: 10,
        factoringFeePercent: 2.5,
        chargebackAmount: 0,
        status: 'bank_received',
        notes: '',
      });
      setFormData(recalculated);
    }
  }, [initialInvoice, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof FactoringInvoice, val: any) => {
    const updated = { ...formData, [field]: val };
    
    // Trigger auto-calculation on financial changes
    if (['invoiceAmount', 'reservePercentage', 'factoringFeePercent', 'status', 'chargebackAmount'].includes(field)) {
      const recalced = recalculateInvoiceRow(updated);
      setFormData(recalced);
    } else {
      setFormData(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = recalculateInvoiceRow(formData);
    onSave({
      ...finalData,
      id: initialInvoice ? initialInvoice.id : `INV-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
    } as FactoringInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 relative animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialInvoice 
                  ? (lang === 'ru' ? 'Редактировать инвойс' : 'Edit Factoring Load')
                  : (lang === 'ru' ? 'Внести новый инвойс в факторинг' : 'New Factoring Load Entry')}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'ru' ? 'Автоматический расчет покупной суммы, резерва и комиссии' : 'Auto-computes advance, reserve, and factoring fees'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* General info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ru' ? '№ Инвойса:' : 'Invoice Number:'}
              </label>
              <input
                type="text"
                required
                value={formData.invoiceNumber || ''}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ru' ? '№ Груза (Load #):' : 'Load Number:'}
              </label>
              <input
                type="text"
                required
                value={formData.loadNumber || ''}
                onChange={(e) => handleInputChange('loadNumber', e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ru' ? 'Брокер / Заказчик:' : 'Broker Name:'}
              </label>
              <input
                type="text"
                required
                value={formData.brokerName || ''}
                onChange={(e) => handleInputChange('brokerName', e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* 4 Required Dates Block */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'ru' ? '4 ключевые даты транзакции:' : '4 Key Required Dates:'}</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                  1. {lang === 'ru' ? 'Загрузка:' : 'Upload Date:'}
                </label>
                <input
                  type="date"
                  required
                  value={formData.uploadDate || ''}
                  onChange={(e) => handleInputChange('uploadDate', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-indigo-900 mb-1">
                  2. {lang === 'ru' ? 'Покупка:' : 'Purchase Date:'}
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate || ''}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                  3. {lang === 'ru' ? 'Банк QB:' : 'QB Bank Date:'}
                </label>
                <input
                  type="date"
                  value={formData.qbBankDate || ''}
                  onChange={(e) => handleInputChange('qbBankDate', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-teal-900 mb-1">
                  4. {lang === 'ru' ? 'Возврат:' : 'Payback Date:'}
                </label>
                <input
                  type="date"
                  value={formData.brokerPaybackDate || ''}
                  onChange={(e) => handleInputChange('brokerPaybackDate', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                />
              </div>
            </div>
          </div>

          {/* Financial Amounts & Rates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ru' ? 'Сумма Инвойса ($):' : 'Invoice Amount ($):'}
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.invoiceAmount || 0}
                onChange={(e) => handleInputChange('invoiceAmount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-sm font-black border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ru' ? '% Резерва (Hold %):' : 'Reserve %:'}
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.reservePercentage || 10}
                onChange={(e) => handleInputChange('reservePercentage', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-amber-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ru' ? '% Услуг факторинга:' : 'Factoring Fee %:'}
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.factoringFeePercent || 2.5}
                onChange={(e) => handleInputChange('factoringFeePercent', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-violet-800"
              />
            </div>
          </div>

          {/* Calculated Preview Box */}
          <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl border border-slate-800 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">{lang === 'ru' ? 'Выкуп (Purchases)' : 'Purchase Advance'}</span>
              <span className="font-bold text-indigo-300 text-sm font-mono">${(formData.purchaseAmount || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">{lang === 'ru' ? 'Сумма Резерва' : 'Reserve Amount'}</span>
              <span className="font-bold text-amber-300 text-sm font-mono">${(formData.reserveAmount || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">{lang === 'ru' ? 'Комиссия ($)' : 'Fee Amount'}</span>
              <span className="font-bold text-violet-300 text-sm font-mono">${(formData.factoringFeeAmount || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">{lang === 'ru' ? 'Возврат резерва' : 'Reserve Refund'}</span>
              <span className="font-bold text-teal-300 text-sm font-mono">${(formData.reserveRefund || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Status & Additional Params */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ru' ? 'Статус инвойса:' : 'Status:'}
              </label>
              <select
                value={formData.status || 'bank_received'}
                onChange={(e) => handleInputChange('status', e.target.value as FactoringStatus)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-medium cursor-pointer"
              >
                <option value="uploaded">{lang === 'ru' ? 'Загружен в факторинг' : 'Uploaded'}</option>
                <option value="purchased">{lang === 'ru' ? 'Выкуплен факторингом' : 'Purchased'}</option>
                <option value="bank_received">{lang === 'ru' ? 'Получены деньги в банк (QB)' : 'QB Bank Received'}</option>
                <option value="broker_paid">{lang === 'ru' ? 'Брокер оплатил' : 'Broker Paid'}</option>
                <option value="released">{lang === 'ru' ? 'Резерв возвращен' : 'Reserve Released'}</option>
                <option value="chargeback">{lang === 'ru' ? 'Чарджбэк' : 'Chargeback'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ru' ? 'Сумма Charge Back ($):' : 'Chargeback Amount ($):'}
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.chargebackAmount || 0}
                onChange={(e) => handleInputChange('chargebackAmount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-rose-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'ru' ? 'Заметки & Комментарии:' : 'Notes / Remarks:'}
            </label>
            <input
              type="text"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={lang === 'ru' ? 'Введите комментарий к рейсу...' : 'Enter comments or load notes...'}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              {lang === 'ru' ? 'Отмена' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'ru' ? 'Сохранить инвойс' : 'Save Invoice Entry'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
