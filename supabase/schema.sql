-- Jarvis AI — Supabase schema
-- Supabase Dashboard > SQL Editor mein ye poora script chalayein.
-- RLS on hai: user sirf apna business data dekh sakta hai.

create extension if not exists "pgcrypto";

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  slug text unique not null,
  name text not null,
  name_urdu text,
  phone text,
  email text,
  description text,
  description_urdu text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  service text not null,
  date date not null,
  time text not null,
  notes text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete set null,
  visitor_name text,
  language text not null default 'ur',
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  text text not null,
  tool_used text,
  created_at timestamptz not null default now()
);

create table if not exists public.widgets (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  slug text unique not null,
  title text not null default 'Jarvis AI Assistant',
  title_urdu text not null default 'جاروس اے آئی اسسٹنٹ',
  greeting text not null default 'Hi! How can I help you today?',
  greeting_urdu text not null default 'السلام علیکم! میں جاروس ہوں — میں آپ کی کیا مدد کر سکتا ہوں؟',
  primary_color text not null default '#1e4db7',
  language text not null default 'ur',
  created_at timestamptz not null default now()
);

create table if not exists public.automations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  name_urdu text,
  trigger text not null,
  tool_name text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_appointments_business on public.appointments(business_id, date);
create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);
create index if not exists idx_businesses_owner on public.businesses(owner_id);

-- RLS
alter table public.businesses enable row level security;
alter table public.appointments enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.widgets enable row level security;
alter table public.automations enable row level security;

create policy "owners manage own business" on public.businesses for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "public read business by slug" on public.businesses for select using (true);
create policy "business members manage appointments" on public.appointments for all using (exists (select 1 from public.businesses b where b.id = appointments.business_id and b.owner_id = auth.uid()));
create policy "public insert appointments" on public.appointments for insert with check (true);
create policy "public read widgets" on public.widgets for select using (true);
create policy "owners manage widgets" on public.widgets for all using (exists (select 1 from public.businesses b where b.id = widgets.business_id and b.owner_id = auth.uid()));
create policy "owners manage automations" on public.automations for all using (exists (select 1 from public.businesses b where b.id = automations.business_id and b.owner_id = auth.uid()));
create policy "public insert conversations" on public.conversations for insert with check (true);
create policy "public insert messages" on public.messages for insert with check (true);

-- Seed demo business (owner_id null — signup ke baad apna business banayein)
insert into public.businesses (slug, name, name_urdu, phone, email, description_urdu)
values ('demo', 'Jarvis Demo Business', 'جاروس ڈیمو بزنس', '+92 300 0000000', 'demo@jarvis.example', 'یہ ڈیمو بزنس ہے۔')
on conflict (slug) do nothing;
