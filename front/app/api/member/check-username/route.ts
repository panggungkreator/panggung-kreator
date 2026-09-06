import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawUsername = searchParams.get("username") || "";
    const clean = rawUsername.trim().toLowerCase();

    if (!clean) {
      return NextResponse.json(
        { available: false, message: "Username tidak boleh kosong." },
        { status: 400 }
      );
    }

    if (clean.length < 3) {
      return NextResponse.json({
        available: false,
        message: "Username minimal 3 karakter.",
      });
    }

    if (clean.length > 30) {
      return NextResponse.json({
        available: false,
        message: "Username maksimal 30 karakter.",
      });
    }

    if (!/^[a-z0-9_.]+$/.test(clean)) {
      return NextResponse.json({
        available: false,
        message: "Hanya huruf kecil, angka, titik (.), atau garis bawah (_).",
      });
    }

    // Periksa keunikan username di tabel members menggunakan service-role client
    const adminClient = createServiceRoleClient();
    const { data: existingUser } = await adminClient
      .from("members")
      .select("id")
      .ilike("username", clean)
      .neq("id", user.id)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({
        available: false,
        message: `Username @${clean} sudah digunakan oleh pengguna lain.`,
      });
    }

    return NextResponse.json({
      available: true,
      message: `Username @${clean} tersedia.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}