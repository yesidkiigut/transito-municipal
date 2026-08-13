import { ITramiteRepository } from '../../../domain/ports/outgoing/ITramiteRepository';
import { Tramite } from '../../../domain/entities/Tramite';
import { TramiteNoEncontradoException } from '../../../domain/exceptions/TramiteExceptions';

export class ConsultarTramiteUseCase {
  constructor(private readonly tramiteRepository: ITramiteRepository) {}

  public async execute(codigoTramite: string): Promise<Tramite> {
    const tramite = await this.tramiteRepository.findByCodigo(codigoTramite);
    if (!tramite) {
      throw new TramiteNoEncontradoException(codigoTramite);
    }
    return tramite;
  }
}
