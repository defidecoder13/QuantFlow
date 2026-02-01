-- 1. STRATEGIES TABLE
create table if not exists strategies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  content jsonb not null default '{}'::jsonb, -- Stores the strategy logic/groups
  is_active boolean default false,
  risk_settings jsonb default '{"stopLoss": 2, "takeProfit": 5}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. PAPER POSITIONS TABLE
create table if not exists paper_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  strategy_name text,
  pair text not null,
  side text not null,
  amount numeric not null,
  entry_price numeric not null,
  exit_price numeric,
  pnl numeric default 0,
  status text not null default 'OPEN', -- 'OPEN' | 'CLOSED'
  opened_at timestamptz default now(),
  closed_at timestamptz
);

-- 3. USER SETTINGS (Paper Balance)
create table if not exists user_settings (
  user_id uuid primary key references auth.users,
  paper_balance numeric default 50000,
  updated_at timestamptz default now()
);

-- 4. ROW LEVEL SECURITY (RLS)
alter table strategies enable row level security;
alter table paper_positions enable row level security;
alter table user_settings enable row level security;

-- 5. POLICIES
-- Strategies
create policy "Users can view own strategies" on strategies for select using (auth.uid() = user_id);
create policy "Users can insert own strategies" on strategies for insert with check (auth.uid() = user_id);
create policy "Users can update own strategies" on strategies for update using (auth.uid() = user_id);
create policy "Users can delete own strategies" on strategies for delete using (auth.uid() = user_id);

-- Positions
create policy "Users can view own positions" on paper_positions for select using (auth.uid() = user_id);
create policy "Users can insert own positions" on paper_positions for insert with check (auth.uid() = user_id);
create policy "Users can update own positions" on paper_positions for update using (auth.uid() = user_id);
create policy "Users can delete own positions" on paper_positions for delete using (auth.uid() = user_id);

-- Settings
create policy "Users can view own settings" on user_settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on user_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on user_settings for update using (auth.uid() = user_id);

-- 6. Helper to create settings on user signup (Optional trigger, but manual insert in code is safer for now)
