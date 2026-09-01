"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface ReferralCommissionSettings {
  mode: "flat" | "percentage";
  flatAmount: string;
  percentage: string;
}

export async function getAttendanceEmailSettingAction(): Promise<boolean> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "attendance_email_enabled")
      .maybeSingle();

    if (error) {
      console.warn("system_settings query error:", error.message);
    }

    if (data && data.value !== undefined && data.value !== null) {
      return data.value === "true" || data.value === true;
    }
  } catch (err) {
    console.warn("system_settings table query error, fallback to true:", err);
  }
  return true;
}

export async function saveAttendanceEmailSettingAction(enabled: boolean) {
  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from("system_settings")
      .upsert(
        {
          key: "attendance_email_enabled",
          value: enabled ? "true" : "false",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (error) {
      console.error("Supabase upsert error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, enabled };
  } catch (err: any) {
    console.error("saveAttendanceEmailSettingAction error:", err);
    return { success: false, error: err.message || "Gagal menyimpan ke database." };
  }
}

export async function getReferralCommissionSettingsAction(): Promise<ReferralCommissionSettings> {
  const defaultSettings: ReferralCommissionSettings = {
    mode: "flat",
    flatAmount: "10000",
    percentage: "10",
  };

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", [
        "referral_reward_mode",
        "referral_reward_flat_amount",
        "referral_reward_percentage",
      ]);

    if (error) {
      console.warn("getReferralCommissionSettingsAction query error:", error.message);
    }

    if (data && data.length > 0) {
      const map = Object.fromEntries(data.map((item) => [item.key, item.value]));
      return {
        mode: map["referral_reward_mode"] === "percentage" ? "percentage" : "flat",
        flatAmount: map["referral_reward_flat_amount"] || defaultSettings.flatAmount,
        percentage: map["referral_reward_percentage"] || defaultSettings.percentage,
      };
    }
  } catch (err) {
    console.warn("getReferralCommissionSettingsAction error, fallback to defaults:", err);
  }
  return defaultSettings;
}

export async function saveReferralCommissionSettingsAction(settings: ReferralCommissionSettings) {
  try {
    const supabase = createServiceRoleClient();
    const now = new Date().toISOString();
    const rows = [
      { key: "referral_reward_mode", value: settings.mode, updated_at: now },
      { key: "referral_reward_flat_amount", value: settings.flatAmount, updated_at: now },
      { key: "referral_reward_percentage", value: settings.percentage, updated_at: now },
    ];

    const { error } = await supabase
      .from("system_settings")
      .upsert(rows, { onConflict: "key" });

    if (error) {
      console.error("saveReferralCommissionSettingsAction upsert error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, settings };
  } catch (err: any) {
    console.error("saveReferralCommissionSettingsAction error:", err);
    return { success: false, error: err.message || "Gagal menyimpan ke database." };
  }
}

// ═══ TAB VISIBILITY SETTINGS ═══

export interface TabVisibilitySettings {
  tab_attendance_enabled: boolean;
  tab_portfolio_enabled: boolean;
  tab_affiliate_enabled: boolean;
}

export async function getTabVisibilitySettingsAction(): Promise<TabVisibilitySettings> {
  const defaultSettings: TabVisibilitySettings = {
    tab_attendance_enabled: true,
    tab_portfolio_enabled: true,
    tab_affiliate_enabled: true,
  };

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", [
        "tab_attendance_enabled",
        "tab_portfolio_enabled",
        "tab_affiliate_enabled",
      ]);

    if (error) {
      console.warn("getTabVisibilitySettingsAction query error:", error.message);
    }

    if (data && data.length > 0) {
      const map = Object.fromEntries(data.map((item) => [item.key, item.value]));
      return {
        tab_attendance_enabled: map["tab_attendance_enabled"] !== "false",
        tab_portfolio_enabled: map["tab_portfolio_enabled"] !== "false",
        tab_affiliate_enabled: map["tab_affiliate_enabled"] !== "false",
      };
    }
  } catch (err) {
    console.warn("getTabVisibilitySettingsAction error, fallback to defaults:", err);
  }

  return defaultSettings;
}

export async function saveTabVisibilitySettingsAction(settings: TabVisibilitySettings) {
  try {
    const supabase = createServiceRoleClient();
    const now = new Date().toISOString();
    const rows = [
      { key: "tab_attendance_enabled", value: settings.tab_attendance_enabled ? "true" : "false", updated_at: now },
      { key: "tab_portfolio_enabled", value: settings.tab_portfolio_enabled ? "true" : "false", updated_at: now },
      { key: "tab_affiliate_enabled", value: settings.tab_affiliate_enabled ? "true" : "false", updated_at: now },
    ];

    const { error } = await supabase
      .from("system_settings")
      .upsert(rows, { onConflict: "key" });

    if (error) {
      console.error("saveTabVisibilitySettingsAction upsert error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, settings };
  } catch (err: any) {
    console.error("saveTabVisibilitySettingsAction error:", err);
    return { success: false, error: err.message || "Gagal menyimpan ke database." };
  }
}

