import { Home, CalendarCheck, FolderKanban, Share2, LucideIcon } from "lucide-react";

export type ProfileTab = "overview" | "attendance" | "portfolio" | "affiliate";

export interface ProfileNavItem {
  key: ProfileTab;
  label: string;
  icon: LucideIcon;
  description: string;
  badge?: string;
}

export const PROFILE_NAV_ITEMS: ProfileNavItem[] = [
  {
    key: "overview",
    label: "Dashboard",
    icon: Home,
    description: "Ringkasan & Metrik Performa",
  },
  {
    key: "attendance",
    label: "Absensi",
    icon: CalendarCheck,
    description: "Riwayat Event & Kehadiran",
  },
  {
    key: "portfolio",
    label: "Portofolio",
    icon: FolderKanban,
    description: "Etalase Karya & Jam Terbang",
  },
  {
    key: "affiliate",
    label: "Affiliate",
    icon: Share2,
    description: "Program Referral & Komisi",
  },
];
