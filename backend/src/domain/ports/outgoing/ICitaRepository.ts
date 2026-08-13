import { Cita } from '../../entities/Cita';

export interface FiltrosListarCitas {
  ciudadanoId?: string;
  puestoAtencionId?: string;
  fecha?: Date;
  estado?: string;
}

export interface ICitaRepository {
  save(cita: Cita): Promise<Cita>;
  findByCodigo(codigoCita: string): Promise<Cita | null>;
  findCitaActivaPorCiudadanoYTipo(ciudadanoId: string, tipoTramiteId: string): Promise<Cita | null>;
  findAll(filtros: FiltrosListarCitas): Promise<Cita[]>;
  update(cita: Cita): Promise<Cita>;
}
