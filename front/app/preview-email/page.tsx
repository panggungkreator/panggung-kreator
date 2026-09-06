import React from "react";
import { getMemberCredentialsEmailHtml } from "@/lib/email-templates/member-credentials";

export const dynamic = "force-dynamic";

export default function PreviewEmailPage() {
  const htmlContent = getMemberCredentialsEmailHtml({
    memberName: "Bento Kawan",
    email: "bentokawan@gmail.com",
    username: "bentokawan973",
    password: "PK-9754!",
    appUrl: "http://localhost:3000",
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center py-6 px-4">
      <div className="max-w-2xl w-full mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h1 className="text-base font-bold text-zinc-200">Email Preview: Kredensial Member</h1>
          <p className="text-xs text-zinc-400">Pratinjau tampilan email responsif mobile & dark theme</p>
        </div>
        <span className="px-2.5 py-1 text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
          Dev Preview Only
        </span>
      </div>

      {/* Frame wrapper untuk preview mobile & desktop */}
      <div className="w-full max-w-[420px] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900">
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
          <span className="text-[11px] text-zinc-400 ml-2 font-mono">Mobile View (Inbox Client)</span>
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          className="w-full overflow-x-auto"
        />
      </div>
    </div>
  );
}
