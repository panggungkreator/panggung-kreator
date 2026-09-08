export interface GrowthBadge {
  value: string;
  isPositive: boolean;
  period: string;
}

export interface StatMetric {
  value: string;
  label: string;
  growth: GrowthBadge;
  sparklineColor: string;
  sparklinePath: string;
}

export interface DemographicsMetric {
  summary: string;
  ageDistribution: Array<{ range: string; count: number; percentage: number }>;
  careerGoalDistribution: Array<{ name: string; count: number; percentage: number; color?: string }>;
  genderDistribution?: Array<{ gender: string; count: number; percentage: number; color: string }>;
  occupationDistribution: Array<{ name: string; count: number; percentage: number }>;
  topCities: Array<{ city: string; count: number; percentage: number }>;
}

export interface EventAttendance {
  id: string;
  title: string;
  shortDate: string;
  fullDate: string;
  attendees: number;
  target?: number;
}

export interface MemberStreak {
  rank: number;
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  tier: "Free" | "Starter" | "Creator" | "Pro" | string;
  streak: number;
  totalAttendance: number;
}

export interface CategoricalInsight {
  name: string;
  count: number;
  percentage: number;
}

export interface DashboardPayload {
  adminName?: string;
  stats: {
    totalMembers: number;
    memberGrowthPercentage: number;
    totalEvents: number;
    eventGrowthPercentage: number;
  };
  eventAttendances: EventAttendance[];
  streakLeaderboard: MemberStreak[];
  demographics: DemographicsMetric;
  topSkills: CategoricalInsight[];
  topChallenges: CategoricalInsight[];
  monetizationInterests: CategoricalInsight[];
}
