import { IComparendoRepository } from '../../../domain/ports/outgoing/IComparendoRepository';
import { ILicenciaRepository } from '../../../domain/ports/outgoing/ILicenciaRepository';
import { ImponerComparendoDTO, ImponerComparendoSchema } from '../../dto/comparendo/ComparendoDTOs';
import { Comparendo } from '../../../domain/entities/Comparendo';

export class ImponerComparendoUseCase {
  constructor(
    private readonly comparendoRepository: IComparendoRepository,
    private readonly licenciaRepository?: ILicenciaRepository
  ) {}

  public async execute(dto: ImponerComparendoDTO): Promise<Comparendo> {
    const validated = ImponerComparendoSchema.parse(dto);

    const puntosDescuento = Comparendo.calcularDescuentoPuntosPorGrado(validated.gradoInfraccion);
    const numeroComparendo = `CMP-${Date.now()}`;
    const id = `cmp-${Date.now()}`;

    const comparendo = new Comparendo({
      id,
      numeroComparendo,
      placaVehiculo: validated.placaVehiculo,
      ciudadanoId: validated.ciudadanoId,
      tipoInfraccionId: validated.tipoInfraccionId,
      fechaInfraccion: new Date(),
      lugarInfraccion: validated.lugarInfraccion,
      agenteTransitoId: validated.agenteTransitoId,
      observaciones: validated.observaciones,
      evidencias: validated.evidencias || [],
      estado: 'PENDIENTE',
      valorMulta: validated.valorMulta,
      gradoInfraccion: validated.gradoInfraccion,
      puntosDescuento,
    });

    const comparendoGuardado = await this.comparendoRepository.save(comparendo);

    // REGLA DE NEGOCIO INTEGRADA: Descontar puntos de licencias activas del infractor
    if (this.licenciaRepository) {
      const licenciasInfractor = await this.licenciaRepository.findByCiudadanoId(validated.ciudadanoId);
      for (const lic of licenciasInfractor) {
        if (lic.estado === 'VIGENTE') {
          lic.descontarPuntos(puntosDescuento);
          await this.licenciaRepository.update(lic);
        }
      }
    }

    return comparendoGuardado;
  }
}
