import React, { useState, useEffect, useMemo } from 'react';
import { FactoringInvoice, DateFilter, FactoringStatus } from './types';
import { INITIAL_INVOICES } from './data/initialData';
import { 
  filterInvoicesByDate, 
  calculateMetrics, 
  getBrokerSummaries, 
  exportInvoicesToCSV 
} from './utils/factoringUtils';

import { Header } from './components/Header';
import { SummarySheet } from './components/SummarySheet';
import { DataEntrySheet } from './components/DataEntrySheet';
import { AnalyticsSheet } from './components/AnalyticsSheet';
import { FormulasGuideModal } from './components/FormulasGuideModal';
import { InvoiceModal } from './components/InvoiceModal';

export default function App() {
  // Load initial invoices from localStorage or fallback to INITIAL_INVOICES
  const [invoices, setInvoices] = useState<FactoringInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('factoring_invoices_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading invoices from localStorage', e);
    }
    return INITIAL_INVOICES;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'summary' | 'data_entry' | 'analytics' | 'formulas'>('summary');
  const [dateFilter, setDateFilter] = useState<DateFilter>({ period: 'all' });
  const [lang, setLang] = useState<'ru' | 'en'>('ru');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<FactoringInvoice | null>(null);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('factoring_invoices_v1', JSON.stringify(invoices));
    } catch (e) {
      console.error('Error saving invoices to localStorage', e);
    }
  }, [invoices]);

  // Derived filtered invoices
  const filteredInvoices = useMemo(() => {
    return filterInvoicesByDate(invoices, dateFilter);
  }, [invoices, dateFilter]);

  // Derived top summary metrics (calculated with strict formulas)
  const metrics = useMemo(() => {
    return calculateMetrics(filteredInvoices);
  }, [filteredInvoices]);

  // Derived broker summaries
  const brokerSummaries = useMemo(() => {
    return getBrokerSummaries(filteredInvoices);
  }, [filteredInvoices]);

  // Add / Save invoice
  const handleSaveInvoice = (savedInv: FactoringInvoice) => {
    const exists = invoices.some(i => i.id === savedInv.id);
    if (exists) {
      setInvoices(invoices.map(i => i.id === savedInv.id ? savedInv : i));
    } else {
      setInvoices([savedInv, ...invoices]);
    }
  };

  // Delete invoice
  const handleDeleteInvoice = (id: string) => {
    if (window.confirm(lang === 'ru' ? 'Вы уверены, что хотите удалить этот инвойс?' : 'Are you sure you want to delete this invoice?')) {
      setInvoices(invoices.filter(i => i.id !== id));
    }
  };

  // Inline update
  const handleUpdateInvoiceInline = (updatedInv: FactoringInvoice) => {
    setInvoices(invoices.map(i => i.id === updatedInv.id ? updatedInv : i));
  };

  // Bulk status update
  const handleBulkUpdateStatus = (ids: string[], newStatus: FactoringStatus) => {
    setInvoices(invoices.map(inv => {
      if (ids.includes(inv.id)) {
        return {
          ...inv,
          status: newStatus,
          lastUpdated: new Date().toISOString(),
        };
      }
      return inv;
    }));
  };

  // Reset to initial mock data
  const handleResetData = () => {
    if (window.confirm(lang === 'ru' ? 'Сбросить все данные к начальному состоянию?' : 'Reset all data back to default mock entries?')) {
      setInvoices(INITIAL_INVOICES);
      localStorage.removeItem('factoring_invoices_v1');
    }
  };

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingInvoice(null);
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (inv: FactoringInvoice) => {
    setEditingInvoice(inv);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        onOpenAddModal={handleOpenAddModal}
        onExportCSV={() => exportInvoicesToCSV(filteredInvoices)}
        onResetData={handleResetData}
        lang={lang}
        setLang={setLang}
        filteredCount={filteredInvoices.length}
        totalCount={invoices.length}
      />

      {/* Main Tab View Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Tab 1: Summary Sheet */}
        {activeTab === 'summary' && (
          <SummarySheet
            metrics={metrics}
            brokerSummaries={brokerSummaries}
            invoices={filteredInvoices}
            lang={lang}
            onNavigateToDataEntry={() => setActiveTab('data_entry')}
          />
        )}

        {/* Tab 2: Daily Invoices Data Entry Log */}
        {activeTab === 'data_entry' && (
          <DataEntrySheet
            invoices={filteredInvoices}
            lang={lang}
            onAddInvoice={handleOpenAddModal}
            onEditInvoice={handleOpenEditModal}
            onDeleteInvoice={handleDeleteInvoice}
            onUpdateInvoiceInline={handleUpdateInvoiceInline}
            onBulkUpdateStatus={handleBulkUpdateStatus}
          />
        )}

        {/* Tab 3: Analytics & Aging Sheet */}
        {activeTab === 'analytics' && (
          <AnalyticsSheet
            invoices={filteredInvoices}
            brokerSummaries={brokerSummaries}
            lang={lang}
          />
        )}

        {/* Tab 4: Formulas Guide & Calculator */}
        {activeTab === 'formulas' && (
          <FormulasGuideModal lang={lang} />
        )}

      </main>

      {/* Add / Edit Invoice Modal */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveInvoice}
        initialInvoice={editingInvoice}
        lang={lang}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {lang === 'ru' 
              ? 'Факторинг Дашборд © 2026 — Автоматический расчет инвойсов, QB и резервов' 
              : 'Factoring Master Dashboard © 2026 — Automated invoice formulas, QB bank deposits & reserve tracking'}
          </span>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="hover:text-slate-600 transition cursor-pointer" onClick={() => setActiveTab('formulas')}>
              {lang === 'ru' ? 'Справочник формул' : 'Formulas Guide'}
            </span>
            <span>•</span>
            <span className="hover:text-slate-600 transition cursor-pointer" onClick={() => exportInvoicesToCSV(filteredInvoices)}>
              {lang === 'ru' ? 'Экспорт в Excel/CSV' : 'Export to CSV'}
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
