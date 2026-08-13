import { ICiudadanoRepository } from '../../../domain/ports/outgoing/ICiudadanoRepository';
import { ActualizarCiudadanoDTO, ActualizarCiudadanoSchema } from '../../dto/ciudadano/CiudadanoDTOs';
import { Ciudadano } from '../../../domain/entities/Ciudadano';
import { Direccion } from '../../../domain/value-objects/Direccion';
import { CiudadanoNoEncontradoException } from '../../../domain/exceptions/CiudadanoExceptions';

export class ActualizarDatosCiudadanoUseCase {
  constructor(private readonly ciudadanoRepository: ICiudadanoRepository) {}

  public async execute(numeroDocumento: string, dto: ActualizarCiudadanoDTO): Promise<Ciudadano> {
    const validated = ActualizarCiudadanoSchema.parse(dto);

    const ciudadano = await this.ciudadanoRepository.findByDocumento(numeroDocumento);
    if (!ciudadano) {
      throw new CiudadanoNoEncontradoException(`documento '${numeroDocumento}'`);
    }

    const nuevaDireccion = new Direccion(validated.direccion);
    ciudadano.actualizarDatosContacto(validated.correo, validated.telefono, nuevaDireccion);

    return await this.ciudadanoRepository.update(ciudadano);
  }
}
