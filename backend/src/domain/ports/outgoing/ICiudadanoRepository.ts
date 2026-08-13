import { Ciudadano } from '../../entities/Ciudadano';

export interface FiltrosListarCiudadanos {
  tipoDocumento?: string;
  estado?: string;
  busqueda?: string;
  pagina?: number;
  limite?: number;
}

export interface ResultadoPaginado<T> {
  data: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface ICiudadanoRepository {
  save(ciudadano: Ciudadano): Promise<Ciudadano>;
  findById(id: string): Promise<Ciudadano | null>;
  findByDocumento(numeroDocumento: string): Promise<Ciudadano | null>;
  update(ciudadano: Ciudadano): Promise<Ciudadano>;
  findAll(filtros: FiltrosListarCiudadanos): Promise<ResultadoPaginado<Ciudadano>>;
}
