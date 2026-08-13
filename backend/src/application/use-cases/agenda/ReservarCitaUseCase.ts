import { ICitaRepository } from '../../../domain/ports/outgoing/ICitaRepository';
import { ICiudadanoRepository } from '../../../domain/ports/outgoing/ICiudadanoRepository';
import { ReservarCitaDTO, ReservarCitaSchema } from '../../dto/agenda/CitaDTOs';
import { Cita } from '../../../domain/entities/Cita';
import { CiudadanoNoEncontradoException } from '../../../domain/exceptions/CiudadanoExceptions';
import { CitaActivaExistenteException } from '../../../domain/exceptions/CitaExceptions';

export class ReservarCitaUseCase {
  constructor(
    private readonly citaRepository: ICitaRepository,
    private readonly ciudadanoRepository: ICiudadanoRepository
  ) {}

  public async execute(dto: ReservarCitaDTO): Promise<Cita> {
    const validated = ReservarCitaSchema.parse(dto);

    // 1. Validar ciudadano
    const ciudadano = await this.ciudadanoRepository.findById(validated.ciudadanoId);
    if (!ciudadano) {
      throw new CiudadanoNoEncontradoException(`id '${validated.ciudadanoId}'`);
    }

    // 2. REGLA DE NEGOCIO: Máximo 1 cita activa por tipo de trámite por ciudadano
    const citaExistente = await this.citaRepository.findCitaActivaPorCiudadanoYTipo(
      ciudadano.id,
      validated.tipoTramiteId
    );
    if (citaExistente) {
      throw new CitaActivaExistenteException(validated.tipoTramiteId);
    }

    const codigoCita = `CIT-${Date.now().toString().substring(5)}`;
    const id = `cit-${Date.now()}`;

    const nuevaCita = new Cita({
      id,
      codigoCita,
      ciudadanoId: ciudadano.id,
      tipoTramiteId: validated.tipoTramiteId,
      puestoAtencionId: validated.puestoAtencionId,
      fechaCita: new Date(validated.fechaCita),
      horaInicio: validated.horaInicio,
      horaFin: validated.horaFin,
      estado: 'RESERVADA',
    });

    return await this.citaRepository.save(nuevaCita);
  }
}
