-- Standpoint v2 — Business Auth Schema
-- Run after 001_initial_schema.sql
-- Replaces tables created in 002_standpoint_schema.sql

-- =====================
-- CLEAN UP v1 tables
-- =====================
drop table if exists review_scores cascade;
drop table if exists performance_reviews cascade;
drop table if exists employee_invites cascade;
drop table if exists profiles cascade;
drop table if exists organizations cascade;

drop type if exists user_role cascade;
drop type if exists review_category cascade;
drop type if exists invite_status cascade;
drop type if exists org_plan cascade;

-- =====================
-- ENUMS
-- =====================
create type member_role as enum ('manager', 'employee');
create type category_status as enum ('strong', 'developing', 'needs_work');

-- =====================
-- BUSINESSES TABLE
-- =====================
create table businesses (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  owner_id   uuid references auth.users(id) on delete cascade not null,
  join_code  text unique not null,
  plan       text not null default 'free',
  stripe_customer_id      text,
  stripe_subscription_id  text,
  created_at timestamptz default now()
);

create index businesses_owner_idx     on businesses(owner_id);
create index businesses_join_code_idx on businesses(join_code);

-- =====================
-- PROFILES TABLE
-- =====================
create table profiles (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade not null unique,
  business_id      uuid references businesses(id) on delete cascade not null,
  full_name        text not null,
  email            text not null,
  role             member_role not null default 'employee',
  avatar_initials  text not null,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index profiles_user_idx     on profiles(user_id);
create index profiles_business_idx on profiles(business_id);
create index profiles_role_idx     on profiles(role);

-- =====================
-- REVIEWS TABLE
-- =====================
create table reviews (
  id            uuid primary key default uuid_generate_v4(),
  business_id   uuid references businesses(id) on delete cascade not null,
  manager_id    uuid references profiles(id) on delete cascade not null,
  employee_id   uuid references profiles(id) on delete cascade not null,
  period        text not null,
  overall_score numeric(4, 2),
  ai_summary    text,
  overall_notes text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index reviews_business_idx  on reviews(business_id);
create index reviews_employee_idx  on reviews(employee_id);
create index reviews_manager_idx   on reviews(manager_id);
create index reviews_created_idx   on reviews(created_at desc);

-- =====================
-- REVIEW CATEGORIES TABLE
-- =====================
create table review_categories (
  id               uuid primary key default uuid_generate_v4(),
  review_id        uuid references reviews(id) on delete cascade not null,
  category_name    text not null,
  star_rating      integer not null check (star_rating between 1 and 5),
  percentage_score integer not null check (percentage_score between 0 and 100),
  status           category_status not null,
  notes            text,
  created_at       timestamptz default now(),
  unique(review_id, category_name)
);

create index categories_review_idx on review_categories(review_id);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
alter table businesses       enable row level security;
alter table profiles         enable row level security;
alter table reviews          enable row level security;
alter table review_categories enable row level security;

-- Businesses: owner full access; members read
create policy "businesses_owner_all" on businesses
  for all using (auth.uid() = owner_id);

create policy "businesses_member_read" on businesses
  for select using (
    id in (select business_id from profiles where user_id = auth.uid())
  );

create policy "businesses_service_all" on businesses
  for all using (auth.role() = 'service_role');

-- Profiles: self full access; business members can read each other
create policy "profiles_self_all" on profiles
  for all using (user_id = auth.uid());

create policy "profiles_business_read" on profiles
  for select using (
    business_id in (select business_id from profiles where user_id = auth.uid())
  );

create policy "profiles_service_all" on profiles
  for all using (auth.role() = 'service_role');

-- Reviews: employees read their own only; managers read/write all in their business
create policy "reviews_employee_read" on reviews
  for select using (
    employee_id in (select id from profiles where user_id = auth.uid())
  );

create policy "reviews_manager_all" on reviews
  for all using (
    business_id in (
      select p.business_id from profiles p
      where p.user_id = auth.uid() and p.role = 'manager'
    )
  );

create policy "reviews_service_all" on reviews
  for all using (auth.role() = 'service_role');

-- Review categories: follow parent review access
create policy "categories_employee_read" on review_categories
  for select using (
    review_id in (
      select r.id from reviews r
      join profiles p on p.id = r.employee_id
      where p.user_id = auth.uid()
    )
  );

create policy "categories_manager_all" on review_categories
  for all using (
    review_id in (
      select r.id from reviews r
      join profiles p on p.business_id = r.business_id
      where p.user_id = auth.uid() and p.role = 'manager'
    )
  );

create policy "categories_service_all" on review_categories
  for all using (auth.role() = 'service_role');

-- =====================
-- TRIGGERS
-- =====================
create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger reviews_updated_at before update on reviews
  for each row execute function update_updated_at();
