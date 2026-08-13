import { ITransaccionPagoRepository, FiltrosListarPagos } from '../../../../domain/ports/outgoing/ITransaccionPagoRepository';
import { TransaccionPago } from '../../../../domain/entities/TransaccionPago';
import { TransaccionPagoMapper } from '../../../../application/mappers/TransaccionPagoMapper';
import { prisma } from '../client';

export class PrismaTransaccionPagoRepository implements ITransaccionPagoRepository {
  public async crearTransaccion(transaccion: TransaccionPago): Promise<TransaccionPago> {
    const data = TransaccionPagoMapper.toPersistence(transaccion);
    const created = await prisma.transaccionPago.create({
      data: {
        ...data,
        detalles: {
          create: transaccion.detalles.map((d) => ({
            tipoConcepto: d.tipoConcepto as any,
            referenciaConcepto: d.referenciaConcepto,
            descripcion: d.descripcion,
            codigoContable: d.codigoContable || '2.1.2.02.02',
            valorBase: d.valorBase,
            descuento: d.descuento || 0,
            interesesMora: d.interesesMora || 0,
            valorFinal: d.valorFinal,
          })),
        },
      },
      include: { detalles: true },
    });

    return TransaccionPagoMapper.toDomain(created);
  }

  public async obtenerPorId(id: string): Promise<TransaccionPago | null> {
    const record = await prisma.transaccionPago.findUnique({
      where: { id },
      include: { detalles: true },
    });
    if (!record) return null;
    return TransaccionPagoMapper.toDomain(record);
  }

  public async obtenerPorReferencia(referenciaPago: string): Promise<TransaccionPago | null> {
    const record = await prisma.transaccionPago.findUnique({
      where: { referenciaPago },
      include: { detalles: true },
    });
    if (!record) return null;
    return TransaccionPagoMapper.toDomain(record);
  }

  public async actualizarEstado(transaccion: TransaccionPago): Promise<TransaccionPago> {
    const data = TransaccionPagoMapper.toPersistence(transaccion);
    const updated = await prisma.transaccionPago.update({
      where: { referenciaPago: transaccion.referenciaPago },
      data: {
        estadoPago: data.estadoPago,
        cus: data.cus,
        codigoTrazabilidad: data.codigoTrazabilidad,
        fechaAprobacion: data.fechaAprobacion,
        sincronizadoHassql: data.sincronizadoHassql,
        fechaSincronizacion: data.fechaSincronizacion,
        referenciaAsientoHassql: data.referenciaAsientoHassql,
        intentosSync: data.intentosSync,
        logErrorSync: data.logErrorSync,
        reciboOficialNumero: data.reciboOficialNumero,
      },
      include: { detalles: true },
    });

    return TransaccionPagoMapper.toDomain(updated);
  }

  public async listarTransacciones(filtros: FiltrosListarPagos): Promise<{ data: TransaccionPago[]; total: number }> {
    const pagina = filtros.pagina || 1;
    const limite = filtros.limite || 20;
    const skip = (pagina - 1) * limite;

    const where: any = {};
    if (filtros.ciudadanoId) where.ciudadanoId = filtros.ciudadanoId;
    if (filtros.canalPago) where.canalPago = filtros.canalPago;
    if (filtros.estadoPago) where.estadoPago = filtros.estadoPago;
    if (filtros.sincronizadoHassql !== undefined) where.sincronizadoHassql = filtros.sincronizadoHassql;

    const [total, records] = await Promise.all([
      prisma.transaccionPago.count({ where }),
      prisma.transaccionPago.findMany({
        where,
        skip,
        take: limite,
        orderBy: { fechaTransaccion: 'desc' },
        include: { detalles: true },
      }),
    ]);

    return {
      data: records.map((r) => TransaccionPagoMapper.toDomain(r)),
      total,
    };
  }

  public async obtenerPendientesSincronizacionHassql(limite = 50): Promise<TransaccionPago[]> {
    const records = await prisma.transaccionPago.findMany({
      where: {
        estadoPago: 'APROBADO',
        sincronizadoHassql: false,
        intentosSync: { lt: 5 },
      },
      take: limite,
      orderBy: { fechaAprobacion: 'asc' },
      include: { detalles: true },
    });

    return records.map((r) => TransaccionPagoMapper.toDomain(r));
  }
}
