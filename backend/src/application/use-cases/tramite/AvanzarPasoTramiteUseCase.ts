import { ITramiteRepository } from '../../../domain/ports/outgoing/ITramiteRepository';
import { AvanzarTramiteDTO, AvanzarTramiteSchema } from '../../dto/tramite/TramiteDTOs';
import { Tramite } from '../../../domain/entities/Tramite';
import { TramiteNoEncontradoException } from '../../../domain/exceptions/TramiteExceptions';

export class AvanzarPasoTramiteUseCase {
  constructor(private readonly tramiteRepository: ITramiteRepository) {}

  public async execute(codigoTramite: string, dto: AvanzarTramiteDTO): Promise<Tramite> {
    const validated = AvanzarTramiteSchema.parse(dto);

    const tramite = await this.tramiteRepository.findByCodigo(codigoTramite);
    if (!tramite) {
      throw new TramiteNoEncontradoException(codigoTramite);
    }

    // Cambia el estado invocando la validación del Workflow Engine en la entidad
    tramite.cambiarEstado(
      validated.nuevoEstado,
      validated.funcionarioId,
      validated.observacion,
      validated.pasoNombre || `Transición a ${validated.nuevoEstado}`
    );

    return await this.tramiteRepository.update(tramite);
  }
}
