import { supabase } from './supabaseClient';
import { FactoringInvoice } from '../types';

// Convert a DB row (snake_case) into the app's FactoringInvoice shape (camelCase)
function fromRow(row: any): FactoringInvoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    loadNumber: row.load_number,
    brokerName: row.broker_name,
    uploadDate: row.upload_date ?? '',
    purchaseDate: row.purchase_date ?? '',
    qbBankDate: row.qb_bank_date ?? '',
    brokerPaybackDate: row.broker_payback_date ?? '',
    invoiceAmount: Number(row.invoice_amount) || 0,
    purchaseAmount: Number(row.purchase_amount) || 0,
    qbBankDeposit: Number(row.qb_bank_deposit) || 0,
    reserveAmount: Number(row.reserve_amount) || 0,
    reservePercentage: Number(row.reserve_percentage) || 0,
    reserveRefund: Number(row.reserve_refund) || 0,
    factoringFeePercent: Number(row.factoring_fee_percent) || 0,
    factoringFeeAmount: Number(row.factoring_fee_amount) || 0,
    chargebackAmount: Number(row.chargeback_amount) || 0,
    status: row.status,
    notes: row.notes ?? '',
    lastUpdated: row.last_updated,
  };
}

// Convert an app FactoringInvoice (camelCase) into DB row shape (snake_case)
function toRow(inv: FactoringInvoice, userId: string) {
  return {
    id: inv.id,
    user_id: userId,
    invoice_number: inv.invoiceNumber,
    load_number: inv.loadNumber,
    broker_name: inv.brokerName,
    upload_date: inv.uploadDate || null,
    purchase_date: inv.purchaseDate || null,
    qb_bank_date: inv.qbBankDate || null,
    broker_payback_date: inv.brokerPaybackDate || null,
    invoice_amount: inv.invoiceAmount,
    purchase_amount: inv.purchaseAmount,
    qb_bank_deposit: inv.qbBankDeposit,
    reserve_amount: inv.reserveAmount,
    reserve_percentage: inv.reservePercentage,
    reserve_refund: inv.reserveRefund,
    factoring_fee_percent: inv.factoringFeePercent,
    factoring_fee_amount: inv.factoringFeeAmount,
    chargeback_amount: inv.chargebackAmount,
    status: inv.status,
    notes: inv.notes,
    last_updated: inv.lastUpdated || new Date().toISOString(),
  };
}

export async function fetchInvoices(): Promise<FactoringInvoice[]> {
  const { data, error } = await supabase
    .from('factoring_invoices')
    .select('*')
    .order('last_updated', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function upsertInvoice(inv: FactoringInvoice, userId: string): Promise<void> {
  const { error } = await supabase
    .from('factoring_invoices')
    .upsert(toRow(inv, userId), { onConflict: 'id' });

  if (error) throw error;
}

export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await supabase
    .from('factoring_invoices')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function replaceAllInvoices(
  invoices: FactoringInvoice[],
  userId: string
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('factoring_invoices')
    .delete()
    .eq('user_id', userId);
  if (deleteError) throw deleteError;

  if (invoices.length === 0) return;

  const { error: insertError } = await supabase
    .from('factoring_invoices')
    .insert(invoices.map(inv => toRow(inv, userId)));
  if (insertError) throw insertError;
}
