import React, { useState } from 'react';
import { 
  Calculator, 
  HelpCircle, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Sliders, 
  Info,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '../utils/factoringUtils';

interface FormulasGuideModalProps {
  lang: 'ru' | 'en';
}

export const FormulasGuideModal: React.FC<FormulasGuideModalProps> = ({ lang }) => {
  // Playground sandbox state
  const [testInvoiceAmount, setTestInvoiceAmount] = useState<number>(5000);
  const [testReservePct, setTestReservePct] = useState<number>(10);
  const [testFeePct, setTestFeePct] = useState<number>(2.5);
  const [testChargeback, setTestChargeback] = useState<number>(0);

  // Calculations
  const calculatedReserve = testInvoiceAmount * (testReservePct / 100);
  const calculatedPurchase = testInvoiceAmount - calculatedReserve;
  const calculatedFee = testInvoiceAmount * (testFeePct / 100);
  const calculatedBankDeposit = calculatedPurchase;
  const calculatedRefund = Math.max(0, calculatedReserve - testChargeback);

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {lang === 'ru' 
                ? 'Справочник формул & Интерактивный калькулятор' 
                : 'Factoring Formulas Guide & Live Calculator'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'ru'
                ? 'Математическая логика расчета всех показателей на первом и втором листах'
                : 'Interactive reference explaining all automated formulas used across sheets'}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Sandbox Playground */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <span>{lang === 'ru' ? 'Симулятор расчета одного инвойса' : 'Single Load Factoring Simulator'}</span>
          </h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
            {lang === 'ru' ? 'Тестовая песочница' : 'Live Playground'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Controls */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {lang === 'ru' ? 'Входные параметры инвойса' : 'Input Parameters'}
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ru' ? 'Сумма инвойса ($):' : 'Invoice Amount ($):'}
              </label>
              <input
                type="number"
                value={testInvoiceAmount}
                onChange={(e) => setTestInvoiceAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'ru' ? '% Резерва:' : 'Reserve %:'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={testReservePct}
                  onChange={(e) => setTestReservePct(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'ru' ? '% Услуг факторинга:' : 'Factoring Fee %:'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={testFeePct}
                  onChange={(e) => setTestFeePct(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ru' ? 'Сумма Чарджбэка ($):' : 'Chargeback Amount ($):'}
              </label>
              <input
                type="number"
                value={testChargeback}
                onChange={(e) => setTestChargeback(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg bg-white text-rose-600"
              />
            </div>
          </div>

          {/* Results Output */}
          <div className="space-y-3 bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                {lang === 'ru' ? 'Результаты автоматических формул:' : 'Calculated Formula Outputs:'}
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-slate-800/80 rounded border border-slate-700">
                  <span className="text-slate-300">{lang === 'ru' ? '1. Сумма покупки (Purchases):' : '1. Purchase Advance:'}</span>
                  <span className="font-bold text-indigo-300 font-mono text-sm">{formatCurrency(calculatedPurchase)}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-800/80 rounded border border-slate-700">
                  <span className="text-slate-300">{lang === 'ru' ? '2. Поступление на банк QB:' : '2. QB Bank Deposit:'}</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">{formatCurrency(calculatedBankDeposit)}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-800/80 rounded border border-slate-700">
                  <span className="text-slate-300">{lang === 'ru' ? '3. Удержанный резерв:' : '3. Held Reserve Amount:'}</span>
                  <span className="font-bold text-amber-300 font-mono text-sm">{formatCurrency(calculatedReserve)}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-800/80 rounded border border-slate-700">
                  <span className="text-slate-300">{lang === 'ru' ? '4. Комиссия факторинга:' : '4. Factoring Fee:'}</span>
                  <span className="font-bold text-violet-300 font-mono text-sm">{formatCurrency(calculatedFee)}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-teal-950/80 rounded border border-teal-500/50">
                  <span className="text-teal-200 font-semibold">{lang === 'ru' ? '5. Ежедневный возврат резерва:' : '5. Daily Reserve Refund:'}</span>
                  <span className="font-black text-teal-300 font-mono text-base">{formatCurrency(calculatedRefund)}</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
              ✓ {lang === 'ru' ? 'Эти формулы автоматически рассчитывают каждую строку в таблице.' : 'These formulas auto-calculate each line item.'}
            </div>
          </div>

        </div>
      </div>

      {/* Detailed Formula Reference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <h4 className="font-bold text-slate-900 text-sm mb-2 text-indigo-700">
            {lang === 'ru' ? '1. Формула выкупа (Purchases Formula)' : '1. Purchase Advance Formula'}
          </h4>
          <div className="p-3 bg-slate-100 rounded-lg font-mono text-xs text-slate-800 font-bold mb-2">
            Сумма Покупки = Сумма Инвойса × (100% - % Резерва)
          </div>
          <p className="text-xs text-slate-600">
            {lang === 'ru'
              ? 'Факторинг выкупает инвойс за вычетом резерва (например, 90% при 10% резерве).'
              : 'Advance amount paid immediately by factoring company.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <h4 className="font-bold text-slate-900 text-sm mb-2 text-amber-700">
            {lang === 'ru' ? '2. Формула резерва (Reserve Amount Formula)' : '2. Reserve Amount Formula'}
          </h4>
          <div className="p-3 bg-slate-100 rounded-lg font-mono text-xs text-slate-800 font-bold mb-2">
            Сумма Резерва = Сумма Инвойса × (% Резерва / 100)
          </div>
          <p className="text-xs text-slate-600">
            {lang === 'ru'
              ? 'Удерживается на специальном счете до момента полной оплаты брокером.'
              : 'Held in reserve account until broker settles invoice.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <h4 className="font-bold text-slate-900 text-sm mb-2 text-teal-700">
            {lang === 'ru' ? '3. Формула ежедневного возврата (Daily Reserve Refund)' : '3. Daily Reserve Refund'}
          </h4>
          <div className="p-3 bg-slate-100 rounded-lg font-mono text-xs text-slate-800 font-bold mb-2">
            Возврат Резерва = Сумма Резерва - Чарджбэк - Удержания
          </div>
          <p className="text-xs text-slate-600">
            {lang === 'ru'
              ? 'Меняется ежедневно при поступлении денег от брокера.'
              : 'Updates daily as broker pays off original load.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <h4 className="font-bold text-slate-900 text-sm mb-2 text-violet-700">
            {lang === 'ru' ? '4. Комиссия услуги (Factoring Fee Formula)' : '4. Factoring Fee Formula'}
          </h4>
          <div className="p-3 bg-slate-100 rounded-lg font-mono text-xs text-slate-800 font-bold mb-2">
            Комиссия = Сумма Инвойса × (% Комиссии / 100)
          </div>
          <p className="text-xs text-slate-600">
            {lang === 'ru'
              ? 'Плата за обслуживание факторинга.'
              : 'Service fee charged by factoring company.'}
          </p>
        </div>

      </div>

    </div>
  );
};
