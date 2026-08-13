import { Ciudadano } from '../../domain/entities/Ciudadano';
import { Direccion } from '../../domain/value-objects/Direccion';
import { CiudadanoResponseDTO } from '../dto/ciudadano/CiudadanoDTOs';

export class CiudadanoMapper {
  public fontToDTO(ciudadano: Ciudadano): CiudadanoResponseDTO {
    return {
      id: ciudadano.id,
      tipoDocumento: ciudadano.tipoDocumento,
      numeroDocumento: ciudadano.numeroDocumento,
      nombreCompleto: ciudadano.nombreCompleto,
      nombres: ciudadano.nombres,
      apellidos: ciudadano.apellidos,
      fechaNacimiento: ciudadano.fechaNacimiento.toISOString().split('T')[0],
      edad: ciudadano.calcularEdad(),
      correo: ciudadano.correo,
      telefono: ciudadano.telefono,
      direccion: ciudadano.direccion.toString(),
      estado: ciudadano.estado,
      fechaRegistro: ciudadano.fechaRegistro.toISOString(),
    };
  }

  public static toDomain(prismaModel: any): Ciudadano {
    return new Ciudadano({
      id: prismaModel.id,
      usuarioId: prismaModel.usuarioId,
      tipoDocumento: prismaModel.tipoDocumento,
      numeroDocumento: prismaModel.numeroDocumento,
      nombres: prismaModel.nombres,
      apellidos: prismaModel.apellidos,
      fechaNacimiento: new Date(prismaModel.fechaNacimiento),
      correo: prismaModel.correo,
      telefono: prismaModel.telefono,
      direccion: new Direccion({
        via: prismaModel.via,
        numero1: prismaModel.numero1,
        numero2: prismaModel.numero2,
        barrio: prismaModel.barrio,
        ciudad: prismaModel.ciudad,
        departamento: prismaModel.departamento,
      }),
      estado: prismaModel.estado,
      fechaRegistro: new Date(prismaModel.fechaRegistro),
      updatedAt: new Date(prismaModel.updatedAt),
    });
  }

  public static toPersistence(ciudadano: Ciudadano): any {
    return {
      id: ciudadano.id,
      usuarioId: ciudadano.usuarioId || null,
      tipoDocumento: ciudadano.tipoDocumento,
      numeroDocumento: ciudadano.numeroDocumento,
      nombres: ciudadano.nombres,
      apellidos: ciudadano.apellidos,
      fechaNacimiento: ciudadano.fechaNacimiento,
      correo: ciudadano.correo,
      telefono: ciudadano.telefono,
      via: ciudadano.direccion.via,
      numero1: ciudadano.direccion.numero1,
      numero2: ciudadano.direccion.numero2,
      barrio: ciudadano.direccion.barrio,
      ciudad: ciudadano.direccion.ciudad,
      departamento: ciudadano.direccion.departamento,
      estado: ciudadano.estado,
      fechaRegistro: ciudadano.fechaRegistro,
      updatedAt: ciudadano.updatedAt,
    };
  }
}
