import { ICiudadanoRepository } from '../../../domain/ports/outgoing/ICiudadanoRepository';
import { Ciudadano } from '../../../domain/entities/Ciudadano';
import { CiudadanoNoEncontradoException } from '../../../domain/exceptions/CiudadanoExceptions';

export class ConsultarCiudadanoPorDocumentoUseCase {
  constructor(private readonly ciudadanoRepository: ICiudadanoRepository) {}

  public async execute(numeroDocumento: string): Promise<Ciudadano> {
    const ciudadano = await this.ciudadanoRepository.findByDocumento(numeroDocumento);
    if (!ciudadano) {
      throw new CiudadanoNoEncontradoException(`documento '${numeroDocumento}'`);
    }
    return ciudadano;
  }
}
