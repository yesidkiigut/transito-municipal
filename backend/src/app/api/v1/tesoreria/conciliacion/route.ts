import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/persistence/prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const busqueda = searchParams.get('busqueda') || '';
    const canal = searchParams.get('canal') || '';
    const estado = searchParams.get('estado') || '';
    const syncHassql = searchParams.get('syncHassql');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    const tipoConcepto = searchParams.get('tipoConcepto');

    const where: any = {};

    if (canal && canal !== 'TODOS') {
      where.canalPago = canal;
    }

    if (estado && estado !== 'TODOS') {
      where.estadoPago = estado;
    }

    if (syncHassql !== null && syncHassql !== undefined && syncHassql !== 'TODOS') {
      where.sincronizadoHassql = syncHassql === 'true';
    }

    if (fechaDesde || fechaHasta) {
      where.fechaTransaccion = {};
      if (fechaDesde) {
        where.fechaTransaccion.gte = new Date(`${fechaDesde}T00:00:00.000Z`);
      }
      if (fechaHasta) {
        where.fechaTransaccion.lte = new Date(`${fechaHasta}T23:59:59.999Z`);
      }
    }

    if (busqueda) {
      where.OR = [
        { referenciaPago: { contains: busqueda, mode: 'insensitive' } },
        { cus: { contains: busqueda, mode: 'insensitive' } },
        { codigoTrazabilidad: { contains: busqueda, mode: 'insensitive' } },
        { reciboOficialNumero: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    if (tipoConcepto && tipoConcepto !== 'TODOS') {
      where.detalles = {
        some: { tipoConcepto: tipoConcepto as any },
      };
    }

    const [total, transacciones, agregados, agregadosAprobados] = await Promise.all([
      prisma.transaccionPago.count({ where }),
      prisma.transaccionPago.findMany({
        where,
        orderBy: { fechaTransaccion: 'desc' },
        include: { detalles: true },
        take: 100,
      }),
      prisma.transaccionPago.aggregate({
        where,
        _sum: { montoTotal: true },
        _count: { id: true },
      }),
      prisma.transaccionPago.aggregate({
        where: { ...where, estadoPago: 'APROBADO' },
        _sum: { montoTotal: true },
      }),
    ]);

    // Calcular desglose de recaudos
    const totalPSE = transacciones
      .filter((t) => t.canalPago === 'PSE' && t.estadoPago === 'APROBADO')
      .reduce((sum, t) => sum + t.montoTotal, 0);

    const totalBreB = transacciones
      .filter((t) => t.canalPago === 'BRE_B' && t.estadoPago === 'APROBADO')
      .reduce((sum, t) => sum + t.montoTotal, 0);

    const totalSincronizadas = transacciones.filter((t) => t.sincronizadoHassql).length;

    return NextResponse.json({
      transacciones,
      metricas: {
        totalRegistros: total,
        montoTotalFiltrado: agregados._sum.montoTotal || 0,
        montoAprobadoRecaudado: agregadosAprobados._sum.montoTotal || 0,
        totalPSE,
        totalBreB,
        totalSincronizadasHassql: totalSincronizadas,
        tasaSincronizacion: total > 0 ? Math.round((totalSincronizadas / total) * 100) : 100,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al consultar conciliación de tesorería' },
      { status: 500 }
    );
  }
}
