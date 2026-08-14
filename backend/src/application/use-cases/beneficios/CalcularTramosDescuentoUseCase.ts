import { ILiquidacionRepository } from '../../../domain/ports/outgoing/ILiquidacionRepository';
import {
  ConsultarTramosBeneficioQueryDTO,
  ConsultarTramosBeneficioQuerySchema,
} from '../../dto/beneficios/BeneficiosDTOs';

export class CalcularTramosDescuentoUseCase {
  constructor(private readonly liquidacionRepository: ILiquidacionRepository) {}

  public async execute(dto: ConsultarTramosBeneficioQueryDTO): Promise<any> {
    const validated = ConsultarTramosBeneficioQuerySchema.parse(dto);
    const fechaCorte = validated.fechaCorte ? new Date(validated.fechaCorte) : new Date();

    return this.liquidacionRepository.calcularTramosDescuento(
      validated.tipoConcepto,
      validated.referenciaId,
      fechaCorte,
      validated.realizoCurso
    );
  }
}
