import { Licencia, CategoriaLicencia } from '../../entities/Licencia';

export interface ILicenciaRepository {
  save(licencia: Licencia): Promise<Licencia>;
  findByNumero(numeroLicencia: string): Promise<Licencia | null>;
  findByCiudadanoId(ciudadanoId: string): Promise<Licencia[]>;
  findVigentePorCiudadanoYCategoria(ciudadanoId: string, categoria: CategoriaLicencia): Promise<Licencia | null>;
  update(licencia: Licencia): Promise<Licencia>;
}
