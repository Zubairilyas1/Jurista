import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // If no auth token in cookies/headers, redirect to login
  // Note: we are currently using localStorage, so middleware can't easily read it.
  // We'll skip strict middleware for now and use a client-side wrapper in MainLayout,
  // or we can just let AuthContext handle it.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|register|client).*)'],
};
