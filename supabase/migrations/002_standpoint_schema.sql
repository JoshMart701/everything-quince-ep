-- Standpoint - Performance Review SaaS Schema
-- Run this in your Supabase SQL editor after 001_initial_schema.sql

-- =====================
-- ENUMS
-- =====================
create type user_role as enum ('manager', 'employee');
create type review_category as enum (
  'communication',
  'productivity',
  'teamwork',
  'leadership',
  'technical_skills'
);
create type invite_status as enum ('pending', 'accepted', 'expired');
create type org_plan as enum ('free', 'pro');

-- =====================
-- ORGANIZATIONS TABLE
-- =====================
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan org_plan default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index organizations_owner_idx on organizations(owner_id);

-- =====================
-- PROFILES TABLE
-- =====================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid references organizations(id) on delete cascade,
  full_name text not null,
  email text not null,
  role user_role not null default 'employee',
  title text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index profiles_org_idx on profiles(org_id);
create index profiles_role_idx on profiles(role);

-- =====================
-- EMPLOYEE INVITES TABLE
-- =====================
create table employee_invites (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade not null,
  invited_email text not null,
  invited_by uuid references auth.users(id) on delete cascade not null,
  token text unique not null default gen_random_uuid()::text,
  status invite_status default 'pending',
  accepted_by uuid references auth.users(id),
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);

create index invites_org_idx on employee_invites(org_id);
create index invites_token_idx on employee_invites(token);
create index invites_email_idx on employee_invites(invited_email);

-- =====================
-- PERFORMANCE REVIEWS TABLE
-- =====================
create table performance_reviews (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade not null,
  employee_id uuid references profiles(id) on delete cascade not null,
  manager_id uuid references profiles(id) on delete cascade not null,
  period text not null,
  overall_notes text,
  coaching_summary text,
  coaching_generated_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index reviews_org_idx on performance_reviews(org_id);
create index reviews_employee_idx on performance_reviews(employee_id);
create index reviews_manager_idx on performance_reviews(manager_id);
create index reviews_created_idx on performance_reviews(created_at desc);

-- =====================
-- REVIEW SCORES TABLE
-- =====================
create table review_scores (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid references performance_reviews(id) on delete cascade not null,
  category review_category not null,
  rating integer not null check (rating between 1 and 5),
  notes text,
  created_at timestamptz default now(),
  unique(review_id, category)
);

create index scores_review_idx on review_scores(review_id);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table employee_invites enable row level security;
alter table performance_reviews enable row level security;
alter table review_scores enable row level security;

-- Organizations: owner has full access
create policy "org_owner_all" on organizations
  for all using (auth.uid() = owner_id);

create policy "org_member_read" on organizations
  for select using (
    id in (select org_id from profiles where id = auth.uid())
  );

create policy "org_service_all" on organizations
  for all using (auth.role() = 'service_role');

-- Profiles: users read their own org's profiles; service role all
create policy "profiles_self_all" on profiles
  for all using (id = auth.uid());

create policy "profiles_org_read" on profiles
  for select using (
    org_id in (select org_id from profiles where id = auth.uid())
  );

create policy "profiles_service_all" on profiles
  for all using (auth.role() = 'service_role');

-- Invites: managers in org can manage; service role all
create policy "invites_manager_all" on employee_invites
  for all using (
    org_id in (
      select p.org_id from profiles p
      where p.id = auth.uid() and p.role = 'manager'
    )
  );

create policy "invites_service_all" on employee_invites
  for all using (auth.role() = 'service_role');

-- Performance reviews: managers can create/read; employees read their own
create policy "reviews_manager_all" on performance_reviews
  for all using (
    org_id in (
      select p.org_id from profiles p
      where p.id = auth.uid() and p.role = 'manager'
    )
  );

create policy "reviews_employee_read" on performance_reviews
  for select using (employee_id = auth.uid());

create policy "reviews_service_all" on performance_reviews
  for all using (auth.role() = 'service_role');

-- Review scores: accessible if you can access the review
create policy "scores_manager_all" on review_scores
  for all using (
    review_id in (
      select r.id from performance_reviews r
      join profiles p on p.org_id = r.org_id
      where p.id = auth.uid() and p.role = 'manager'
    )
  );

create policy "scores_employee_read" on review_scores
  for select using (
    review_id in (
      select id from performance_reviews where employee_id = auth.uid()
    )
  );

create policy "scores_service_all" on review_scores
  for all using (auth.role() = 'service_role');

-- =====================
-- FUNCTIONS & TRIGGERS
-- =====================

-- Auto-create profile on user signup (called by auth trigger)
create or replace function handle_new_user()
returns trigger as $$
begin
  -- Profile is created manually via API; this is a safety no-op
  return new;
end;
$$ language plpgsql security definer;

-- Auto-update updated_at on organizations
create trigger orgs_updated_at before update on organizations
  for each row execute function update_updated_at();

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger perf_reviews_updated_at before update on performance_reviews
  for each row execute function update_updated_at();
