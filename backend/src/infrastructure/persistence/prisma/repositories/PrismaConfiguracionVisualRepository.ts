import { IConfiguracionVisualRepository } from '../../../../domain/ports/outgoing/IConfiguracionVisualRepository';
import { ConfiguracionVisual } from '../../../../domain/entities/ConfiguracionVisual';
import { ConfiguracionVisualMapper } from '../../../../application/mappers/ConfiguracionVisualMapper';
import { prisma } from '../client';

export class PrismaConfiguracionVisualRepository implements IConfiguracionVisualRepository {
  public async obtenerConfiguracion(): Promise<ConfiguracionVisual> {
    const record = await prisma.configuracionVisual.findFirst({
      where: { activo: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!record) {
      const defecto = ConfiguracionVisual.crearDefecto();
      const creado = await prisma.configuracionVisual.create({
        data: ConfiguracionVisualMapper.toPersistence(defecto),
      });
      return ConfiguracionVisualMapper.toDomain(creado);
    }

    return ConfiguracionVisualMapper.toDomain(record);
  }

  public async guardarConfiguracion(config: ConfiguracionVisual): Promise<ConfiguracionVisual> {
    const existente = await prisma.configuracionVisual.findFirst({
      where: { activo: true },
      orderBy: { updatedAt: 'desc' },
    });

    const persistenceData = ConfiguracionVisualMapper.toPersistence(config);

    if (existente) {
      const updated = await prisma.configuracionVisual.update({
        where: { id: existente.id },
        data: persistenceData,
      });
      return ConfiguracionVisualMapper.toDomain(updated);
    } else {
      const created = await prisma.configuracionVisual.create({
        data: persistenceData,
      });
      return ConfiguracionVisualMapper.toDomain(created);
    }
  }

  public async restablecerConfiguracion(): Promise<ConfiguracionVisual> {
    const defecto = ConfiguracionVisual.crearDefecto();
    const existente = await prisma.configuracionVisual.findFirst({
      where: { activo: true },
    });

    const persistenceData = ConfiguracionVisualMapper.toPersistence(defecto);

    if (existente) {
      const updated = await prisma.configuracionVisual.update({
        where: { id: existente.id },
        data: persistenceData,
      });
      return ConfiguracionVisualMapper.toDomain(updated);
    } else {
      const created = await prisma.configuracionVisual.create({
        data: persistenceData,
      });
      return ConfiguracionVisualMapper.toDomain(created);
    }
  }
}
