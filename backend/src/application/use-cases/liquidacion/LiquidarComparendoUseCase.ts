import { ILiquidacionRepository, ComparendoLiquidadoResult } from '../../../domain/ports/outgoing/ILiquidacionRepository';
import { LiquidarComparendoQueryDTO, LiquidarComparendoQuerySchema } from '../../dto/liquidacion/LiquidacionDTOs';

export class LiquidarComparendoUseCase {
  constructor(private readonly liquidacionRepository: ILiquidacionRepository) {}

  public async execute(dto: LiquidarComparendoQueryDTO): Promise<ComparendoLiquidadoResult> {
    const validated = LiquidarComparendoQuerySchema.parse(dto);
    const fechaCorte = validated.fechaCorte ? new Date(validated.fechaCorte) : new Date();

    return this.liquidacionRepository.liquidarComparendo(
      validated.id,
      fechaCorte,
      validated.realizoCurso
    );
  }
}
