import { Tramite } from '../../domain/entities/Tramite';
import { TramiteResponseDTO } from '../dto/tramite/TramiteDTOs';

export class TramiteMapper {
  public static toDTO(tramite: Tramite): TramiteResponseDTO {
    return {
      id: tramite.id,
      codigoTramite: tramite.codigoTramite,
      tipoTramiteId: tramite.tipoTramiteId,
      ciudadanoSolicitanteId: tramite.ciudadanoSolicitanteId,
      vehiculoId: tramite.vehiculoId,
      licenciaId: tramite.licenciaId,
      estado: tramite.estado,
      observaciones: tramite.observaciones,
      fechaRadicado: tramite.fechaRadicado.toISOString(),
      fechaResolucion: tramite.fechaResolucion ? tramite.fechaResolucion.toISOString() : null,
      funcionarioAsignadoId: tramite.funcionarioAsignadoId,
      historial: tramite.historial.map(h => ({
        id: h.id,
        paso: h.paso,
        estadoAnterior: h.estadoAnterior,
        estadoNuevo: h.estadoNuevo,
        funcionarioId: h.funcionarioId,
        observacion: h.observacion,
        fecha: h.fecha.toISOString(),
      })),
    };
  }

  public static toDomain(prismaModel: any): Tramite {
    return new Tramite({
      id: prismaModel.id,
      codigoTramite: prismaModel.codigoTramite,
      tipoTramiteId: prismaModel.tipoTramiteId,
      ciudadanoSolicitanteId: prismaModel.ciudadanoSolicitanteId,
      vehiculoId: prismaModel.vehiculoId,
      licenciaId: prismaModel.licenciaId,
      estado: prismaModel.estado,
      observaciones: prismaModel.observaciones,
      fechaRadicado: new Date(prismaModel.fechaRadicado),
      fechaResolucion: prismaModel.fechaResolucion ? new Date(prismaModel.fechaResolucion) : null,
      funcionarioAsignadoId: prismaModel.funcionarioAsignadoId,
      historial: prismaModel.historial ? prismaModel.historial.map((h: any) => ({
        id: h.id,
        paso: h.paso,
        estadoAnterior: h.estadoAnterior,
        estadoNuevo: h.estadoNuevo,
        funcionarioId: h.funcionarioId,
        observacion: h.observacion,
        fecha: new Date(h.fecha),
      })) : [],
    });
  }

  public static toPersistence(tramite: Tramite): any {
    return {
      id: tramite.id,
      codigoTramite: tramite.codigoTramite,
      tipoTramiteId: tramite.tipoTramiteId,
      ciudadanoSolicitanteId: tramite.ciudadanoSolicitanteId,
      vehiculoId: tramite.vehiculoId || null,
      licenciaId: tramite.licenciaId || null,
      estado: tramite.estado,
      observaciones: tramite.observaciones || null,
      fechaRadicado: tramite.fechaRadicado,
      fechaResolucion: tramite.fechaResolucion || null,
      funcionarioAsignadoId: tramite.funcionarioAsignadoId || null,
    };
  }
}
