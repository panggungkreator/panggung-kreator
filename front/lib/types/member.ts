export type Community = 'panggung_kreator' | 'berani_tampil_bicara'
export type MembershipTier = 'free' | 'priority' | 'membership'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type PrimaryInterest = 'public_speaking' | 'mc_host' | 'voice_over' | 'content_creator' | 'personal_branding' | 'live_host'
export type Pillar = 'public_speaking' | 'content_creation' | 'personal_branding'
export type ItemType = 'video' | 'image' | 'article' | 'link' | 'achievement'
export type MediaSource = 'youtube' | 'instagram' | 'tiktok' | 'storage' | 'external'

export interface AiAnalysis {
  ringkasan: string;
  diagnosis_ps: string;
  potensi_konten: string;
  roadmap: string;
  insight_mentor: string;
  rekomendasi_ekosistem: string;
  legacy?: string;
}

export interface MemberInterests {
  id: string
  member_id: string
  primary_interests: PrimaryInterest[]
  experience_level: ExperienceLevel | null
  goals: string[]
  content_topics: string[]
  availability: string | null
  learning_preference: string[]
  ai_analysis: AiAnalysis | string | null
  skills_to_master: string | null
  monetization_interest: string | null
  active_communities: string | null
  career_obstacle: string | null
  ps_challenges: string[]
  confidence_scale: number | null
  nervous_trigger: string | null
  role_model: string | null
  target_audience: string | null
  expert_desire: string | null
  time_commitment: string | null
  created_at: string
  updated_at: string
}

export interface PortfolioItem {
  id: string
  member_id: string
  pillar: Pillar
  item_type: ItemType
  title: string
  description: string | null
  media_url: string | null
  media_source: MediaSource
  thumbnail_url: string | null
  is_featured: boolean
  is_public: boolean
  view_count: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SocialMedia {
  instagram?: string | null;
  tiktok?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
  spotify?: string | null;
}

export interface MemberProfile {
  id: string
  full_name: string
  stage_name: string
  username: string | null
  email: string | null
  whatsapp_number: string | null
  occupation: string | null
  description: string | null
  city: string | null
  birth_date: string | null
  address: string | null
  social_media: SocialMedia | null
  avatar_url: string | null
  portfolio_url: string | null
  community: Community
  membership_tier: MembershipTier
  subscribed_newsletter: boolean
  affiliate_code: string | null
  referred_by: string | null
  commission_balance: number
  profile_completed_at: string | null
  interests?: MemberInterests
  portfolio?: PortfolioItem[]
}

export interface AttendanceEvent {
  title: string
  event_type: string
  event_date: string
  start_time: string
  end_time: string | null
  location: string
}

export interface AttendanceRecord {
  id: string
  event_id: string
  member_id: string
  is_present: boolean
  scan_method: 'qr' | 'manual' | 'rsvp_only' | null
  scanned_at: string | null
  created_at: string
  event: AttendanceEvent
}

export interface AttendanceStats {
  totalAttended: number
  totalEvents: number
  attendanceRate: number
  currentStreak: number
  longestStreak: number
  lastAttendedEvent: AttendanceEvent | null
}

export interface ReferralMember {
  id: string
  full_name: string
  email: string | null
  membership_tier: MembershipTier
  created_at: string
}

export interface ReferralCode {
  id: string
  code: string
  owner_member_id: string
  description: string | null
  is_active: boolean
  usage_count: number
  max_usage: number
  total_revenue: number
  default_reward: number
  created_at: string
  updated_at: string
  owner?: {
    full_name: string
    email: string | null
  }
}

export interface ReferralReward {
  id: string
  transaction_id: string
  referral_code_id: string | null
  referrer_id: string
  referred_id: string
  reward_amount: number
  status: 'pending' | 'confirmed' | 'redeemed' | 'paid_out' | 'cancelled'
  confirmed_by: string | null
  confirmed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  referrer?: {
    full_name: string
    email: string | null
  }
  referred?: {
    full_name: string
    email: string | null
  }
  transaction?: {
    order_id: string
    final_amount: number
  }
}

export interface CommissionLedgerEntry {
  id: string
  member_id: string
  type: 'credit' | 'debit'
  amount: number
  balance_after: number
  source: 'referral_reward' | 'redeem_membership' | 'cash_out' | 'manual_adjustment'
  reference_id: string | null
  description: string | null
  created_by: string | null
  created_at: string
}


