export const COLOR_RANGERS = {
  hitam: { hex: "#1a1a1a", label: "Rangers Hitam" },
  biru: { hex: "#2563eb", label: "Rangers Biru" },
  merah: { hex: "#b80028ff", label: "Rangers Merah" },
  hijau: { hex: "#059669", label: "Rangers Hijau" },
  pink: { hex: "#db2777", label: "Rangers Pink" },
  kuning: { hex: "#ca8a04", label: "Rangers Kuning" },
  putih: { hex: "#fdfdfd", label: "Rangers Putih" },
  slate: { hex: "#475569", label: "Rangers Slate" },
  jingga: { hex: "#ea580c", label: "Rangers Jingga" },
  abu: { hex: "#718392", label: "Rangers Abu" },
} as const;

export type ColorRangerSlug = keyof typeof COLOR_RANGERS;

export function colorRangerStyle(slug: ColorRangerSlug) {
  const hex = COLOR_RANGERS[slug]?.hex ?? "#475569";
  return {
    backgroundColor: hex + "18",
    color: hex,
    border: `1px solid ${hex}35`,
  };
}

export const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "panggungkreator.idn@gmail.com";
export const SUPER_ADMIN_COLOR = "slate";
