import { ITramiteRepository } from '../../../domain/ports/outgoing/ITramiteRepository';
import { ICiudadanoRepository } from '../../../domain/ports/outgoing/ICiudadanoRepository';
import { RadicarTramiteDTO, RadicarTramiteSchema } from '../../dto/tramite/TramiteDTOs';
import { Tramite } from '../../../domain/entities/Tramite';
import { CiudadanoNoEncontradoException } from '../../../domain/exceptions/CiudadanoExceptions';

export class RadicarTramiteUseCase {
  constructor(
    private readonly tramiteRepository: ITramiteRepository,
    private readonly ciudadanoRepository: ICiudadanoRepository
  ) {}

  public async execute(dto: RadicarTramiteDTO): Promise<Tramite> {
    const validated = RadicarTramiteSchema.parse(dto);

    // 1. Validar existencia del solicitante
    const ciudadano = await this.ciudadanoRepository.findById(validated.ciudadanoSolicitanteId);
    if (!ciudadano) {
      throw new CiudadanoNoEncontradoException(`id '${validated.ciudadanoSolicitanteId}'`);
    }

    // 2. Generar código único T-2026-XXXXXX
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const codigoTramite = `T-2026-${randomNum}`;
    const id = `trm-${Date.now()}`;

    const tramite = new Tramite({
      id,
      codigoTramite,
      tipoTramiteId: validated.tipoTramiteId,
      ciudadanoSolicitanteId: ciudadano.id,
      vehiculoId: validated.vehiculoId,
      licenciaId: validated.licenciaId,
      estado: 'RADICADO',
      observaciones: validated.observaciones,
      fechaRadicado: new Date(),
    });

    return await this.tramiteRepository.save(tramite);
  }
}
