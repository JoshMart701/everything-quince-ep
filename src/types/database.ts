export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type SubscriptionStatus = 'trialing' | 'active' | 'canceled' | 'past_due'
export type Plan = 'family' | 'growing_family'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  stripe_customer_id: string | null
  subscription_status: SubscriptionStatus | null
  plan: Plan | null
  created_at: string
}

export interface Child {
  id: string
  parent_id: string
  name: string
  age: number
  gender: string | null
  interests: string[]
  delivery_time: string
  active: boolean
  created_at: string
}

export interface Story {
  id: string
  child_id: string
  title: string
  content: string
  scripture_text: string | null
  scripture_reference: string | null
  prayer: string | null
  faith_theme: string | null
  interest_used: string | null
  delivered_at: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'> & { created_at?: string }
        Update: Partial<Omit<Profile, 'id'>>
      }
      children: {
        Row: Child
        Insert: Omit<Child, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Child, 'id' | 'parent_id'>>
      }
      stories: {
        Row: Story
        Insert: Omit<Story, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Story, 'id' | 'child_id'>>
      }
    }
  }
}
