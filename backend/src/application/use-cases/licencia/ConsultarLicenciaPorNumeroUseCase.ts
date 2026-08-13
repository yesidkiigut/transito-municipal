import { ILicenciaRepository } from '../../../domain/ports/outgoing/ILicenciaRepository';
import { Licencia } from '../../../domain/entities/Licencia';
import { LicenciaNoEncontradaException } from '../../../domain/exceptions/LicenciaExceptions';

export class ConsultarLicenciaPorNumeroUseCase {
  constructor(private readonly licenciaRepository: ILicenciaRepository) {}

  public async execute(numeroLicencia: string): Promise<Licencia> {
    const licencia = await this.licenciaRepository.findByNumero(numeroLicencia);
    if (!licencia) {
      throw new LicenciaNoEncontradaException(numeroLicencia);
    }
    return licencia;
  }
}
