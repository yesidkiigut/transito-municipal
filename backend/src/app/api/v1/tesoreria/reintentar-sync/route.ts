import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/persistence/prisma/client';
import { SincronizarLoteDiarioHassqlUseCase } from '@/application/use-cases/hassql/SincronizarLoteDiarioHassqlUseCase';

const syncUseCase = new SincronizarLoteDiarioHassqlUseCase();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transaccionIds } = body;

    if (transaccionIds && Array.isArray(transaccionIds) && transaccionIds.length > 0) {
      // Marcar para re-intento forzado
      await prisma.transaccionPago.updateMany({
        where: { id: { in: transaccionIds } },
        data: { sincronizadoHassql: false, intentosSync: 0 },
      });
    }

    const resultado = await syncUseCase.execute();
    return NextResponse.json({
      mensaje: 'Reintento de sincronización procesado exitosamente',
      resultado,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al reintentar sincronización' },
      { status: 500 }
    );
  }
}
