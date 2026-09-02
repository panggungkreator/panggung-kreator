"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signout } from "@/lib/actions/auth-actions";
import {
  Sun,
  Moon,
  Bell,
  LogOut,
  ChevronDown,
  Users,
  CreditCard,
  CheckSquare,
  Package,
  Tag,
  DollarSign,
  Calendar,
  FileText,
  Image as ImageIcon,
  FolderOpen,
  TrendingUp,
  Activity,
  ShieldAlert,
  Key,
  ClipboardList,
  MapPin,
  Briefcase,
  Home,
  LayoutDashboard,
  Settings,
  PanelLeft,
  Menu,
  X,
  Loader2,
  Gift,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSuperAdmin as checkIsSuperAdmin } from "@/lib/security";
interface Permission {
  can_view: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  module: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const getIconComponent = (name: string, size = 14) => {
  switch (name) {
    case "users": return <Users size={size} />;
    case "credit-card": return <CreditCard size={size} />;
    case "check-square": return <CheckSquare size={size} />;
    case "package": return <Package size={size} />;
    case "tag": return <Tag size={size} />;
    case "gift": return <Gift size={size} />;
    case "dollar-sign": return <DollarSign size={size} />;
    case "calendar": return <Calendar size={size} />;
    case "file-text": return <FileText size={size} />;
    case "map-pin": return <MapPin size={size} />;
    case "briefcase": return <Briefcase size={size} />;
    case "image": return <ImageIcon size={size} />;
    case "folder-open": return <FolderOpen size={size} />;
    case "trending-up": return <TrendingUp size={size} />;
    case "activity": return <Activity size={size} />;
    case "shield-alert": return <ShieldAlert size={size} />;
    case "key": return <Key size={size} />;
    case "clipboard-list": return <ClipboardList size={size} />;
    default: return <FileText size={size} />;
  }
};

const staticNavGroups: NavGroup[] = [
  {
    title: "DATA CENTER",
    items: [
      { label: "Membership", href: "/admin/members", icon: getIconComponent("users"), module: "members" },
      { label: "Transactions", href: "/admin/transactions", icon: getIconComponent("credit-card"), module: "transactions" },
      { label: "Attendance", href: "/admin/attendance", icon: getIconComponent("check-square"), module: "attendance" },
    ]
  },
  {
    title: "AKADEMI",
    items: [
      { label: "Packages", href: "/admin/packages", icon: getIconComponent("package"), module: "packages" },
      { label: "Voucher", href: "/admin/voucher", icon: getIconComponent("tag"), module: "voucher" },
      { label: "Referral Code", href: "/admin/referral", icon: getIconComponent("gift"), module: "referral" },
      { label: "Payment", href: "/admin/payment", icon: getIconComponent("dollar-sign"), module: "payment" },
      { label: "Mentoring", href: "/admin/mentoring", icon: getIconComponent("calendar"), module: "mentoring" },
      { label: "Resources", href: "/admin/resources", icon: getIconComponent("file-text"), module: "resources" },
    ]
  },
  {
    title: "KOMUNITAS",
    items: [
      { label: "Acara & Event", href: "/admin/acara", icon: getIconComponent("calendar"), module: "acara" },
      { label: "Venue", href: "/admin/venue", icon: getIconComponent("map-pin"), module: "venue" },
      { label: "Partner", href: "/admin/partner", icon: getIconComponent("briefcase"), module: "partner" },
    ]
  },
  {
    title: "CMS",
    items: [
      { label: "Landing Komunitas", href: "/admin/cms-komunitas", icon: getIconComponent("file-text"), module: "cms_komunitas" },
      { label: "Landing Akademi", href: "/admin/cms-akademi", icon: getIconComponent("file-text"), module: "cms_akademi" },
      { label: "Kelola Galeri", href: "/admin/galeri", icon: getIconComponent("image"), module: "cms_galeri" },
      { label: "Media Library", href: "/admin/media", icon: getIconComponent("folder-open"), module: "media_library" },
    ]
  },
  {
    title: "ANALYTICS",
    items: [
      { label: "Funnel", href: "/admin/funnel", icon: getIconComponent("trending-up"), module: "analytics" },
      { label: "Revenue", href: "/admin/revenue", icon: getIconComponent("dollar-sign"), module: "analytics" },
      { label: "Aktivitas", href: "/admin/aktivitas", icon: getIconComponent("activity"), module: "analytics" },
    ]
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Admin Users", href: "/admin/admins", icon: getIconComponent("shield-alert"), module: "system" },
      { label: "Roles & Permissions", href: "/admin/roles", icon: getIconComponent("key"), module: "system" },
      { label: "Activity Logs", href: "/admin/logs", icon: getIconComponent("clipboard-list"), module: "system" },
    ]
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auth & RBAC State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [permissions, setPermissions] = useState<Record<string, Permission>>({});
  const [navGroups, setNavGroups] = useState<NavGroup[]>(staticNavGroups);

  // Fetch Dynamic Sidebar Groups & Items from Supabase
  useEffect(() => {
    const fetchSidebarStructure = async () => {
      try {
        const supabase = createClient();

        // Fetch groups
        const { data: groupsData, error: groupsError } = await supabase
          .from("privilege_groups")
          .select("*")
          .eq("status", "active")
          .order("sort_order", { ascending: true });

        if (groupsError) throw groupsError;

        // Fetch items
        const { data: itemsData, error: itemsError } = await supabase
          .from("privilege_items")
          .select("*")
          .eq("status", "active")
          .order("sort_order", { ascending: true });

        if (itemsError) throw itemsError;

        if (groupsData && itemsData) {
          const groups: NavGroup[] = groupsData.map((g: any) => {
            const groupItems = itemsData
              .filter((item: any) => item.group_id === g.id)
              .map((item: any) => ({
                label: item.name,
                href: item.href,
                icon: getIconComponent(item.icon_name),
                module: item.slug
              }));

            return {
              title: g.name,
              items: groupItems
            };
          });

          setNavGroups(groups);
        }
      } catch (err) {
        console.warn("Failed to load dynamic sidebar, using static fallback:", err);
      }
    };

    fetchSidebarStructure();
  }, []);

  // Close sidebar on page change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Handle click outside to close user dropdown in header
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch User Role & Granular Permissions
  useEffect(() => {
    const fetchUserRoleAndPermissions = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoadingUser(false);
          return;
        }

        const { data: member } = await supabase
          .from("members")
          .select("full_name, role")
          .eq("id", user.id)
          .single();

        if (member) {
          setAdminName(member.full_name || "Admin");
          setIsAdmin(member.role === "admin");
        }

        // Fetch admin_roles to check status and get color/is_super_admin
        const { data: adminRole } = await supabase
          .from("admin_roles")
          .select("id, color, status, is_super_admin")
          .eq("member_id", user.id)
          .maybeSingle();

        const isSuper = checkIsSuperAdmin({
          email: user.email,
          memberRole: member?.role,
          adminRoleColor: adminRole?.color,
          adminRoleStatus: adminRole?.status,
          isSuperAdminFlag: adminRole?.is_super_admin,
        });

        setIsSuperAdmin(isSuper);

        if (adminRole && adminRole.status === "active") {
          setIsAdmin(true);

          // Fetch permissions (pages where admin has 'view' privilege)
          const { data: permData, error } = await supabase
            .from("admin_role_permissions")
            .select(`
              privilege_items!inner ( slug ),
              privilege_actions!inner ( slug )
            `)
            .eq("admin_role_id", adminRole.id)
            .eq("privilege_actions.slug", "view");

          if (!error && permData) {
            const permMap: Record<string, Permission> = {};
            permData.forEach((p: any) => {
              const slug = p.privilege_items?.slug;
              if (slug) {
                permMap[slug] = { can_view: true };
              }
            });
            setPermissions(permMap);
          }
        }
      } catch (err) {
        console.warn("Permission fetch error:", err);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserRoleAndPermissions();
  }, []);

