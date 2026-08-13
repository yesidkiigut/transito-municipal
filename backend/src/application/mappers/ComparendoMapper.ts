import { Comparendo } from '../../domain/entities/Comparendo';
import { ComparendoResponseDTO } from '../dto/comparendo/ComparendoDTOs';

export class ComparendoMapper {
  public static toDTO(comparendo: Comparendo): ComparendoResponseDTO {
    return {
      id: comparendo.id,
      numeroComparendo: comparendo.numeroComparendo,
      placaVehiculo: comparendo.placaVehiculo,
      ciudadanoId: comparendo.ciudadanoId,
      tipoInfraccionId: comparendo.tipoInfraccionId,
      fechaInfraccion: comparendo.fechaInfraccion.toISOString(),
      lugarInfraccion: comparendo.lugarInfraccion,
      agenteTransitoId: comparendo.agenteTransitoId,
      observaciones: comparendo.observaciones,
      evidencias: comparendo.evidencias,
      estado: comparendo.estado,
      valorMulta: comparendo.valorMulta,
      gradoInfraccion: comparendo.gradoInfraccion,
      puntosDescuento: comparendo.puntosDescuento,
    };
  }

  public static toDomain(prismaModel: any): Comparendo {
    return new Comparendo({
      id: prismaModel.id,
      numeroComparendo: prismaModel.numeroComparendo,
      placaVehiculo: prismaModel.placaVehiculo,
      ciudadanoId: prismaModel.ciudadanoId,
      tipoInfraccionId: prismaModel.tipoInfraccionId,
      fechaInfraccion: new Date(prismaModel.fechaInfraccion),
      lugarInfraccion: prismaModel.lugarInfraccion,
      agenteTransitoId: prismaModel.agenteTransitoId,
      observaciones: prismaModel.observaciones,
      evidencias: prismaModel.evidencias || [],
      estado: prismaModel.estado,
      valorMulta: prismaModel.valorMulta,
      gradoInfraccion: prismaModel.gradoInfraccion,
      puntosDescuento: prismaModel.puntosDescuento,
    });
  }

  public static toPersistence(comparendo: Comparendo): any {
    return {
      id: comparendo.id,
      numeroComparendo: comparendo.numeroComparendo,
      placaVehiculo: comparendo.placaVehiculo,
      ciudadanoId: comparendo.ciudadanoId,
      tipoInfraccionId: comparendo.tipoInfraccionId,
      fechaInfraccion: comparendo.fechaInfraccion,
      lugarInfraccion: comparendo.lugarInfraccion,
      agenteTransitoId: comparendo.agenteTransitoId,
      observaciones: comparendo.observaciones,
      evidencias: comparendo.evidencias,
      estado: comparendo.estado,
      valorMulta: comparendo.valorMulta,
      gradoInfraccion: comparendo.gradoInfraccion,
      puntosDescuento: comparendo.puntosDescuento,
    };
  }
}
