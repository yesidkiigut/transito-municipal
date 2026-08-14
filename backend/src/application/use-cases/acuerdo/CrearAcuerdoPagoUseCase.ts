import { ILiquidacionRepository } from '../../../domain/ports/outgoing/ILiquidacionRepository';
import { CrearAcuerdoPagoDTO, CrearAcuerdoPagoSchema } from '../../dto/acuerdo/AcuerdoPagoDTOs';

export class CrearAcuerdoPagoUseCase {
  constructor(private readonly liquidacionRepository: ILiquidacionRepository) {}

  public async execute(dto: CrearAcuerdoPagoDTO): Promise<any> {
    const validated = CrearAcuerdoPagoSchema.parse(dto);

    return this.liquidacionRepository.crearAcuerdoPagoTransaccional({
      ciudadanoId: validated.ciudadanoId,
      placa: validated.placaVehiculo,
      montoTotal: validated.montoTotalDeuda,
      porcentajeInicial: validated.porcentajeInicial,
      numeroCuotas: validated.numeroCuotas,
      tasaInteres: validated.tasaInteresFinanciacion,
      detallesDeuda: validated.detallesDeuda,
      funcionarioId: validated.funcionarioRadicaId,
    });
  }
}
