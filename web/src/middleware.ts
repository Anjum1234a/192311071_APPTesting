import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Explicitly passing credentials to the middleware client to avoid env issues in some environments
  const supabase = createMiddlewareClient({ req, res }, {
    supabaseUrl: 'https://hvdqjdjaplfngpihvmvk.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2ZHFqZGphcGxmbmdwaWh2bXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0Mjg1OTYsImV4cCI6MjA5NzAwNDU5Nn0.nCJw4FKpJv4D7CHhdGibWnnWyKryKA6HwMl6US1r8hc'
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
  const isDashboardPage = req.nextUrl.pathname === '/' ||
                          req.nextUrl.pathname.startsWith('/dashboard') ||
                          req.nextUrl.pathname.startsWith('/patients') ||
                          req.nextUrl.pathname.startsWith('/prescriptions');

  if (isDashboardPage && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/', '/auth/:path*', '/dashboard/:path*', '/patients/:path*', '/prescriptions/:path*'],
};
