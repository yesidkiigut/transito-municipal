import { ILicenciaRepository } from '../../../../domain/ports/outgoing/ILicenciaRepository';
import { Licencia, CategoriaLicencia } from '../../../../domain/entities/Licencia';
import { LicenciaMapper } from '../../../../application/mappers/LicenciaMapper';
import { prisma } from '../client';

export class PrismaLicenciaRepository implements ILicenciaRepository {
  public async save(licencia: Licencia): Promise<Licencia> {
    const data = LicenciaMapper.toPersistence(licencia);
    const created = await prisma.licencia.create({ data });
    return LicenciaMapper.toDomain(created);
  }

  public async findByNumero(numeroLicencia: string): Promise<Licencia | null> {
    const record = await prisma.licencia.findUnique({ where: { numeroLicencia } });
    if (!record) return null;
    return LicenciaMapper.toDomain(record);
  }

  public async findByCiudadanoId(ciudadanoId: string): Promise<Licencia[]> {
    const records = await prisma.licencia.findMany({ where: { ciudadanoId } });
    return records.map((r) => LicenciaMapper.toDomain(r));
  }

  public async findVigentePorCiudadanoYCategoria(
    ciudadanoId: string,
    categoria: CategoriaLicencia
  ): Promise<Licencia | null> {
    const record = await prisma.licencia.findFirst({
      where: { ciudadanoId, categoria, estado: 'VIGENTE' },
    });
    if (!record) return null;
    return LicenciaMapper.toDomain(record);
  }

  public async update(licencia: Licencia): Promise<Licencia> {
    const data = LicenciaMapper.toPersistence(licencia);
    const updated = await prisma.licencia.update({
      where: { id: licencia.id },
      data,
    });
    return LicenciaMapper.toDomain(updated);
  }
}
