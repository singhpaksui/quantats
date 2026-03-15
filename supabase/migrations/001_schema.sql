-- ============================================================
-- QuantATS Database Schema
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- CLIENTS
-- ============================================================
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  industry text,
  website text,
  location text,
  stage text not null default 'prospect' check (stage in ('prospect', 'active', 'inactive', 'lost')),
  notes text,
  owner_id uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- JOBS
-- ============================================================
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  title text not null,
  location text,
  headcount_min int default 1,
  headcount_max int default 1,
  salary_min int,
  salary_max int,
  currency text default 'USD',
  description text,
  requirements text,
  stage text not null default 'open' check (stage in ('open', 'on_hold', 'closed', 'filled')),
  owner_id uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- CANDIDATES
-- ============================================================
create table public.candidates (
  id uuid default uuid_generate_v4() primary key,
  reference text unique not null default upper(substring(md5(random()::text) from 1 for 8)),
  full_name text not null,
  email text,
  phone text,
  location text,
  current_title text,
  current_company text,
  linkedin_url text,
  cv_url text,
  notice_period text,
  current_salary int,
  expected_salary int,
  currency text default 'USD',
  skills text[], -- e.g. ['Python', 'C++', 'ML', 'HFT']
  specialisms text[], -- e.g. ['Quant Research', 'DeFi', 'Market Making']
  notes text,
  owner_id uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PIPELINE (candidate <-> job placements)
-- ============================================================
create table public.pipeline (
  id uuid default uuid_generate_v4() primary key,
  candidate_id uuid references public.candidates(id) on delete cascade not null,
  job_id uuid references public.jobs(id) on delete cascade not null,
  stage text not null default 'sourced' check (stage in (
    'sourced', 'screened', 'submitted', 'client_interview', 'offer', 'placed', 'rejected'
  )),
  notes text,
  added_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(candidate_id, job_id)
);

-- ============================================================
-- ACTIVITIES (calls, interviews, emails logged)
-- ============================================================
create table public.activities (
  id uuid default uuid_generate_v4() primary key,
  type text not null check (type in ('call', 'email', 'interview', 'meeting', 'note', 'placement')),
  candidate_id uuid references public.candidates(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  notes text,
  scheduled_at timestamptz,
  completed_at timestamptz,
  owner_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles  enable row level security;
alter table public.clients   enable row level security;
alter table public.jobs      enable row level security;
alter table public.candidates enable row level security;
alter table public.pipeline  enable row level security;
alter table public.activities enable row level security;

-- Profiles: users see all profiles (needed for names), edit own only
create policy "profiles_select_all" on public.profiles for select using (auth.role() = 'authenticated');
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Clients: all authenticated users can read/write
create policy "clients_all" on public.clients for all using (auth.role() = 'authenticated');

-- Jobs: all authenticated users can read/write
create policy "jobs_all" on public.jobs for all using (auth.role() = 'authenticated');

-- Candidates: all authenticated users can read/write
create policy "candidates_all" on public.candidates for all using (auth.role() = 'authenticated');

-- Pipeline: all authenticated users can read/write
create policy "pipeline_all" on public.pipeline for all using (auth.role() = 'authenticated');

-- Activities: all authenticated users can read/write
create policy "activities_all" on public.activities for all using (auth.role() = 'authenticated');

-- ============================================================
-- UPDATED_AT triggers
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger clients_updated_at   before update on public.clients   for each row execute function public.set_updated_at();
create trigger jobs_updated_at      before update on public.jobs      for each row execute function public.set_updated_at();
create trigger candidates_updated_at before update on public.candidates for each row execute function public.set_updated_at();
create trigger pipeline_updated_at  before update on public.pipeline  for each row execute function public.set_updated_at();
