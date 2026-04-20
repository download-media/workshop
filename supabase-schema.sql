-- Run this in your Supabase SQL Editor

-- Clients
create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  facilitator text not null,
  created_at timestamptz default now()
);

-- Sessions (one per workshop run)
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade not null,
  service_type text not null,
  date text not null,
  status text default 'active' check (status in ('active', 'completed')),
  workshop_data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Brand profiles (one per client, reused across sessions)
create table if not exists brand_profiles (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade unique not null,
  website_url text,
  guidelines_text text,
  ai_analysis jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_sessions_client on sessions(client_id);
create index if not exists idx_brand_profiles_client on brand_profiles(client_id);

-- Enable RLS (but allow all for now — add auth later)
alter table clients enable row level security;
alter table sessions enable row level security;
alter table brand_profiles enable row level security;

-- Permissive policies (open access — tighten with auth later)
create policy "Allow all on clients" on clients for all using (true) with check (true);
create policy "Allow all on sessions" on sessions for all using (true) with check (true);
create policy "Allow all on brand_profiles" on brand_profiles for all using (true) with check (true);
