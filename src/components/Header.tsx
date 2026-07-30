import React from 'react';
import { 
  Building2, 
  Calendar, 
  Download, 
  Plus, 
  RefreshCw, 
  Calculator, 
  BarChart3, 
  TableProperties, 
  FileSpreadsheet,
  Globe
} from 'lucide-react';
import { DateFilter, TimePeriodOption } from '../types';

interface HeaderProps {
  activeTab: 'summary' | 'data_entry' | 'analytics' | 'formulas';
  setActiveTab: (tab: 'summary' | 'data_entry' | 'analytics' | 'formulas') => void;
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  lang: 'ru' | 'en';
  setLang: (lang: 'ru' | 'en') => void;
  filteredCount: number;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  dateFilter,
  setDateFilter,
  onOpenAddModal,
  onExportCSV,
  onResetData,
  lang,
  setLang,
  filteredCount,
  totalCount,
}) => {
  const periodOptions: { value: TimePeriodOption; labelRu: string; labelEn: string }[] = [
    { value: 'all', labelRu: 'За всё время', labelEn: 'All Time' },
    { value: 'today', labelRu: 'Сегодня', labelEn: 'Today' },
    { value: 'yesterday', labelRu: 'Вчера', labelEn: 'Yesterday' },
    { value: 'this_week', labelRu: 'На этой неделе', labelEn: 'This Week' },
    { value: 'this_month', labelRu: 'В этом месяце', labelEn: 'This Month' },
    { value: 'last_month', labelRu: 'Прошлый месяц', labelEn: 'Last Month' },
    { value: 'this_quarter', labelRu: 'Текущий квартал', labelEn: 'This Quarter' },
    { value: 'year_to_date', labelRu: 'С начала года (YTD)', labelEn: 'Year To Date' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-100">
                  {lang === 'ru' ? 'Факторинг Дашборд' : 'Factoring Tracker'}
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Pro 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'ru' 
                  ? 'Отслеживание инвойсов, резервов, выкупа, QB банка и возврата средств' 
                  : 'Monitoring invoices, reserves, advance, QB deposits & refunds'}
              </p>
            </div>
          </div>

          {/* Controls Right Section */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Period Selector Dropdown */}
            <div className="relative flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200">
              <Calendar className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
              <span className="text-slate-400 mr-2 hidden sm:inline">
                {lang === 'ru' ? 'Период:' : 'Period:'}
              </span>
              <select
                value={dateFilter.period}
                onChange={(e) => setDateFilter({ ...dateFilter, period: e.target.value as TimePeriodOption })}
                className="bg-transparent text-slate-100 font-medium focus:outline-none cursor-pointer pr-2"
              >
                {periodOptions.map((p) => (
                  <option key={p.value} value={p.value} className="bg-slate-900 text-slate-100">
                    {lang === 'ru' ? p.labelRu : p.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
              className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors"
              title="Switch Language / Переключить язык"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'ru' ? 'RU / EN' : 'EN / RU'}</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{lang === 'ru' ? 'Экспорт CSV' : 'Export CSV'}</span>
            </button>

            {/* Reset Data */}
            <button
              onClick={onResetData}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg transition"
              title={lang === 'ru' ? 'Сбросить данные к начальным' : 'Reset mock data'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Add Invoice Primary Button */}
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ru' ? '+ Загрузить инвойс' : '+ Add Invoice'}</span>
            </button>

          </div>

        </div>

        {/* Bottom Bar: Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            
            {/* Tab 1: Summary Sheet */}
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ru' ? '1. Сводка (Summary)' : '1. Summary Sheet'}</span>
            </button>

            {/* Tab 2: Data Entry & Invoices Log */}
            <button
              onClick={() => setActiveTab('data_entry')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'data_entry'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <TableProperties className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'ru' ? '2. Журнал инвойсов (Ввод)' : '2. Daily Invoices Log'}</span>
              <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-slate-800 text-cyan-300 rounded-full font-mono">
                {filteredCount}
              </span>
            </button>

            {/* Tab 3: Analytics */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>{lang === 'ru' ? '3. Аналитика & Выдержка' : '3. Analytics & Aging'}</span>
            </button>

            {/* Tab 4: Formulas Guide */}
            <button
              onClick={() => setActiveTab('formulas')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'formulas'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ru' ? '4. Формулы & Калькулятор' : '4. Formulas & Calculator'}</span>
            </button>

          </nav>

          {/* Record Count info */}
          <div className="text-xs text-slate-400 hidden lg:block">
            {lang === 'ru' 
              ? `Показано ${filteredCount} из ${totalCount} инвойсов` 
              : `Showing ${filteredCount} of ${totalCount} invoices`}
          </div>
        </div>

      </div>
    </header>
  );
};
