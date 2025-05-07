import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// NOTE: sessionStorage is not available in middleware (server-side). For real authentication, use cookies or headers.
// This is a placeholder to show where you would check for admin session.

export function middleware() {
  // Example: Check for a cookie named 'user' (should be set on login for real auth)
  // const userCookie = request.cookies.get('user');
  // if (!userCookie) return NextResponse.redirect(new URL('/login', request.url));
  // const user = JSON.parse(userCookie.value);
  // if (user.user?.role !== 'Admin') return NextResponse.redirect(new URL('/login', request.url));

  // Placeholder: Always allow (since sessionStorage is not accessible)
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
}; 