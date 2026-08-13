import { IVehiculoRepository } from '../../../domain/ports/outgoing/IVehiculoRepository';
import { ICiudadanoRepository } from '../../../domain/ports/outgoing/ICiudadanoRepository';
import { RegistrarVehiculoDTO, RegistrarVehiculoSchema } from '../../dto/vehiculo/VehiculoDTOs';
import { Vehiculo } from '../../../domain/entities/Vehiculo';
import { PlacaYaRegistradaException } from '../../../domain/exceptions/VehiculoExceptions';
import { CiudadanoNoEncontradoException } from '../../../domain/exceptions/CiudadanoExceptions';

export class RegistrarVehiculoUseCase {
  constructor(
    private readonly vehiculoRepository: IVehiculoRepository,
    private readonly ciudadanoRepository: ICiudadanoRepository
  ) {}

  public async execute(dto: RegistrarVehiculoDTO): Promise<Vehiculo> {
    const validated = RegistrarVehiculoSchema.parse(dto);
    const placaNormalizada = validated.placa.toUpperCase();

    // Validar duplicado de placa
    const existe = await this.vehiculoRepository.findByPlaca(placaNormalizada);
    if (existe) {
      throw new PlacaYaRegistradaException(placaNormalizada);
    }

    // Validar existencia del propietario inicial
    const propietario = await this.ciudadanoRepository.findById(validated.propietarioInicialCiudadanoId);
    if (!propietario) {
      throw new CiudadanoNoEncontradoException(`id '${validated.propietarioInicialCiudadanoId}'`);
    }

    const id = `veh-${Date.now()}`;
    const vehiculo = new Vehiculo({
      id,
      placa: placaNormalizada,
      marca: validated.marca,
      linea: validated.linea,
      modelo: validated.modelo,
      cilindraje: validated.cilindraje,
      color: validated.color,
      tipoVehiculo: validated.tipoVehiculo,
      claseServicio: validated.claseServicio,
      numeroMotor: validated.numeroMotor,
      numeroChasis: validated.numeroChasis,
      fechaMatricula: new Date(validated.fechaMatricula),
    });

    vehiculo.asignarPropietarioInicial(propietario.id);

    return await this.vehiculoRepository.save(vehiculo);
  }
}
