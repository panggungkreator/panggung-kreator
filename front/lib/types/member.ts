export type Community = 'panggung_kreator' | 'berani_tampil_bicara'
export type MembershipTier = 'free' | 'priority' | 'membership'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type PrimaryInterest = 'public_speaking' | 'mc_host' | 'voice_over' | 'content_creator' | 'personal_branding' | 'live_host'
export type Pillar = 'public_speaking' | 'content_creation' | 'personal_branding'
export type ItemType = 'video' | 'image' | 'article' | 'link' | 'achievement'
export type MediaSource = 'youtube' | 'instagram' | 'tiktok' | 'storage' | 'external'

export interface MemberInterests {
  id: string
  member_id: string
  primary_interests: PrimaryInterest[]
  experience_level: ExperienceLevel | null
  goals: string[]
  content_topics: string[]
  availability: string | null
  learning_preference: string[]
  referral_source: string | null
  ai_analysis: string | null
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
  avatar_url: string | null
  youtube_url: string | null
  linkedin_url: string | null
  portfolio_url: string | null
  instagram_username: string | null
  tiktok_username: string | null
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
