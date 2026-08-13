import { ILicenciaRepository } from '../../../domain/ports/outgoing/ILicenciaRepository';
import { ICiudadanoRepository } from '../../../domain/ports/outgoing/ICiudadanoRepository';
import { ExpedirLicenciaDTO, ExpedirLicenciaSchema } from '../../dto/licencia/LicenciaDTOs';
import { Licencia } from '../../../domain/entities/Licencia';
import { CiudadanoNoEncontradoException } from '../../../domain/exceptions/CiudadanoExceptions';
import {
  EdadInsuficienteParaCategoriaException,
  LicenciaVigenteExistenteException,
} from '../../../domain/exceptions/LicenciaExceptions';

export class ExpedirLicenciaNuevaUseCase {
  constructor(
    private readonly licenciaRepository: ILicenciaRepository,
    private readonly ciudadanoRepository: ICiudadanoRepository
  ) {}

  public async execute(dto: ExpedirLicenciaDTO): Promise<Licencia> {
    const validated = ExpedirLicenciaSchema.parse(dto);

    // 1. Verificar ciudadano
    const ciudadano = await this.ciudadanoRepository.findById(validated.ciudadanoId);
    if (!ciudadano) {
      throw new CiudadanoNoEncontradoException(`id '${validated.ciudadanoId}'`);
    }

    // 2. REGLA DE NEGOCIO: Validar edad por categoría
    const edadMinima = Licencia.obtenerEdadMinima(validated.categoria);
    const edadActual = ciudadano.calcularEdad();
    if (edadActual < edadMinima) {
      throw new EdadInsuficienteParaCategoriaException(validated.categoria, edadMinima, edadActual);
    }

    // 3. REGLA DE NEGOCIO: Validar no tener licencia vigente de la misma categoría
    const licenciaExistente = await this.licenciaRepository.findVigentePorCiudadanoYCategoria(
      ciudadano.id,
      validated.categoria
    );
    if (licenciaExistente) {
      throw new LicenciaVigenteExistenteException(validated.categoria);
    }

    // Generar datos de expedición según Ley 2161 de 2021
    const fechaExpedicion = new Date();
    const vigenciaAnios = Licencia.calcularVigenciaAnios(validated.categoria, edadActual);
    const fechaVencimiento = new Date();
    fechaVencimiento.setFullYear(fechaExpedicion.getFullYear() + vigenciaAnios);

    const numeroLicencia = `LIC-${ciudadano.numeroDocumento}-${validated.categoria}`;
    const id = `lic-${Date.now()}`;

    const nuevaLicencia = new Licencia({
      id,
      numeroLicencia,
      ciudadanoId: ciudadano.id,
      categoria: validated.categoria,
      fechaExpedicion,
      fechaVencimiento,
      estado: 'VIGENTE',
      restricciones: validated.restricciones || [],
      organismoExpedidor: validated.organismoExpedidor || 'Tránsito Municipal',
      puntosAcumulados: 12,
    });

    return await this.licenciaRepository.save(nuevaLicencia);
  }
}
