import { ICitaRepository, FiltrosListarCitas } from '../../../../domain/ports/outgoing/ICitaRepository';
import { Cita } from '../../../../domain/entities/Cita';
import { CitaMapper } from '../../../../application/mappers/CitaMapper';
import { prisma } from '../client';

export class PrismaCitaRepository implements ICitaRepository {
  public async save(cita: Cita): Promise<Cita> {
    const data = CitaMapper.toPersistence(cita);
    const created = await prisma.cita.create({ data });
    return CitaMapper.toDomain(created);
  }

  public async findByCodigo(codigoCita: string): Promise<Cita | null> {
    const record = await prisma.cita.findUnique({ where: { codigoCita } });
    if (!record) return null;
    return CitaMapper.toDomain(record);
  }

  public async findCitaActivaPorCiudadanoYTipo(
    ciudadanoId: string,
    tipoTramiteId: string
  ): Promise<Cita | null> {
    const record = await prisma.cita.findFirst({
      where: {
        ciudadanoId,
        tipoTramiteId,
        estado: { in: ['RESERVADA', 'CONFIRMADA'] },
      },
    });
    if (!record) return null;
    return CitaMapper.toDomain(record);
  }

  public async findAll(filtros: FiltrosListarCitas): Promise<Cita[]> {
    const where: any = {};
    if (filtros.ciudadanoId) where.ciudadanoId = filtros.ciudadanoId;
    if (filtros.puestoAtencionId) where.puestoAtencionId = filtros.puestoAtencionId;
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.fecha) where.fechaCita = filtros.fecha;

    const records = await prisma.cita.findMany({
      where,
      orderBy: { horaInicio: 'asc' },
    });

    return records.map(r => CitaMapper.toDomain(r));
  }

  public async update(cita: Cita): Promise<Cita> {
    const data = CitaMapper.toPersistence(cita);
    const updated = await prisma.cita.update({
      where: { id: cita.id },
      data,
    });
    return CitaMapper.toDomain(updated);
  }
}
