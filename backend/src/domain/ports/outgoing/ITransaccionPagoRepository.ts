import { TransaccionPago } from '../../entities/TransaccionPago';

export interface FiltrosListarPagos {
  ciudadanoId?: string;
  canalPago?: string;
  estadoPago?: string;
  sincronizadoHassql?: boolean;
  fechaInicio?: Date;
  fechaFin?: Date;
  pagina?: number;
  limite?: number;
}

export interface ITransaccionPagoRepository {
  crearTransaccion(transaccion: TransaccionPago): Promise<TransaccionPago>;
  obtenerPorId(id: string): Promise<TransaccionPago | null>;
  obtenerPorReferencia(referenciaPago: string): Promise<TransaccionPago | null>;
  actualizarEstado(transaccion: TransaccionPago): Promise<TransaccionPago>;
  listarTransacciones(filtros: FiltrosListarPagos): Promise<{ data: TransaccionPago[]; total: number }>;
  obtenerPendientesSincronizacionHassql(limite?: number): Promise<TransaccionPago[]>;
}
