import { ILicenciaRepository } from '../../../domain/ports/outgoing/ILicenciaRepository';
import { Licencia } from '../../../domain/entities/Licencia';
import { LicenciaNoEncontradaException, NoAptoParaRenovacionException } from '../../../domain/exceptions/LicenciaExceptions';

export class RenovarLicenciaUseCase {
  constructor(private readonly licenciaRepository: ILicenciaRepository) {}

  public async execute(numeroLicencia: string): Promise<Licencia> {
    const licencia = await this.licenciaRepository.findByNumero(numeroLicencia);
    if (!licencia) {
      throw new LicenciaNoEncontradaException(numeroLicencia);
    }

    if (licencia.estado === 'SUSPENDIDA' || licencia.estado === 'CANCELADA') {
      throw new NoAptoParaRenovacionException(`La licencia se encuentra en estado ${licencia.estado}.`);
    }

    const vigenciaAnios = ['C1', 'C2', 'C3'].includes(licencia.categoria) ? 3 : 10;
    const nuevaFechaVencimiento = new Date();
    nuevaFechaVencimiento.setFullYear(nuevaFechaVencimiento.getFullYear() + vigenciaAnios);

    licencia.renovar(nuevaFechaVencimiento);
    return await this.licenciaRepository.update(licencia);
  }
}
