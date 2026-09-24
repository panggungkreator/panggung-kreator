import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host');

  // Cek apakah hostname adalah akademi.panggungkreator.web.id
  // Kita menggunakan includes untuk menangani port lokal jika ada saat testing
  if (hostname === 'akademi.panggungkreator.web.id') {
    // Redirect ke panggungkreator.web.id/registration
    return NextResponse.redirect('https://panggungkreator.web.id/registration');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
