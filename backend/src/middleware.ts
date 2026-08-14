import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Manejo del Preflight OPTIONS
  if (request.method === 'OPTIONS') {
    const preflightHeaders = new Headers();
    preflightHeaders.set('Access-Control-Allow-Origin', '*');
    preflightHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
    preflightHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    preflightHeaders.set('Access-Control-Max-Age', '86400');

    return new NextResponse(null, {
      status: 200,
      headers: preflightHeaders,
    });
  }

  // 2. Manejo de las demás peticiones
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
