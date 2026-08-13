import { ITramiteRepository, FiltrosListarTramites } from '../../../../domain/ports/outgoing/ITramiteRepository';
import { ResultadoPaginado } from '../../../../domain/ports/outgoing/ICiudadanoRepository';
import { Tramite } from '../../../../domain/entities/Tramite';
import { TramiteMapper } from '../../../../application/mappers/TramiteMapper';
import { prisma } from '../client';

export class PrismaTramiteRepository implements ITramiteRepository {
  public async save(tramite: Tramite): Promise<Tramite> {
    const data = TramiteMapper.toPersistence(tramite);
    const created = await prisma.tramite.create({
      data: {
        ...data,
        historial: {
          create: tramite.historial.map(h => ({
            paso: h.paso,
            estadoAnterior: h.estadoAnterior,
            estadoNuevo: h.estadoNuevo,
            funcionarioId: h.funcionarioId,
            observacion: h.observacion,
            fecha: h.fecha,
          })),
        },
      },
      include: { historial: true },
    });
    return TramiteMapper.toDomain(created);
  }

  public async findByCodigo(codigoTramite: string): Promise<Tramite | null> {
    const record = await prisma.tramite.findUnique({
      where: { codigoTramite },
      include: { historial: { orderBy: { fecha: 'asc' } } },
    });
    if (!record) return null;
    return TramiteMapper.toDomain(record);
  }

  public async findById(id: string): Promise<Tramite | null> {
    const record = await prisma.tramite.findUnique({
      where: { id },
      include: { historial: { orderBy: { fecha: 'asc' } } },
    });
    if (!record) return null;
    return TramiteMapper.toDomain(record);
  }

  public async update(tramite: Tramite): Promise<Tramite> {
    const data = TramiteMapper.toPersistence(tramite);

    // Save latest history record if any new record exists
    const ultimoHistorial = tramite.historial[tramite.historial.length - 1];

    if (ultimoHistorial) {
      await prisma.historialTramite.create({
        data: {
          tramiteId: tramite.id,
          paso: ultimoHistorial.paso,
          estadoAnterior: ultimoHistorial.estadoAnterior,
          estadoNuevo: ultimoHistorial.estadoNuevo,
          funcionarioId: ultimoHistorial.funcionarioId,
          observacion: ultimoHistorial.observacion,
          fecha: ultimoHistorial.fecha,
        },
      });
    }

    const updated = await prisma.tramite.update({
      where: { id: tramite.id },
      data,
      include: { historial: { orderBy: { fecha: 'asc' } } },
    });

    return TramiteMapper.toDomain(updated);
  }

  public async findAll(filtros: FiltrosListarTramites): Promise<ResultadoPaginado<Tramite>> {
    const pagina = filtros.pagina || 1;
    const limite = filtros.limite || 10;
    const skip = (pagina - 1) * limite;

    const where: any = {};
    if (filtros.tipoTramiteId) where.tipoTramiteId = filtros.tipoTramiteId;
    if (filtros.ciudadanoSolicitanteId) where.ciudadanoSolicitanteId = filtros.ciudadanoSolicitanteId;
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.funcionarioAsignadoId) where.funcionarioAsignadoId = filtros.funcionarioAsignadoId;

    const [total, records] = await Promise.all([
      prisma.tramite.count({ where }),
      prisma.tramite.findMany({
        where,
        skip,
        take: limite,
        include: { historial: { orderBy: { fecha: 'asc' } } },
        orderBy: { fechaRadicado: 'desc' },
      }),
    ]);

    return {
      data: records.map(r => TramiteMapper.toDomain(r)),
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }
}
