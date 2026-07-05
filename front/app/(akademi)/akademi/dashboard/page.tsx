import React from 'react';
import Link from 'next/link';
import { signout } from '@/lib/actions/auth-actions';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';


export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError || !session?.user) {
    redirect("/login");
  }

  // Fetch member data
  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!member) {
    redirect("/onboarding");
  }

  // Fallback to UI avatar if Google photo is not available
  const avatarUrl = session.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.stage_name || member.full_name)}&background=df7a42&color=fff`;

  // Split name for stacked layout
  const nameParts = (member.stage_name || member.full_name).toUpperCase().split(" ");
  const firstName = nameParts[0];
  const restName = nameParts.slice(1).join(" ");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="font-title text-xl font-bold text-gray-800 tracking-wider">
            PANGGUNG KREATOR
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="#"
            className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg"
          >
            Profil Kreator
          </Link>
          <Link
            href="#"
            className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
          >
            Karya Saya
          </Link>
          <Link
            href="#"
            className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
          >
            Analitik
          </Link>
          <Link
            href="#"
            className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
          >
            Pengaturan
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <form action={async () => { "use server"; await signout(); }}>
            <button
              type="submit"
              className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left cursor-pointer"
            >
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-[#F7F4EF]">
        {/* Header (Mobile only) */}
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div>
            <span className="font-title text-lg font-bold text-gray-800 tracking-wider">
              PANGGUNG KREATOR
            </span>
          </div>
          <div className="flex items-center gap-4">
            <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
          </div>
        </header>

        {/* Dashboard Content - Elegant Profile Design */}
        <main className="flex-1 flex items-center justify-center p-6 md:p-12 w-full">
          <div className="relative w-full max-w-2xl bg-[#F7F4EF] p-8 md:p-16">
            
            {/* Corner Decorative Brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#E18D58]"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#E18D58]"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#E18D58]"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#E18D58]"></div>

            <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-8 mb-10">
              {/* Name Section */}
              <div className="flex-1">
                <p className="text-[#E18D58] text-xs md:text-sm font-semibold tracking-widest uppercase mb-4">
                  NAMA KREATOR:
                </p>
                <h1 className="text-5xl md:text-7xl font-bold text-[#E18D58] leading-[0.9] tracking-tight">
                  <span className="block">{firstName}</span>
                  {restName && <span className="block mt-2">{restName}</span>}
                </h1>
              </div>

              {/* Photo Section */}
              <div className="shrink-0 w-32 h-32 md:w-48 md:h-48 relative">
                <img 
                  src={avatarUrl} 
                  alt={member.stage_name}
                  className="w-full h-full object-cover rounded-[32px] md:rounded-[40px] shadow-lg border-4 border-white/40"
                />
              </div>
            </div>

            {/* Description Section */}
            <div className="mt-8 md:mt-12">
              <p className="text-[#D37F4B] text-lg md:text-xl leading-relaxed md:leading-loose text-justify font-medium">
                {member.description || "Deskripsi sedang disiapkan. Silakan refresh halaman ini atau perbarui profil Anda."}
              </p>
            </div>

            {/* Contact Info */}
            <div className="mt-12 flex flex-col sm:flex-row gap-6 border-t border-[#E18D58]/30 pt-8">
              {member.whatsapp_number && (
                <div className="flex items-center gap-3 text-[#D37F4B]">
                  <div className="p-2 bg-[#E18D58]/10 rounded-full">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <span className="font-semibold">{member.whatsapp_number}</span>
                </div>
              )}
              {member.instagram_username && (
                <div className="flex items-center gap-3 text-[#D37F4B]">
                  <div className="p-2 bg-[#E18D58]/10 rounded-full">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </div>
                  <span className="font-semibold">@{member.instagram_username.replace("@", "")}</span>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
