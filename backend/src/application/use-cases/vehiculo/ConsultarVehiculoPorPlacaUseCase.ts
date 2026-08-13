import { IVehiculoRepository } from '../../../domain/ports/outgoing/IVehiculoRepository';
import { Vehiculo } from '../../../domain/entities/Vehiculo';
import { VehiculoNoEncontradoException } from '../../../domain/exceptions/VehiculoExceptions';

export class ConsultarVehiculoPorPlacaUseCase {
  constructor(private readonly vehiculoRepository: IVehiculoRepository) {}

  public async execute(placa: string): Promise<Vehiculo> {
    const placaUpper = placa.toUpperCase();
    const vehiculo = await this.vehiculoRepository.findByPlaca(placaUpper);
    if (!vehiculo) {
      throw new VehiculoNoEncontradoException(placaUpper);
    }
    return vehiculo;
  }
}
