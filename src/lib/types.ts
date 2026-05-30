export type MemberRole = 'manager' | 'employee';
export type CategoryStatus = 'strong' | 'developing' | 'needs_work';

export const CATEGORY_STATUS_LABELS: Record<CategoryStatus, string> = {
  strong: 'Strong',
  developing: 'Developing',
  needs_work: 'Needs Work',
};

export const CATEGORY_STATUS_COLORS: Record<CategoryStatus, { bg: string; text: string; border: string }> = {
  strong:     { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  developing: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
  needs_work: { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200'      },
};

export function deriveStatus(starRating: number): CategoryStatus {
  if (starRating >= 4) return 'strong';
  if (starRating === 3) return 'developing';
  return 'needs_work';
}

export function derivePercentage(starRating: number): number {
  return Math.round((starRating / 5) * 100);
}

export function computeInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const DEFAULT_REVIEW_CATEGORIES = [
  'Communication',
  'Productivity',
  'Teamwork',
  'Leadership',
  'Technical Skills',
] as const;

export interface Business {
  id: string;
  name: string;
  owner_id: string;
  join_code: string;
  plan: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  business_id: string;
  full_name: string;
  email: string;
  role: MemberRole;
  avatar_initials: string;
  created_at: string;
  updated_at: string;
  // joined
  businesses?: Business | null;
}

export interface Review {
  id: string;
  business_id: string;
  manager_id: string;
  employee_id: string;
  period: string;
  overall_score: number | null;
  ai_summary: string | null;
  overall_notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  review_categories?: ReviewCategory[];
  employee?: Pick<Profile, 'id' | 'full_name' | 'avatar_initials'> | null;
  manager?: Pick<Profile, 'id' | 'full_name'> | null;
}

export interface ReviewCategory {
  id: string;
  review_id: string;
  category_name: string;
  star_rating: number;
  percentage_score: number;
  status: CategoryStatus;
  notes: string | null;
  created_at: string;
}
