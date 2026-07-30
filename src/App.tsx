import React, { useState, useEffect, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import { FactoringInvoice, DateFilter, FactoringStatus } from './types';
import { INITIAL_INVOICES } from './data/initialData';
import { 
  filterInvoicesByDate, 
  calculateMetrics, 
  getBrokerSummaries, 
  exportInvoicesToCSV 
} from './utils/factoringUtils';
import { supabase } from './lib/supabaseClient';
import { fetchInvoices, upsertInvoice, deleteInvoice, replaceAllInvoices } from './lib/invoicesApi';

import { Header } from './components/Header';
import { SummarySheet } from './components/SummarySheet';
import { DataEntrySheet } from './components/DataEntrySheet';
import { AnalyticsSheet } from './components/AnalyticsSheet';
import { FormulasGuideModal } from './components/FormulasGuideModal';
import { InvoiceModal } from './components/InvoiceModal';
import { AuthScreen } from './components/AuthScreen';

export default function App() {
  // Auth state
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Invoices state (loaded from Supabase once logged in)
  const [invoices, setInvoices] = useState<FactoringInvoice[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<'summary' | 'data_entry' | 'analytics' | 'formulas'>('summary');
  const [dateFilter, setDateFilter] = useState<DateFilter>({ period: 'all' });
  const [lang, setLang] = useState<'ru' | 'en'>('ru');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<FactoringInvoice | null>(null);

  // Track auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Load invoices from Supabase whenever we have a logged-in session
  useEffect(() => {
    if (!session) {
      setInvoices([]);
      return;
    }
    setDataLoading(true);
    setDataError(null);
    fetchInvoices()
      .then(setInvoices)
      .catch(err => setDataError(err.message ?? 'Failed to load invoices'))
      .finally(() => setDataLoading(false));
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
  const handleSaveInvoice = async (savedInv: FactoringInvoice) => {
    if (!session) return;
    const exists = invoices.some(i => i.id === savedInv.id);
    const withTimestamp = { ...savedInv, lastUpdated: new Date().toISOString() };

    // Optimistic UI update
    setInvoices(exists
      ? invoices.map(i => i.id === withTimestamp.id ? withTimestamp : i)
      : [withTimestamp, ...invoices]);

    try {
      await upsertInvoice(withTimestamp, session.user.id);
    } catch (err: any) {
      setDataError(err.message ?? 'Failed to save invoice');
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async (id: string) => {
    if (!session) return;
    if (window.confirm(lang === 'ru' ? 'Вы уверены, что хотите удалить этот инвойс?' : 'Are you sure you want to delete this invoice?')) {
      const prev = invoices;
      setInvoices(invoices.filter(i => i.id !== id));
      try {
        await deleteInvoice(id);
      } catch (err: any) {
        setDataError(err.message ?? 'Failed to delete invoice');
        setInvoices(prev);
      }
    }
  };

  // Inline update
  const handleUpdateInvoiceInline = async (updatedInv: FactoringInvoice) => {
    if (!session) return;
    const withTimestamp = { ...updatedInv, lastUpdated: new Date().toISOString() };
    setInvoices(invoices.map(i => i.id === withTimestamp.id ? withTimestamp : i));
    try {
      await upsertInvoice(withTimestamp, session.user.id);
    } catch (err: any) {
      setDataError(err.message ?? 'Failed to update invoice');
    }
  };

  // Bulk status update
  const handleBulkUpdateStatus = async (ids: string[], newStatus: FactoringStatus) => {
    if (!session) return;
    const now = new Date().toISOString();
    const updatedList = invoices.map(inv =>
      ids.includes(inv.id) ? { ...inv, status: newStatus, lastUpdated: now } : inv
    );
    setInvoices(updatedList);
    try {
      const changed = updatedList.filter(inv => ids.includes(inv.id));
      await Promise.all(changed.map(inv => upsertInvoice(inv, session.user.id)));
    } catch (err: any) {
      setDataError(err.message ?? 'Failed to update invoices');
    }
  };

  // Reset to initial mock data
  const handleResetData = async () => {
    if (!session) return;
    if (window.confirm(lang === 'ru' ? 'Сбросить все данные к начальному состоянию?' : 'Reset all data back to default mock entries?')) {
      setInvoices(INITIAL_INVOICES);
      try {
        await replaceAllInvoices(INITIAL_INVOICES, session.user.id);
      } catch (err: any) {
        setDataError(err.message ?? 'Failed to reset data');
      }
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

  // Wait for the initial auth check before rendering anything
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
        {lang === 'ru' ? 'Загрузка...' : 'Loading...'}
      </div>
    );
  }

  // Not logged in — show the login/signup screen
  if (!session) {
    return <AuthScreen lang={lang} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-emerald-500 selection:text-slate-950">

      {dataError && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 text-sm px-4 py-2 text-center">
          {dataError}
        </div>
      )}

      {dataLoading && (
        <div className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm px-4 py-2 text-center">
          {lang === 'ru' ? 'Загрузка данных...' : 'Loading data...'}
        </div>
      )}

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
        userEmail={session.user.email}
        onLogout={handleLogout}
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
