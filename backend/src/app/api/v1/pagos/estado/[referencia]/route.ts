import { NextRequest, NextResponse } from 'next/server';
import { PrismaTransaccionPagoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaTransaccionPagoRepository';

const repo = new PrismaTransaccionPagoRepository();

export async function GET(req: NextRequest, { params }: { params: { referencia: string } }) {
  try {
    const { referencia } = params;
    const transaccion = await repo.obtenerPorReferencia(referencia);

    if (!transaccion) {
      return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 });
    }

    return NextResponse.json(transaccion);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al consultar estado de pago' },
      { status: 500 }
    );
  }
}
