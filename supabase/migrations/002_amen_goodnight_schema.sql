-- amen-goodnight: profiles, children, stories
-- Run after 001_initial_schema.sql

-- =====================
-- PROFILES TABLE
-- =====================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  stripe_customer_id text,
  subscription_status text check (subscription_status in ('trialing', 'active', 'canceled', 'past_due')),
  plan text check (plan in ('family', 'growing_family')),
  created_at timestamptz default now()
);

create index profiles_stripe_customer_idx on profiles(stripe_customer_id);
create index profiles_subscription_status_idx on profiles(subscription_status);

-- =====================
-- CHILDREN TABLE
-- =====================
create table children (
  id uuid primary key default uuid_generate_v4(),
  parent_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  age integer not null,
  gender text,
  interests text[] default '{}',
  delivery_time text not null,
  active boolean not null default true,
  created_at timestamptz default now()
);

create index children_parent_idx on children(parent_id);
create index children_active_idx on children(parent_id, active);

-- =====================
-- STORIES TABLE
-- =====================
create table stories (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references children(id) on delete cascade,
  title text not null,
  content text not null,
  scripture_text text,
  scripture_reference text,
  prayer text,
  faith_theme text,
  interest_used text,
  delivered_at timestamptz,
  created_at timestamptz default now()
);

create index stories_child_idx on stories(child_id);
create index stories_delivered_idx on stories(child_id, delivered_at desc);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
alter table profiles enable row level security;
alter table children enable row level security;
alter table stories enable row level security;

-- profiles: users manage only their own row
create policy "profiles_owner_select" on profiles
  for select using (auth.uid() = id);

create policy "profiles_owner_insert" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles_owner_update" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_owner_delete" on profiles
  for delete using (auth.uid() = id);

-- Service role bypass for webhook handlers (Stripe, etc.)
create policy "profiles_service_all" on profiles
  for all using (auth.role() = 'service_role');

-- children: parents can only access their own children
create policy "children_owner_select" on children
  for select using (parent_id = auth.uid());

create policy "children_owner_insert" on children
  for insert with check (parent_id = auth.uid());

create policy "children_owner_update" on children
  for update using (parent_id = auth.uid()) with check (parent_id = auth.uid());

create policy "children_owner_delete" on children
  for delete using (parent_id = auth.uid());

create policy "children_service_all" on children
  for all using (auth.role() = 'service_role');

-- stories: parents access stories via their children
create policy "stories_owner_select" on stories
  for select using (
    child_id in (select id from children where parent_id = auth.uid())
  );

create policy "stories_owner_insert" on stories
  for insert with check (
    child_id in (select id from children where parent_id = auth.uid())
  );

create policy "stories_owner_update" on stories
  for update using (
    child_id in (select id from children where parent_id = auth.uid())
  );

create policy "stories_owner_delete" on stories
  for delete using (
    child_id in (select id from children where parent_id = auth.uid())
  );

create policy "stories_service_all" on stories
  for all using (auth.role() = 'service_role');

-- =====================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
