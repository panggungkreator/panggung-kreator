import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing item id" }, { status: 400 });

    const supabase = createServiceRoleClient();

    // Increment view count
    const { data: item, error: fetchErr } = await supabase
      .from("portfolio_items")
      .select("view_count")
      .eq("id", id)
      .single();

    if (fetchErr || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const newCount = (item.view_count || 0) + 1;

    const { error: updateErr } = await supabase
      .from("portfolio_items")
      .update({ view_count: newCount })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, view_count: newCount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
