import { ICitaRepository } from '../../../domain/ports/outgoing/ICitaRepository';
import { Cita } from '../../../domain/entities/Cita';
import { CitaNoEncontradaException } from '../../../domain/exceptions/CitaExceptions';

export class AtenderCitaUseCase {
  constructor(private readonly citaRepository: ICitaRepository) {}

  public async execute(codigoCita: string): Promise<Cita> {
    const cita = await this.citaRepository.findByCodigo(codigoCita);
    if (!cita) {
      throw new CitaNoEncontradaException(codigoCita);
    }

    cita.marcarAtendida();
    return await this.citaRepository.update(cita);
  }
}
