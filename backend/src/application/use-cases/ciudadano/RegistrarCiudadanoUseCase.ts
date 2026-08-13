import { ICiudadanoRepository } from '../../../domain/ports/outgoing/ICiudadanoRepository';
import { RegistrarCiudadanoDTO, RegistrarCiudadanoSchema } from '../../dto/ciudadano/CiudadanoDTOs';
import { Ciudadano } from '../../../domain/entities/Ciudadano';
import { Direccion } from '../../../domain/value-objects/Direccion';
import { DocumentoYaRegistradoException } from '../../../domain/exceptions/CiudadanoExceptions';

export class RegistrarCiudadanoUseCase {
  constructor(private readonly ciudadanoRepository: ICiudadanoRepository) {}

  public async execute(dto: RegistrarCiudadanoDTO): Promise<Ciudadano> {
    const validated = RegistrarCiudadanoSchema.parse(dto);

    // Valida duplicado por número de documento
    const existente = await this.ciudadanoRepository.findByDocumento(validated.numeroDocumento);
    if (existente) {
      throw new DocumentoYaRegistradoException(validated.numeroDocumento);
    }

    const direccionVO = new Direccion(validated.direccion);

    // Dynamic ID assignment
    const id = `ciud-${Date.now()}`;

    const nuevoCiudadano = new Ciudadano({
      id,
      usuarioId: validated.usuarioId,
      tipoDocumento: validated.tipoDocumento,
      numeroDocumento: validated.numeroDocumento,
      nombres: validated.nombres,
      apellidos: validated.apellidos,
      fechaNacimiento: new Date(validated.fechaNacimiento),
      correo: validated.correo,
      telefono: validated.telefono,
      direccion: direccionVO,
      estado: 'ACTIVO',
    });

    return await this.ciudadanoRepository.save(nuevoCiudadano);
  }
}
