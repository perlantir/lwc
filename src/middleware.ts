import { NextResponse, type NextRequest } from 'next/server';

const setSecurityHeaders = (res: NextResponse): NextResponse => {
  // HSTS only in production
  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  res.headers.set('X-Content-Type-Options', 'nosniff');
  // SAMEORIGIN allows the Payload admin Live Preview iframe (same-origin) to embed pages.
  // Cross-origin clickjacking is still blocked by `frame-ancestors 'self'` in the CSP.
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()',
  );

  // Content Security Policy — strict default-src 'self' + explicit allowlists.
  // Next.js needs inline runtime; we accept 'unsafe-inline' for styles only (Tailwind) and rely on next/script for any inline JS.
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://api.resend.com",
    "frame-src https://www.youtube-nocookie.com https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    'upgrade-insecure-requests',
  ].join('; ');
  res.headers.set('Content-Security-Policy', csp);
  return res;
};

export const middleware = (_req: NextRequest): NextResponse => {
  const res = NextResponse.next();
  return setSecurityHeaders(res);
};

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|images/|logos/|uploads/).*)',
};
