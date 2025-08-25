import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Build Content Security Policy
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const cspSelf = process.env.NEXT_PUBLIC_CSP_SELF || "'self'";
  
  // Only apply strict CSP in production
  if (process.env.NODE_ENV === 'production') {
    const csp = [
      `default-src ${cspSelf}`,
      `script-src ${cspSelf} 'unsafe-eval'`, // Next.js requires unsafe-eval
      `style-src ${cspSelf} 'unsafe-inline'`, // Tailwind requires unsafe-inline
      `img-src ${cspSelf} data: https:`,
      `connect-src ${cspSelf} ${apiUrl}`,
      `media-src ${cspSelf} https:`,
      `font-src ${cspSelf} data:`,
      `object-src 'none'`,
      `base-uri ${cspSelf}`,
      `form-action ${cspSelf}`,
      `frame-ancestors 'none'`,
      `upgrade-insecure-requests`
    ].join('; ');
    
    response.headers.set('Content-Security-Policy', csp);
  }
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Remove server header
  response.headers.delete('Server');
  
  return response;
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