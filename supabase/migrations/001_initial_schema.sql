-- Everything Quince EP - Initial Schema
-- Run this in your Supabase SQL editor

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- =====================
-- ENUMS
-- =====================
create type vendor_plan as enum ('free', 'pro', 'premium');
create type vendor_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type lead_status as enum ('new', 'contacted', 'quoted', 'booked', 'closed');
create type subscription_status as enum ('active', 'canceled', 'past_due', 'trialing');
create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'canceled');

-- =====================
-- VENDORS TABLE
-- =====================
create table vendors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  business_name text not null,
  slug text unique not null,
  category text not null,
  description text,
  short_bio text,
  phone text,
  email text not null,
  website text,
  address text,
  city text default 'El Paso',
  state text default 'TX',
  zip text,
  logo_url text,
  cover_url text,
  gallery_urls text[] default '{}',
  plan vendor_plan default 'free',
  status vendor_status default 'pending',
  stripe_customer_id text,
  stripe_subscription_id text,
  is_featured boolean default false,
  average_rating numeric(3,2) default 0,
  review_count integer default 0,
  cities_served text[] default '{El Paso,Horizon City,Socorro}',
  starting_price integer,
  tags text[] default '{}',
  social_links jsonb default '{}',
  availability jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index vendors_category_idx on vendors(category);
create index vendors_status_idx on vendors(status);
create index vendors_plan_idx on vendors(plan);
create index vendors_slug_idx on vendors(slug);
create index vendors_city_idx on vendors(city);
create index vendors_search_idx on vendors using gin(
  to_tsvector('english', coalesce(business_name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(category,''))
);

-- =====================
-- LEADS TABLE
-- =====================
create table leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  event_date date,
  event_city text,
  guest_count integer,
  budget_range text,
  categories text[] not null,
  message text,
  status lead_status default 'new',
  source text default 'quote_form',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index leads_status_idx on leads(status);
create index leads_created_idx on leads(created_at desc);

-- =====================
-- LEAD ROUTING TABLE
-- =====================
create table lead_routing (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id) on delete cascade not null,
  vendor_id uuid references vendors(id) on delete cascade not null,
  status lead_status default 'new',
  viewed_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz default now(),
  unique(lead_id, vendor_id)
);

create index lead_routing_vendor_idx on lead_routing(vendor_id);
create index lead_routing_lead_idx on lead_routing(lead_id);

-- =====================
-- REVIEWS TABLE
-- =====================
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references vendors(id) on delete cascade not null,
  reviewer_name text not null,
  reviewer_email text,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text not null,
  event_date date,
  is_approved boolean default false,
  vendor_reply text,
  vendor_reply_at timestamptz,
  created_at timestamptz default now()
);

create index reviews_vendor_idx on reviews(vendor_id);
create index reviews_approved_idx on reviews(is_approved);

-- =====================
-- SUBSCRIPTIONS TABLE
-- =====================
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references vendors(id) on delete cascade not null,
  stripe_subscription_id text unique not null,
  stripe_customer_id text not null,
  plan vendor_plan not null,
  status subscription_status default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  canceled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index subscriptions_vendor_idx on subscriptions(vendor_id);
create index subscriptions_status_idx on subscriptions(status);

