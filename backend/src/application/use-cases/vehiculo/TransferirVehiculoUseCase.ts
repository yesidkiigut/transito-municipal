import { IVehiculoRepository } from '../../../domain/ports/outgoing/IVehiculoRepository';
import { ICiudadanoRepository } from '../../../domain/ports/outgoing/ICiudadanoRepository';
import { TransferirVehiculoDTO, TransferirVehiculoSchema } from '../../dto/vehiculo/VehiculoDTOs';
import { Vehiculo } from '../../../domain/entities/Vehiculo';
import {
  VehiculoNoEncontradoException,
  VehiculoConComparendosPendientesException,
} from '../../../domain/exceptions/VehiculoExceptions';
import { CiudadanoNoEncontradoException } from '../../../domain/exceptions/CiudadanoExceptions';

export class TransferirVehiculoUseCase {
  constructor(
    private readonly vehiculoRepository: IVehiculoRepository,
    private readonly ciudadanoRepository: ICiudadanoRepository
  ) {}

  public async execute(placa: string, dto: TransferirVehiculoDTO): Promise<Vehiculo> {
    const validated = TransferirVehiculoSchema.parse(dto);
    const placaUpper = placa.toUpperCase();

    // 1. Buscar vehículo
    const vehiculo = await this.vehiculoRepository.findByPlaca(placaUpper);
    if (!vehiculo) {
      throw new VehiculoNoEncontradoException(placaUpper);
    }

    // 2. REGLA DE NEGOCIO CRÍTICA: Bloquea transferencia si tiene comparendos pendientes
    const tieneComparendos = await this.vehiculoRepository.tieneComparendosPendientes(placaUpper);
    if (tieneComparendos) {
      throw new VehiculoConComparendosPendientesException(placaUpper, 1);
    }

    // 3. Validar nuevo propietario
    const nuevoPropietario = await this.ciudadanoRepository.findById(validated.nuevoPropietarioCiudadanoId);
    if (!nuevoPropietario) {
      throw new CiudadanoNoEncontradoException(`id '${validated.nuevoPropietarioCiudadanoId}'`);
    }

    // 4. Ejecutar traspaso en el modelo de dominio
    vehiculo.transferirPropietario(nuevoPropietario.id);

    return await this.vehiculoRepository.update(vehiculo);
  }
}
