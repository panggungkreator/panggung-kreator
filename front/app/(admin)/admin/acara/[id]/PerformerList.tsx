"use client";

import { useCallback, useEffect, useState } from "react";
import { ListOrdered } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import { setPerformanceStatus } from "@/lib/actions/performance-actions";

type Attendance = { id: string; member_id: string; member_name: string; is_present: boolean };
type Member = { id: string; stage_name?: string };

export function PerformerList({ eventId, attendances, members, canEdit }: {
  eventId: string; attendances: Attendance[]; members: Member[]; canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const { data, error: queryError } = await createClient().from("attendances")
      .select("id, has_performed").eq("event_id", eventId).eq("is_present", true);
    if (queryError) {
      setError("Daftar performer gagal dimuat. Coba tutup dan buka kembali.");
      return;
    }
    setStatuses(Object.fromEntries((data || []).map((row: { id: string; has_performed: boolean }) => [row.id, row.has_performed])));
    setError("");
  }, [eventId]);

  useEffect(() => {
    if (!open || saving) return;
    const timer = setInterval(() => void refresh(), 5000);
    return () => clearInterval(timer);
  }, [open, saving, refresh]);

  const toggle = async (id: string, checked: boolean) => {
    setSaving(id);
    setError("");
    try {
      const result = await setPerformanceStatus(eventId, id, checked);
      if (result.error) setError(result.error);
      await refresh();
      if (result.error) setError(result.error);
    } catch {
      setError("Gagal menyimpan status tampil. Coba lagi.");
    } finally {
      setSaving(null);
    }
  };

  const present = attendances.filter((attendance) => attendance.is_present);
  return <>
    <button type="button" onClick={() => { setOpen(true); setLoading(true); void refresh().finally(() => setLoading(false)); }} className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-card px-4 py-2 text-xs font-semibold text-text-primary hover:bg-bg-well">
      <ListOrdered className="h-4 w-4" /> Daftar Performer
    </button>
    <Modal isOpen={open} onClose={() => setOpen(false)} title="Daftar Performer" subtitle="Member yang sudah hadir pada acara ini.">
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {loading ? <p className="text-sm text-text-secondary">Memuat daftar...</p> : present.length === 0 ? (
        <p className="text-sm text-text-secondary">Belum ada member yang hadir.</p>
      ) : <ul className="divide-y divide-border-default">
        {present.map((attendance) => {
          const stageName = members.find((member) => member.id === attendance.member_id)?.stage_name;
          return <li key={attendance.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0"><p className="font-semibold text-sm text-text-primary">{stageName || attendance.member_name}</p>
              {stageName && stageName !== attendance.member_name && <p className="text-xs text-text-secondary">{attendance.member_name}</p>}</div>
            <label className="flex shrink-0 items-center gap-2 text-sm text-text-primary">
              <input type="checkbox" checked={statuses[attendance.id] ?? false} disabled={!canEdit || !!saving || !!error || !(attendance.id in statuses)} onChange={(e) => void toggle(attendance.id, e.target.checked)} className="h-4 w-4 accent-emerald-600" />
              Sudah tampil
            </label>
          </li>;
        })}
      </ul>}
    </Modal>
  </>;
}
