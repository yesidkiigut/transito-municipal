import { Vehiculo } from '../../domain/entities/Vehiculo';
import { VehiculoResponseDTO } from '../dto/vehiculo/VehiculoDTOs';

export class VehiculoMapper {
  public static toDTO(vehiculo: Vehiculo): VehiculoResponseDTO {
    const propietarioActual = vehiculo.getPropietarioActual();
    return {
      id: vehiculo.id,
      placa: vehiculo.placa,
      marca: vehiculo.marca,
      linea: vehiculo.linea,
      modelo: vehiculo.modelo,
      cilindraje: vehiculo.cilindraje,
      color: vehiculo.color,
      tipoVehiculo: vehiculo.tipoVehiculo,
      claseServicio: vehiculo.claseServicio,
      numeroMotor: vehiculo.numeroMotor,
      numeroChasis: vehiculo.numeroChasis,
      fechaMatricula: vehiculo.fechaMatricula.toISOString().split('T')[0],
      estado: vehiculo.estado,
      propietarioActualId: propietarioActual?.ciudadanoId,
    };
  }

  public static toDomain(prismaModel: any): Vehiculo {
    return new Vehiculo({
      id: prismaModel.id,
      placa: prismaModel.placa,
      marca: prismaModel.marca,
      linea: prismaModel.linea,
      modelo: prismaModel.modelo,
      cilindraje: prismaModel.cilindraje,
      color: prismaModel.color,
      tipoVehiculo: prismaModel.tipoVehiculo,
      claseServicio: prismaModel.claseServicio,
      numeroMotor: prismaModel.numeroMotor,
      numeroChasis: prismaModel.numeroChasis,
      fechaMatricula: new Date(prismaModel.fechaMatricula),
      estado: prismaModel.estado,
      propietarios: prismaModel.propietarios ? prismaModel.propietarios.map((p: any) => ({
        ciudadanoId: p.ciudadanoId,
        fechaInicio: new Date(p.fechaInicio),
        fechaFin: p.fechaFin ? new Date(p.fechaFin) : null,
        esActual: p.esActual,
      })) : [],
    });
  }

  public static toPersistence(vehiculo: Vehiculo): any {
    return {
      id: vehiculo.id,
      placa: vehiculo.placa,
      marca: vehiculo.marca,
      linea: vehiculo.linea,
      modelo: vehiculo.modelo,
      cilindraje: vehiculo.cilindraje,
      color: vehiculo.color,
      tipoVehiculo: vehiculo.tipoVehiculo,
      claseServicio: vehiculo.claseServicio,
      numeroMotor: vehiculo.numeroMotor,
      numeroChasis: vehiculo.numeroChasis,
      fechaMatricula: vehiculo.fechaMatricula,
      estado: vehiculo.estado,
    };
  }
}
