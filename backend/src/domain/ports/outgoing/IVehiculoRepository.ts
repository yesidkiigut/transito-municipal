import { Vehiculo } from '../../entities/Vehiculo';
import { ResultadoPaginado } from './ICiudadanoRepository';

export interface FiltrosListarVehiculos {
  tipoVehiculo?: string;
  claseServicio?: string;
  estado?: string;
  propietarioId?: string;
  busqueda?: string;
  pagina?: number;
  limite?: number;
}

export interface IVehiculoRepository {
  save(vehiculo: Vehiculo): Promise<Vehiculo>;
  findByPlaca(placa: string): Promise<Vehiculo | null>;
  findById(id: string): Promise<Vehiculo | null>;
  update(vehiculo: Vehiculo): Promise<Vehiculo>;
  findAll(filtros: FiltrosListarVehiculos): Promise<ResultadoPaginado<Vehiculo>>;
  tieneComparendosPendientes(placa: string): Promise<boolean>;
}
