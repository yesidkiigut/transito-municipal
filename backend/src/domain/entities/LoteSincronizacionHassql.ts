export type EstadoLoteSync = 'EXITOSO' | 'PARCIAL' | 'FALLIDO' | 'EN_PROCESO';

export interface LoteSincronizacionHassqlProps {
  id?: string;
  codigoLote: string;
  fechaInicio: Date;
  fechaFin: Date;
  totalTransacciones: number;
  totalRecaudado: number;
  totalPSE: number;
  totalBreB: number;
  estado: EstadoLoteSync;
  comprobanteHassqlId?: string | null;
  respuestaServidor?: string | null;
  archivoPlanoGenerado?: string | null;
  detallesContables?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class LoteSincronizacionHassql {
  public readonly id?: string;
  public readonly codigoLote: string;
  public readonly fechaInicio: Date;
  public readonly fechaFin: Date;
  public readonly totalTransacciones: number;
  public readonly totalRecaudado: number;
  public readonly totalPSE: number;
  public readonly totalBreB: number;
  public estado: EstadoLoteSync;
  public comprobanteHassqlId?: string | null;
  public respuestaServidor?: string | null;
  public archivoPlanoGenerado?: string | null;
  public detallesContables?: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: LoteSincronizacionHassqlProps) {
    this.id = props.id;
    this.codigoLote = props.codigoLote;
    this.fechaInicio = props.fechaInicio || new Date();
    this.fechaFin = props.fechaFin || new Date();
    this.totalTransacciones = props.totalTransacciones || 0;
    this.totalRecaudado = props.totalRecaudado || 0;
    this.totalPSE = props.totalPSE || 0;
    this.totalBreB = props.totalBreB || 0;
    this.estado = props.estado || 'EN_PROCESO';
    this.comprobanteHassqlId = props.comprobanteHassqlId;
    this.respuestaServidor = props.respuestaServidor;
    this.archivoPlanoGenerado = props.archivoPlanoGenerado;
    this.detallesContables = props.detallesContables;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public marcarExitoso(comprobanteId: string, respuesta?: string): void {
    this.estado = 'EXITOSO';
    this.comprobanteHassqlId = comprobanteId;
    this.respuestaServidor = respuesta;
  }

  public marcarFallido(error: string): void {
    this.estado = 'FALLIDO';
    this.respuestaServidor = error;
  }
}
