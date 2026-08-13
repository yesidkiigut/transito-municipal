import { Comparendo } from '../../entities/Comparendo';
import { ResultadoPaginado } from './ICiudadanoRepository';

export interface FiltrosListarComparendos {
  placaVehiculo?: string;
  ciudadanoId?: string;
  estado?: string;
  pagina?: number;
  limite?: number;
}

export interface IComparendoRepository {
  save(comparendo: Comparendo): Promise<Comparendo>;
  findByNumero(numeroComparendo: string): Promise<Comparendo | null>;
  findAll(filtros: FiltrosListarComparendos): Promise<ResultadoPaginado<Comparendo>>;
  update(comparendo: Comparendo): Promise<Comparendo>;
  guardarResolucion(resolucion: {
    comparendoId: string;
    numeroResolucion: string;
    tipo: string;
    motivo: string;
    funcionarioId: string;
  }): Promise<any>;
}
