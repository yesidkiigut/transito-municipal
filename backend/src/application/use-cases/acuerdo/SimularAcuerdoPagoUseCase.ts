import { ILiquidacionRepository, CuotaSimuladaResult } from '../../../domain/ports/outgoing/ILiquidacionRepository';
import { SimularAcuerdoPagoDTO, SimularAcuerdoPagoSchema } from '../../dto/acuerdo/AcuerdoPagoDTOs';

export class SimularAcuerdoPagoUseCase {
  constructor(private readonly liquidacionRepository: ILiquidacionRepository) {}

  public async execute(dto: SimularAcuerdoPagoDTO): Promise<{
    montoTotal: number;
    porcentajeInicial: number;
    montoInicial: number;
    saldoFinanciar: number;
    numeroCuotas: number;
    tasaInteresMensual: number;
    cuotas: CuotaSimuladaResult[];
  }> {
    const validated = SimularAcuerdoPagoSchema.parse(dto);
    const fechaInicio = validated.fechaInicio ? new Date(validated.fechaInicio) : new Date();

    const cuotas = await this.liquidacionRepository.simularAcuerdoPago(
      validated.montoTotal,
      validated.porcentajeInicial,
      validated.numeroCuotas,
      validated.tasaInteres,
      fechaInicio
    );

    const montoInicial = Math.round(validated.montoTotal * ((validated.porcentajeInicial ?? 20) / 100));
    const saldoFinanciar = validated.montoTotal - montoInicial;

    return {
      montoTotal: validated.montoTotal,
      porcentajeInicial: validated.porcentajeInicial ?? 20,
      montoInicial,
      saldoFinanciar,
      numeroCuotas: validated.numeroCuotas ?? 6,
      tasaInteresMensual: validated.tasaInteres ?? 1.2,
      cuotas,
    };
  }
}
