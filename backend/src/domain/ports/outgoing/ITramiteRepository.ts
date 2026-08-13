import { Tramite } from '../../entities/Tramite';
import { ResultadoPaginado } from './ICiudadanoRepository';

export interface FiltrosListarTramites {
  tipoTramiteId?: string;
  ciudadanoSolicitanteId?: string;
  estado?: string;
  funcionarioAsignadoId?: string;
  pagina?: number;
  limite?: number;
}

export interface ITramiteRepository {
  save(tramite: Tramite): Promise<Tramite>;
  findByCodigo(codigoTramite: string): Promise<Tramite | null>;
  findById(id: string): Promise<Tramite | null>;
  findAll(filtros: FiltrosListarTramites): Promise<ResultadoPaginado<Tramite>>;
  update(tramite: Tramite): Promise<Tramite>;
}
