import { NextResponse } from 'next/server';

// Minimal middleware to avoid Next.js 15 header issues
export function middleware() {
  // Allow all requests for now - authentication temporarily disabled
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
