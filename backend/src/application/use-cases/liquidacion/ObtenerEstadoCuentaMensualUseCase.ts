import { ILiquidacionRepository, EstadoCuentaMensualResult } from '../../../domain/ports/outgoing/ILiquidacionRepository';
import { EstadoCuentaQueryDTO, EstadoCuentaQuerySchema } from '../../dto/liquidacion/LiquidacionDTOs';

export class ObtenerEstadoCuentaMensualUseCase {
  constructor(private readonly liquidacionRepository: ILiquidacionRepository) {}

  public async execute(dto: EstadoCuentaQueryDTO): Promise<EstadoCuentaMensualResult> {
    const validated = EstadoCuentaQuerySchema.parse(dto);

    if (!validated.ciudadanoId && !validated.placa) {
      throw new Error('Debe proporcionar al menos un ID/documento de ciudadano o una placa de vehículo.');
    }

    return this.liquidacionRepository.obtenerEstadoCuentaMensual(
      validated.ciudadanoId,
      validated.placa,
      validated.meses
    );
  }
}
