import { ILiquidacionRepository, ImpuestoVehicularLiquidadoResult } from '../../../domain/ports/outgoing/ILiquidacionRepository';
import { LiquidarImpuestoQueryDTO, LiquidarImpuestoQuerySchema } from '../../dto/liquidacion/LiquidacionDTOs';

export class LiquidarImpuestoVehicularUseCase {
  constructor(private readonly liquidacionRepository: ILiquidacionRepository) {}

  public async execute(dto: LiquidarImpuestoQueryDTO): Promise<ImpuestoVehicularLiquidadoResult> {
    const validated = LiquidarImpuestoQuerySchema.parse(dto);
    const fechaCorte = validated.fechaCorte ? new Date(validated.fechaCorte) : new Date();

    return this.liquidacionRepository.liquidarImpuestoVehicular(
      validated.placa,
      validated.vigencia,
      fechaCorte,
      validated.aplicaTraslado
    );
  }
}
