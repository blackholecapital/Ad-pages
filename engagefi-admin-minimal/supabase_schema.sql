-- EngageFi QuestBoard (Demo Mode)
-- NOTE: This schema is demo-grade (anon key + permissive access). We'll harden with auth/RLS later.

-- Enable pgcrypto for gen_random_uuid (Supabase usually has it; keep for local compatibility)
create extension if not exists pgcrypto;

-- Missions
create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  action text not null,
  type text not null, -- external-link | time-based | signature | custom
  title text not null,
  cta_url text null,
  points int not null default 10,
  tier_required int not null default 1,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz default now()
);
-- Migration safety: if missions was created earlier with missing columns, add them.
alter table public.missions add column if not exists platform text not null default 'unknown';
alter table public.missions add column if not exists action text not null default 'unknown';
alter table public.missions add column if not exists type text not null default 'custom';
alter table public.missions add column if not exists title text not null default 'Untitled';
alter table public.missions add column if not exists cta_url text null;
alter table public.missions add column if not exists points int not null default 10;
alter table public.missions add column if not exists tier_required int not null default 1;
alter table public.missions add column if not exists is_active boolean not null default true;
alter table public.missions add column if not exists sort_order int not null default 0;

-- Backfill/migration safety for older tables created without sort_order
alter table public.missions add column if not exists sort_order int not null default 0;
-- Users
create table if not exists public.users (
  wallet_address text primary key,
  points_total int not null default 0,
  tier int not null default 1,
  created_at timestamptz default now(),
  last_seen timestamptz default now()
);

-- Completions
create table if not exists public.user_mission_completions (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null references public.users(wallet_address),
  mission_id uuid not null references public.missions(id),
  status text not null default 'completed',
  completed_at timestamptz default now(),
  proof_payload jsonb null,
  unique (wallet_address, mission_id)
);

-- Demo mode access:
-- For demo simplicity, keep RLS disabled OR permissive.
alter table public.missions disable row level security;
alter table public.users disable row level security;
alter table public.user_mission_completions disable row level security;
