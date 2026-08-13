import { IComparendoRepository, FiltrosListarComparendos } from '../../../../domain/ports/outgoing/IComparendoRepository';
import { ResultadoPaginado } from '../../../../domain/ports/outgoing/ICiudadanoRepository';
import { Comparendo } from '../../../../domain/entities/Comparendo';
import { ComparendoMapper } from '../../../../application/mappers/ComparendoMapper';
import { prisma } from '../client';

export class PrismaComparendoRepository implements IComparendoRepository {
  public async save(comparendo: Comparendo): Promise<Comparendo> {
    const data = ComparendoMapper.toPersistence(comparendo);
    const created = await prisma.comparendo.create({ data });
    return ComparendoMapper.toDomain(created);
  }

  public async findByNumero(numeroComparendo: string): Promise<Comparendo | null> {
    const record = await prisma.comparendo.findUnique({ where: { numeroComparendo } });
    if (!record) return null;
    return ComparendoMapper.toDomain(record);
  }

  public async findAll(filtros: FiltrosListarComparendos): Promise<ResultadoPaginado<Comparendo>> {
    const pagina = filtros.pagina || 1;
    const limite = filtros.limite || 10;
    const skip = (pagina - 1) * limite;

    const where: any = {};
    if (filtros.placaVehiculo) where.placaVehiculo = filtros.placaVehiculo;
    if (filtros.ciudadanoId) where.ciudadanoId = filtros.ciudadanoId;
    if (filtros.estado) where.estado = filtros.estado;

    const [total, records] = await Promise.all([
      prisma.comparendo.count({ where }),
      prisma.comparendo.findMany({
        where,
        skip,
        take: limite,
        orderBy: { fechaInfraccion: 'desc' },
      }),
    ]);

    return {
      data: records.map(r => ComparendoMapper.toDomain(r)),
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  public async update(comparendo: Comparendo): Promise<Comparendo> {
    const data = ComparendoMapper.toPersistence(comparendo);
    const updated = await prisma.comparendo.update({
      where: { id: comparendo.id },
      data,
    });
    return ComparendoMapper.toDomain(updated);
  }

  public async guardarResolucion(resolucion: {
    comparendoId: string;
    numeroResolucion: string;
    tipo: string;
    motivo: string;
    funcionarioId: string;
  }): Promise<any> {
    return await prisma.resolucion.create({
      data: {
        comparendoId: resolucion.comparendoId,
        numeroResolucion: resolucion.numeroResolucion,
        tipo: resolucion.tipo,
        motivo: resolucion.motivo,
        funcionarioId: resolucion.funcionarioId,
      },
    });
  }
}