-- =====================
-- CLIENTS TABLE (Premium CRM)
-- =====================
create table clients (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references vendors(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  event_date date,
  event_type text default 'quinceañera',
  guest_count integer,
  venue text,
  budget integer,
  notes text,
  status text default 'prospect',
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index clients_vendor_idx on clients(vendor_id);

-- =====================
-- INVOICES TABLE (Premium)
-- =====================
create table invoices (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references vendors(id) on delete cascade not null,
  client_id uuid references clients(id) on delete set null,
  invoice_number text not null,
  client_name text not null,
  client_email text,
  line_items jsonb not null default '[]',
  subtotal integer not null default 0,
  tax_rate numeric(5,2) default 8.25,
  tax_amount integer default 0,
  total integer not null default 0,
  deposit_amount integer default 0,
  balance_due integer default 0,
  due_date date,
  notes text,
  terms text,
  status invoice_status default 'draft',
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index invoices_vendor_idx on invoices(vendor_id);
create index invoices_status_idx on invoices(status);

-- =====================
-- CHECKLIST PROGRESS TABLE
-- =====================
create table checklist_progress (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  task_id text not null,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(session_id, task_id)
);

create index checklist_session_idx on checklist_progress(session_id);

-- =====================
-- ANALYTICS TABLE
-- =====================
create table vendor_analytics (
  id uuid primary key default uuid_generate_v4(),
  vendor_id uuid references vendors(id) on delete cascade not null,
  event_type text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index analytics_vendor_idx on vendor_analytics(vendor_id);
create index analytics_created_idx on vendor_analytics(created_at desc);

-- =====================
-- EMAIL ANNOUNCEMENTS TABLE
-- =====================
create table announcements (
  id uuid primary key default uuid_generate_v4(),
  subject text not null,
  body text not null,
  sent_to text default 'all',
  sent_count integer default 0,
  sent_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- =====================
-- GALLERY IMAGES TABLE
-- =====================
create table gallery_images (
  id uuid primary key default uuid_generate_v4(),
  url text not null,
  alt text,
  category text,
  tags text[] default '{}',
  is_featured boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

alter table vendors enable row level security;
alter table leads enable row level security;
alter table lead_routing enable row level security;
alter table reviews enable row level security;
alter table subscriptions enable row level security;
alter table clients enable row level security;
alter table invoices enable row level security;
alter table checklist_progress enable row level security;
alter table vendor_analytics enable row level security;
alter table announcements enable row level security;
alter table gallery_images enable row level security;

-- Vendors: owners can read/update their own; public can read approved
create policy "vendors_public_read" on vendors for select using (status = 'approved');
create policy "vendors_owner_all" on vendors for all using (auth.uid() = user_id);
create policy "vendors_service_all" on vendors for all using (auth.role() = 'service_role');

-- Leads: service role only (admins)
create policy "leads_service_all" on leads for all using (auth.role() = 'service_role');

-- Lead routing: vendors see their own leads
create policy "lead_routing_vendor_read" on lead_routing for select using (
  vendor_id in (select id from vendors where user_id = auth.uid())
);
create policy "lead_routing_service_all" on lead_routing for all using (auth.role() = 'service_role');

-- Reviews: approved reviews public; vendors manage their own
create policy "reviews_public_read" on reviews for select using (is_approved = true);
create policy "reviews_vendor_manage" on reviews for all using (
  vendor_id in (select id from vendors where user_id = auth.uid())
);
create policy "reviews_service_all" on reviews for all using (auth.role() = 'service_role');
create policy "reviews_insert_public" on reviews for insert with check (true);

-- Subscriptions: vendor owned
create policy "subscriptions_owner" on subscriptions for all using (
  vendor_id in (select id from vendors where user_id = auth.uid())
);
create policy "subscriptions_service" on subscriptions for all using (auth.role() = 'service_role');

-- Clients: premium vendors only
create policy "clients_owner" on clients for all using (
  vendor_id in (select id from vendors where user_id = auth.uid() and plan = 'premium')
);

-- Invoices: premium vendors only
create policy "invoices_owner" on invoices for all using (
  vendor_id in (select id from vendors where user_id = auth.uid() and plan = 'premium')
);

-- Checklist: public (session-based)
create policy "checklist_public" on checklist_progress for all using (true);

-- Analytics: vendor owned
create policy "analytics_owner" on vendor_analytics for select using (
  vendor_id in (select id from vendors where user_id = auth.uid())
);
create policy "analytics_service" on vendor_analytics for all using (auth.role() = 'service_role');

-- Gallery: public read
create policy "gallery_public_read" on gallery_images for select using (true);
create policy "gallery_service_all" on gallery_images for all using (auth.role() = 'service_role');

-- Announcements: service only
create policy "announcements_service" on announcements for all using (auth.role() = 'service_role');

-- =====================
-- FUNCTIONS & TRIGGERS
-- =====================

-- Update vendor rating when review is approved
create or replace function update_vendor_rating()
returns trigger as $$
begin
  update vendors set
    average_rating = (
      select round(avg(rating)::numeric, 2) from reviews
      where vendor_id = new.vendor_id and is_approved = true
    ),
    review_count = (
      select count(*) from reviews
      where vendor_id = new.vendor_id and is_approved = true
    ),
    updated_at = now()
  where id = new.vendor_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger vendor_rating_update
after insert or update on reviews
for each row execute function update_vendor_rating();

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger vendors_updated_at before update on vendors
for each row execute function update_updated_at();

create trigger leads_updated_at before update on leads
for each row execute function update_updated_at();

create trigger subscriptions_updated_at before update on subscriptions
for each row execute function update_updated_at();

create trigger clients_updated_at before update on clients
for each row execute function update_updated_at();

create trigger invoices_updated_at before update on invoices
for each row execute function update_updated_at();

-- =====================
-- SEED DATA
-- =====================

-- Sample gallery images
insert into gallery_images (url, alt, category, tags, is_featured, sort_order) values
('/images/gallery/quince-1.jpg', 'Elegant ballroom quinceañera', 'venues', array['elegant', 'ballroom', 'formal'], true, 1),
('/images/gallery/quince-2.jpg', 'Garden quinceañera celebration', 'venues', array['garden', 'outdoor', 'floral'], true, 2),
('/images/gallery/quince-3.jpg', 'Pink and gold quinceañera decorations', 'decorations', array['pink', 'gold', 'luxe'], true, 3),
('/images/gallery/quince-4.jpg', 'Quinceañera court in formal gowns', 'damas', array['court', 'formal', 'pink'], false, 4),
('/images/gallery/quince-5.jpg', 'Floral arrangements quinceañera', 'florals', array['flowers', 'centerpieces', 'roses'], false, 5),
('/images/gallery/quince-6.jpg', 'Three-tier quinceañera cake', 'cakes', array['cake', 'gold', 'floral'], true, 6),
('/images/gallery/quince-7.jpg', 'Live DJ at quinceañera reception', 'entertainment', array['dj', 'dance', 'party'], false, 7),
('/images/gallery/quince-8.jpg', 'Professional quinceañera photography', 'photography', array['photo', 'candid', 'memory'], false, 8),
('/images/gallery/quince-9.jpg', 'Quinceañera limousine arrival', 'transportation', array['limo', 'entrance', 'glam'], false, 9),
('/images/gallery/quince-10.jpg', 'Catering spread at quinceañera', 'catering', array['food', 'buffet', 'elegant'], false, 10),
('/images/gallery/quince-11.jpg', 'Rustic chic quinceañera theme', 'decorations', array['rustic', 'chic', 'boho'], false, 11),
('/images/gallery/quince-12.jpg', 'Masquerade quinceañera theme', 'themes', array['masquerade', 'dramatic', 'gold'], false, 12);
