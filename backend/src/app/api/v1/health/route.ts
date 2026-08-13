import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'UP',
    service: 'Sistema de Tránsito Municipal API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
