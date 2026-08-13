import { ICiudadanoRepository, FiltrosListarCiudadanos, ResultadoPaginado } from '../../../../domain/ports/outgoing/ICiudadanoRepository';
import { Ciudadano } from '../../../../domain/entities/Ciudadano';
import { CiudadanoMapper } from '../../../../application/mappers/CiudadanoMapper';
import { prisma } from '../client';

export class PrismaCiudadanoRepository implements ICiudadanoRepository {
  public async save(ciudadano: Ciudadano): Promise<Ciudadano> {
    const data = CiudadanoMapper.toPersistence(ciudadano);
    const created = await prisma.ciudadano.create({ data });
    return CiudadanoMapper.toDomain(created);
  }

  public async findById(id: string): Promise<Ciudadano | null> {
    const record = await prisma.ciudadano.findUnique({ where: { id } });
    if (!record) return null;
    return CiudadanoMapper.toDomain(record);
  }

  public async findByDocumento(numeroDocumento: string): Promise<Ciudadano | null> {
    const record = await prisma.ciudadano.findUnique({ where: { numeroDocumento } });
    if (!record) return null;
    return CiudadanoMapper.toDomain(record);
  }

  public async update(ciudadano: Ciudadano): Promise<Ciudadano> {
    const data = CiudadanoMapper.toPersistence(ciudadano);
    const updated = await prisma.ciudadano.update({
      where: { id: ciudadano.id },
      data,
    });
    return CiudadanoMapper.toDomain(updated);
  }

  public async findAll(filtros: FiltrosListarCiudadanos): Promise<ResultadoPaginado<Ciudadano>> {
    const pagina = filtros.pagina || 1;
    const limite = filtros.limite || 10;
    const skip = (pagina - 1) * limite;

    const where: any = {};
    if (filtros.tipoDocumento) {
      where.tipoDocumento = filtros.tipoDocumento;
    }
    if (filtros.estado) {
      where.estado = filtros.estado;
    }
    if (filtros.busqueda) {
      where.OR = [
        { numeroDocumento: { contains: filtros.busqueda, mode: 'insensitive' } },
        { nombres: { contains: filtros.busqueda, mode: 'insensitive' } },
        { apellidos: { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.ciudadano.count({ where }),
      prisma.ciudadano.findMany({
        where,
        skip,
        take: limite,
        orderBy: { fechaRegistro: 'desc' },
      }),
    ]);

    const totalPaginas = Math.ceil(total / limite);
    const data = records.map((r) => CiudadanoMapper.toDomain(r));

    return {
      data,
      total,
      pagina,
      limite,
      totalPaginas,
    };
  }
}
