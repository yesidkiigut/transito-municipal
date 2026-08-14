import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtener el origen de la solicitud o permitir todos
  const origin = request.headers.get('origin') || '*';

  // Configurar headers CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Api-Version, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };

  // Si es una petición PREFLIGHT (OPTIONS), responder inmediatamente con 200 y los headers CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Para las demás peticiones, continuar y agregar headers CORS a la respuesta
  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
