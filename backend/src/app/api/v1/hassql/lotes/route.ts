import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/persistence/prisma/client';

export async function GET() {
  try {
    const lotes = await prisma.loteSincronizacionHassql.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const pendientesCount = await prisma.transaccionPago.count({
      where: { estadoPago: 'APROBADO', sincronizadoHassql: false },
    });

    const pendientesMonto = await prisma.transaccionPago.aggregate({
      where: { estadoPago: 'APROBADO', sincronizadoHassql: false },
      _sum: { montoTotal: true },
    });

    return NextResponse.json({
      lotes,
      estadisticas: {
        transaccionesPendientes: pendientesCount,
        montoPendiente: pendientesMonto._sum.montoTotal || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener lotes de sincronización' },
      { status: 500 }
    );
  }
}
