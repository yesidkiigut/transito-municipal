import { IVehiculoRepository, FiltrosListarVehiculos } from '../../../../domain/ports/outgoing/IVehiculoRepository';
import { ResultadoPaginado } from '../../../../domain/ports/outgoing/ICiudadanoRepository';
import { Vehiculo } from '../../../../domain/entities/Vehiculo';
import { VehiculoMapper } from '../../../../application/mappers/VehiculoMapper';
import { prisma } from '../client';

export class PrismaVehiculoRepository implements IVehiculoRepository {
  public async save(vehiculo: Vehiculo): Promise<Vehiculo> {
    const data = VehiculoMapper.toPersistence(vehiculo);
    const propietarioActual = vehiculo.getPropietarioActual();

    const created = await prisma.vehiculo.create({
      data: {
        ...data,
        propietarios: propietarioActual ? {
          create: {
            ciudadanoId: propietarioActual.ciudadanoId,
            fechaInicio: propietarioActual.fechaInicio,
            esActual: true,
          }
        } : undefined,
      },
      include: { propietarios: true },
    });

    return VehiculoMapper.toDomain(created);
  }

  public async findByPlaca(placa: string): Promise<Vehiculo | null> {
    const record = await prisma.vehiculo.findUnique({
      where: { placa },
      include: { propietarios: true },
    });
    if (!record) return null;
    return VehiculoMapper.toDomain(record);
  }

  public async findById(id: string): Promise<Vehiculo | null> {
    const record = await prisma.vehiculo.findUnique({
      where: { id },
      include: { propietarios: true },
    });
    if (!record) return null;
    return VehiculoMapper.toDomain(record);
  }

  public async update(vehiculo: Vehiculo): Promise<Vehiculo> {
    const data = VehiculoMapper.toPersistence(vehiculo);
    const propietarios = vehiculo.propietarios;

    // Direct update and sync owner relation
    await prisma.vehiculoPropietario.updateMany({
      where: { vehiculoId: vehiculo.id },
      data: { esActual: false, fechaFin: new Date() },
    });

    const propietarioActual = vehiculo.getPropietarioActual();
    if (propietarioActual) {
      await prisma.vehiculoPropietario.create({
        data: {
          vehiculoId: vehiculo.id,
          ciudadanoId: propietarioActual.ciudadanoId,
          fechaInicio: propietarioActual.fechaInicio,
          esActual: true,
        },
      });
    }

    const updated = await prisma.vehiculo.update({
      where: { id: vehiculo.id },
      data,
      include: { propietarios: true },
    });

    return VehiculoMapper.toDomain(updated);
  }

  public async findAll(filtros: FiltrosListarVehiculos): Promise<ResultadoPaginado<Vehiculo>> {
    const pagina = filtros.pagina || 1;
    const limite = filtros.limite || 10;
    const skip = (pagina - 1) * limite;

    const where: any = {};
    if (filtros.tipoVehiculo) where.tipoVehiculo = filtros.tipoVehiculo;
    if (filtros.claseServicio) where.claseServicio = filtros.claseServicio;
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.busqueda) {
      where.OR = [
        { placa: { contains: filtros.busqueda, mode: 'insensitive' } },
        { marca: { contains: filtros.busqueda, mode: 'insensitive' } },
        { linea: { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.vehiculo.count({ where }),
      prisma.vehiculo.findMany({
        where,
        skip,
        take: limite,
        include: { propietarios: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: records.map(r => VehiculoMapper.toDomain(r)),
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  public async tieneComparendosPendientes(placa: string): Promise<boolean> {
    const count = await prisma.comparendo.count({
      where: {
        placaVehiculo: placa,
        estado: { in: ['PENDIENTE', 'NOTIFICADO'] },
      },
    });
    return count > 0;
  }
}
