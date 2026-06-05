-- Migration 004: Billing fields for Stripe integration
-- Run this in Supabase SQL editor after 003_standpoint_auth_schema.sql

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS trial_ends_at        TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS current_period_end   TIMESTAMPTZ DEFAULT NULL;

-- Column that the email route already references
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN businesses.subscription_status IS 'trialing | active | past_due | canceled | null (no sub started)';
