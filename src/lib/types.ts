export type UserRole = 'manager' | 'employee';
export type OrgPlan = 'free' | 'pro';
export type InviteStatus = 'pending' | 'accepted' | 'expired';

export type ReviewCategory =
  | 'communication'
  | 'productivity'
  | 'teamwork'
  | 'leadership'
  | 'technical_skills';

export const REVIEW_CATEGORIES: { key: ReviewCategory; label: string; description: string }[] = [
  {
    key: 'communication',
    label: 'Communication',
    description: 'Clarity, responsiveness, and effectiveness in conveying ideas',
  },
  {
    key: 'productivity',
    label: 'Productivity',
    description: 'Output quality, efficiency, and meeting deadlines',
  },
  {
    key: 'teamwork',
    label: 'Teamwork',
    description: 'Collaboration, support of colleagues, and team contribution',
  },
  {
    key: 'leadership',
    label: 'Leadership',
    description: 'Initiative, decision-making, and influence on the team',
  },
  {
    key: 'technical_skills',
    label: 'Technical Skills',
    description: 'Role-specific expertise and continuous learning',
  },
];

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: OrgPlan;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  org_id: string | null;
  full_name: string;
  email: string;
  role: UserRole;
  title: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeInvite {
  id: string;
  org_id: string;
  invited_email: string;
  invited_by: string;
  token: string;
  status: InviteStatus;
  accepted_by: string | null;
  expires_at: string;
  created_at: string;
}

export interface PerformanceReview {
  id: string;
  org_id: string;
  employee_id: string;
  manager_id: string;
  period: string;
  overall_notes: string | null;
  coaching_summary: string | null;
  coaching_generated_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields — Supabase returns the table name as key
  review_scores?: ReviewScore[];
  scores?: ReviewScore[];
  employee?: Profile | { full_name: string } | null;
  manager?: Profile | { full_name: string } | null;
}

export interface ReviewScore {
  id: string;
  review_id: string;
  category: ReviewCategory;
  rating: number;
  notes: string | null;
  created_at: string;
}
