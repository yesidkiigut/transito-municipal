import { Cita } from '../../domain/entities/Cita';
import { CitaResponseDTO } from '../dto/agenda/CitaDTOs';

export class CitaMapper {
  public static toDTO(cita: Cita): CitaResponseDTO {
    return {
      id: cita.id,
      codigoCita: cita.codigoCita,
      ciudadanoId: cita.ciudadanoId,
      tipoTramiteId: cita.tipoTramiteId,
      puestoAtencionId: cita.puestoAtencionId,
      fechaCita: cita.fechaCita.toISOString().split('T')[0],
      horaInicio: cita.horaInicio,
      horaFin: cita.horaFin,
      estado: cita.estado,
    };
  }

  public static toDomain(prismaModel: any): Cita {
    return new Cita({
      id: prismaModel.id,
      codigoCita: prismaModel.codigoCita,
      ciudadanoId: prismaModel.ciudadanoId,
      tipoTramiteId: prismaModel.tipoTramiteId,
      puestoAtencionId: prismaModel.puestoAtencionId,
      fechaCita: new Date(prismaModel.fechaCita),
      horaInicio: prismaModel.horaInicio,
      horaFin: prismaModel.horaFin,
      estado: prismaModel.estado,
    });
  }

  public static toPersistence(cita: Cita): any {
    return {
      id: cita.id,
      codigoCita: cita.codigoCita,
      ciudadanoId: cita.ciudadanoId,
      tipoTramiteId: cita.tipoTramiteId,
      puestoAtencionId: cita.puestoAtencionId,
      fechaCita: cita.fechaCita,
      horaInicio: cita.horaInicio,
      horaFin: cita.horaFin,
      estado: cita.estado,
    };
  }
}
