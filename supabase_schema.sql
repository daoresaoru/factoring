-- Factoring Invoices table
create table public.factoring_invoices (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,

  invoice_number text not null default '',
  load_number text not null default '',
  broker_name text not null default '',

  upload_date date,
  purchase_date date,
  qb_bank_date date,
  broker_payback_date date,

  invoice_amount numeric not null default 0,
  purchase_amount numeric not null default 0,
  qb_bank_deposit numeric not null default 0,
  reserve_amount numeric not null default 0,
  reserve_percentage numeric not null default 0,
  reserve_refund numeric not null default 0,
  factoring_fee_percent numeric not null default 0,
  factoring_fee_amount numeric not null default 0,
  chargeback_amount numeric not null default 0,

  status text not null default 'uploaded',
  notes text not null default '',

  last_updated timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Index for faster per-user queries
create index factoring_invoices_user_id_idx on public.factoring_invoices(user_id);

-- Enable Row Level Security
alter table public.factoring_invoices enable row level security;

-- Policy: users can only see their own rows
create policy "Users can view their own invoices"
  on public.factoring_invoices for select
  using (auth.uid() = user_id);

-- Policy: users can only insert rows tied to themselves
create policy "Users can insert their own invoices"
  on public.factoring_invoices for insert
  with check (auth.uid() = user_id);

-- Policy: users can only update their own rows
create policy "Users can update their own invoices"
  on public.factoring_invoices for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: users can only delete their own rows
create policy "Users can delete their own invoices"
  on public.factoring_invoices for delete
  using (auth.uid() = user_id);