  // Fetch pending members count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const supabase = createClient();
        const { count, error } = await supabase
          .from("members")
          .select("*", { count: "exact", head: true })
          .eq("payment_status", "pending")
          .neq("role", "admin");

        if (!error && count !== null) {
          setPendingCount(count);
        }
      } catch (err) {
        console.error("Error fetching pending count:", err);
      }
    };

    fetchPendingCount();

    const supabase = createClient();
    const channel = supabase
      .channel("pending_members_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "members" },
        () => {
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signout();
    } catch (error) {
      console.error("Gagal keluar:", error);
      setIsSigningOut(false);
    }
  };

  // Safe view check - defaults to showing navigation if role database isn't fully loaded/configured
  const canView = (module: string | undefined) => {
    if (!module) return true;
    if (isSuperAdmin) return true;

    // Fallback: If no permissions are set/fetched yet in the state, show everything
    if (Object.keys(permissions).length === 0) return true;

    if (isAdmin) return true;

    return permissions[module]?.can_view || false;
  };

  // Helper to dynamically adjust links for subdomain vs localhost
  const getCleanHref = (href: string) => {
    if (!mounted) return href;
    const hostname = window.location.hostname;
    const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(":") || hostname === "[::1]";
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || isIpAddress;

    if (isLocalhost) {
      return href;
    }

    // On production (admin subdomain), strip the "/admin" prefix
    return href.replace(/^\/admin/, "") || "/";
  };



  // Helper to build a clean breadcrumb title in header
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0 || (parts.length === 1 && parts[0] === "admin")) {
      return ["DASHBOARD"];
    }
    const filteredParts = parts[0] === "admin" ? parts.slice(1) : parts;
    return filteredParts.map(part => part.replace("-", " ").toUpperCase());
  };

  const breadcrumbs = getBreadcrumbs();

  const isNoSidebarPage = pathname.includes("/sidebar-layout") || pathname.includes("/settings");

  return (
    <div className="flex flex-col h-screen bg-bg-page overflow-hidden font-sans text-text-primary transition-colors duration-300">

      {/* Top Header Bar - Spans full width from left to right (z-30) */}
      <header className="h-18 border-b border-border-default flex items-center justify-between px-6 bg-bg-card shrink-0 z-30 transition-colors duration-300 relative">

        {/* Left Section: Logo & Breadcrumbs (Grouped together) */}
        <div className="flex items-center gap-6">
          {/* Hamburger Menu Button (Mobile only, hidden if page doesn't have sidebar) */}
          {!isNoSidebarPage && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1.5 rounded-md hover:bg-bg-well border border-border-default text-text-primary cursor-pointer shrink-0"
              aria-label="Toggle Navigation"
            >
              {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          )}

          <Link href={getCleanHref("/admin")} className="flex items-center gap-2 font-black text-sm tracking-widest text-text-primary hover:opacity-85 transition-opacity shrink-0">
            <img src="/logo-dark.png" alt="Logo" className="h-20 w-auto dark:block hidden" />
            <img src="/logo-light.png" alt="Logo" className="h-20 w-auto dark:hidden" />
          </Link>

          {/* Vertical divider */}
          <div className="hidden sm:block h-5 w-px bg-border-default shrink-0" />

          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-black tracking-widest text-text-secondary/50 select-none">
            <span>[ ADMIN ]</span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb}>
                <span>/</span>
                <span className={idx === breadcrumbs.length - 1 ? "text-text-primary" : ""}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right Section: Toggle Theme, Notifications, Profile */}
        <div className="flex items-center gap-4">

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center border border-border-default hover:bg-bg-well transition-colors cursor-pointer rounded-full text-text-primary shrink-0"
              title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
            >
              {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          )}

          {/* User Profile Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            {isLoadingUser ? (
              <div className="flex items-center gap-2 py-1 animate-pulse select-none">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                <div className="hidden sm:block h-3.5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="w-3.5 h-3.5 bg-zinc-250 dark:bg-zinc-750 rounded shrink-0" />
              </div>
            ) : (
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer py-1"
              >
                <div className="w-8 h-8 rounded-full bg-text-primary text-bg-card flex items-center justify-center font-bold text-xs uppercase select-none shrink-0">
                  {adminName.charAt(0)}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-text-primary truncate max-w-[120px]">
                  {adminName}
                </span>
                <ChevronDown size={14} className="text-text-secondary shrink-0" />
              </button>
            )}

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 top-11 bg-bg-card border border-border-default rounded-xl p-2.5 shadow-lg z-50 flex flex-col gap-1 min-w-[180px]">
                <div className="px-2.5 py-1.5 border-b border-border-default/60 pb-2 mb-1">
                  <p className="text-xs font-bold text-text-primary truncate">{adminName}</p>
                  <p className="text-[9px] text-text-secondary uppercase tracking-wider font-semibold mt-0.5">
                    {isSuperAdmin ? "SUPER ADMIN" : "OPERATOR"}
                  </p>
                </div>
                <Link
                  href={getCleanHref("/admin/sidebar-layout")}
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-text-primary hover:bg-bg-page rounded-md transition-all duration-150 cursor-pointer"
                >
                  <PanelLeft size={13} />
                  <span>Sidebar Layout</span>
                </Link>
                {/* settings */}
                <Link
                  href={getCleanHref("/admin/settings")}
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-text-primary hover:bg-bg-page rounded-md transition-all duration-150 cursor-pointer"
                >
                  <Settings size={13} />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-md transition-all duration-150 cursor-pointer disabled:opacity-50"
                >
                  {isSigningOut ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
                  <span>{isSigningOut ? "logout..." : "Keluar"}</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Body Area - Under Header (Contains Sidebar on left, Content on right) */}
      <div className="flex flex-1 overflow-hidden w-full relative z-20">
        {/* Mobile Sidebar Backdrop */}
        {!isNoSidebarPage && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation - Starts below header, w-56, scrollable */}
        {!isNoSidebarPage && (
          <aside
            data-lenis-prevent
            className={`w-56 flex-shrink-0 flex flex-col bg-bg-sidebar border-r border-border-default overflow-y-auto no-scrollbar transition-all duration-300 z-40
              ${isSidebarOpen
                ? "translate-x-0 fixed left-0 top-18 bottom-0 bg-bg-sidebar shadow-2xl"
                : "-translate-x-full fixed left-0 top-18 bottom-0 lg:translate-x-0 lg:static lg:h-full"
              }`}
          >
            {isLoadingUser ? (
              <nav className="py-5 space-y-6 px-4 animate-pulse select-none">
                {/* Dashboard skeleton */}
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-4.5 h-4.5 bg-zinc-200 dark:bg-zinc-800 rounded shrink-0" />
                  <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>

                {/* Group 1 */}
                <div className="space-y-3 pt-2">
                  <div className="h-2 w-16 bg-zinc-200 dark:bg-zinc-800 rounded px-1" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3 px-2 py-1">
                        <div className="w-4 h-4 bg-zinc-200 dark:bg-zinc-800 rounded shrink-0" />
                        <div className="h-2.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group 2 */}
                <div className="space-y-3 pt-2">
                  <div className="h-2 w-12 bg-zinc-200 dark:bg-zinc-800 rounded px-1" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 px-2 py-1">
                        <div className="w-4 h-4 bg-zinc-200 dark:bg-zinc-800 rounded shrink-0" />
                        <div className="h-2.5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </nav>
            ) : (
              <nav className="py-5 space-y-5">
                {/* Dashboard (Always at top, no module constraint) */}
                <div className="px-2">
                  <Link
                    href={getCleanHref("/admin")}
                    className={`flex items-center gap-3 rounded-md px-2 py-2 text-xs font-semibold tracking-wider transition-all duration-150 ${
                      pathname === getCleanHref("/admin") || pathname === getCleanHref("/admin/")
                        ? "text-text-primary border-l-[3px] border-text-primary pl-[13px] rounded-l-none font-bold"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-page"
                    }`}
                  >
                    <LayoutDashboard size={14} />
                    <span className={pathname === getCleanHref("/admin") || pathname === getCleanHref("/admin/") ? "highlight-stabilo highlight-stabilo-nav font-bold" : ""}>
                      Dashboard
                    </span>
                  </Link>
                </div>

                {/* Grouped Menus */}
                {navGroups.map((group) => {
                  const visibleItems = group.items.filter((item) => canView(item.module));
                  if (visibleItems.length === 0) return null;

                  return (
                    <div key={group.title} className="space-y-1">
                      <div className="px-4 text-[9px] uppercase tracking-[0.2em] font-bold text-text-muted">
                        {group.title}
                      </div>
                      <div className="space-y-0.5">
                        {visibleItems.map((item) => {
                          const cleanHref = getCleanHref(item.href);
                          const isActive =
                            pathname === cleanHref ||
                            (cleanHref !== "/" && pathname.startsWith(cleanHref + "/"));
                          return (
                            <Link
                              key={item.href}
                              href={cleanHref}
                              className={`flex items-center gap-2.5 px-4 py-3 text-xs font-semibold tracking-wider transition-all duration-150 ${
                                isActive
                                  ? "text-text-primary border-l-[3px] border-text-primary pl-[13px] rounded-l-none font-bold"
                                  : "text-text-secondary hover:text-text-primary hover:bg-bg-page"
                              }`}
                            >
                              {item.icon}
                              <span className={`truncate ${isActive ? "highlight-stabilo highlight-stabilo-nav font-bold" : ""}`}>
                                {item.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>
            )}
          </aside>
        )}

        {/* Scrollable Content Container */}
        <main
          data-lenis-prevent
          className="flex-1 overflow-y-auto bg-card transition-colors duration-300"
        >
          <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}
