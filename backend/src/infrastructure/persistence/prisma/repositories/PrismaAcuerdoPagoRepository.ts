import { prisma } from '../client';
import { IAcuerdoPagoRepository } from '../../../../domain/ports/outgoing/IAcuerdoPagoRepository';

export class PrismaAcuerdoPagoRepository implements IAcuerdoPagoRepository {
  public async findById(id: string): Promise<any | null> {
    return prisma.acuerdoPago.findFirst({
      where: {
        OR: [{ id }, { codigoAcuerdo: id }],
      },
      include: {
        ciudadano: true,
        cuotas: {
          orderBy: { numeroCuota: 'asc' },
        },
        detallesDeuda: true,
      },
    });
  }

  public async findByCiudadanoId(ciudadanoId: string): Promise<any[]> {
    return prisma.acuerdoPago.findMany({
      where: { ciudadanoId },
      include: {
        cuotas: {
          orderBy: { numeroCuota: 'asc' },
        },
        detallesDeuda: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findByPlaca(placa: string): Promise<any[]> {
    return prisma.acuerdoPago.findMany({
      where: { placaVehiculo: placa.toUpperCase() },
      include: {
        cuotas: {
          orderBy: { numeroCuota: 'asc' },
        },
        detallesDeuda: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findAll(filtros?: { estado?: string; pagina?: number; limite?: number }): Promise<{
    data: any[];
    total: number;
    pagina: number;
    limite: number;
  }> {
    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 10;
    const skip = (pagina - 1) * limite;

    const where: any = {};
    if (filtros?.estado) {
      where.estado = filtros.estado;
    }

    const [total, data] = await Promise.all([
      prisma.acuerdoPago.count({ where }),
      prisma.acuerdoPago.findMany({
        where,
        skip,
        take: limite,
        include: {
          ciudadano: true,
          cuotas: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      total,
      pagina,
      limite,
    };
  }
}
