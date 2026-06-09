export interface StripePrice { id: string; unit_amount: number | null; currency: string; recurring: { interval: 'day' | 'week' | 'month' | 'year'; interval_count: number } | null }
export interface StripeSubscription { id: string; status: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing' | 'unpaid'; current_period_end: number; cancel_at_period_end: boolean }
