import { Licencia } from '../../domain/entities/Licencia';
import { LicenciaResponseDTO } from '../dto/licencia/LicenciaDTOs';

export class LicenciaMapper {
  public static toDTO(licencia: Licencia): LicenciaResponseDTO {
    return {
      id: licencia.id,
      numeroLicencia: licencia.numeroLicencia,
      ciudadanoId: licencia.ciudadanoId,
      categoria: licencia.categoria,
      fechaExpedicion: licencia.fechaExpedicion.toISOString().split('T')[0],
      fechaVencimiento: licencia.fechaVencimiento.toISOString().split('T')[0],
      estado: licencia.estado,
      restricciones: licencia.restricciones,
      organismoExpedidor: licencia.organismoExpedidor,
      puntosAcumulados: licencia.puntosAcumulados,
    };
  }

  public static toDomain(prismaModel: any): Licencia {
    return new Licencia({
      id: prismaModel.id,
      numeroLicencia: prismaModel.numeroLicencia,
      ciudadanoId: prismaModel.ciudadanoId,
      categoria: prismaModel.categoria,
      fechaExpedicion: new Date(prismaModel.fechaExpedicion),
      fechaVencimiento: new Date(prismaModel.fechaVencimiento),
      estado: prismaModel.estado,
      restricciones: prismaModel.restricciones || [],
      organismoExpedidor: prismaModel.organismoExpedidor,
      puntosAcumulados: prismaModel.puntosAcumulados,
    });
  }

  public static toPersistence(licencia: Licencia): any {
    return {
      id: licencia.id,
      numeroLicencia: licencia.numeroLicencia,
      ciudadanoId: licencia.ciudadanoId,
      categoria: licencia.categoria,
      fechaExpedicion: licencia.fechaExpedicion,
      fechaVencimiento: licencia.fechaVencimiento,
      estado: licencia.estado,
      restricciones: licencia.restricciones,
      organismoExpedidor: licencia.organismoExpedidor,
      puntosAcumulados: licencia.puntosAcumulados,
    };
  }
}
