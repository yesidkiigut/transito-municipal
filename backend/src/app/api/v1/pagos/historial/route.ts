import { NextRequest, NextResponse } from 'next/server';
import { PrismaTransaccionPagoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaTransaccionPagoRepository';

const repo = new PrismaTransaccionPagoRepository();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ciudadanoId = searchParams.get('ciudadanoId') || undefined;
    const canalPago = searchParams.get('canalPago') || undefined;
    const estadoPago = searchParams.get('estadoPago') || undefined;
    const sincronizadoHassql = searchParams.get('sincronizadoHassql') ? searchParams.get('sincronizadoHassql') === 'true' : undefined;

    const resultado = await repo.listarTransacciones({
      ciudadanoId,
      canalPago,
      estadoPago,
      sincronizadoHassql,
    });

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener historial de pagos' },
      { status: 500 }
    );
  }
}
