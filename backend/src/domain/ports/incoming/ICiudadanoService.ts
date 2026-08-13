import { Ciudadano } from '../../entities/Ciudadano';
import { RegistrarCiudadanoDTO, ActualizarCiudadanoDTO } from '../../../application/dto/ciudadano/CiudadanoDTOs';
import { FiltrosListarCiudadanos, ResultadoPaginado } from '../outgoing/ICiudadanoRepository';

export interface ICiudadanoService {
  registrarCiudadano(dto: RegistrarCiudadanoDTO): Promise<Ciudadano>;
  consultarPorDocumento(numeroDocumento: string): Promise<Ciudadano>;
  actualizarDatos(numeroDocumento: string, dto: ActualizarCiudadanoDTO): Promise<Ciudadano>;
  listarCiudadanos(filtros: FiltrosListarCiudadanos): Promise<ResultadoPaginado<Ciudadano>>;
}
