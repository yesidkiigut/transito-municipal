import { z } from 'zod';

export const GuardarConfiguracionHassqlSchema = z.object({
  servidorHost: z.string().min(1, 'El servidor host es obligatorio'),
  puerto: z.number().int().default(1433),
  baseDatos: z.string().min(1, 'El nombre de la base de datos es obligatorio'),
  usuario: z.string().min(1, 'El usuario de conexión es obligatorio'),
  password: z.string().min(1, 'La contraseña es requerida'),
  tipoConexion: z.enum(['WEB_SERVICE_REST', 'SOAP_XML', 'SQL_SERVER_DIRECT', 'ARCHIVO_ASOBANCARIA_2001']).default('WEB_SERVICE_REST'),
  tokenApi: z.string().nullable().optional(),
  endpointRecaudo: z.string().url('URL de endpoint inválida'),
  horaCierreFiscal: z.string().default('23:59'),
  activo: z.boolean().default(true),
  autoSincronizar: z.boolean().default(true),
  formatoAsobancaria: z.boolean().default(true),
  codigoEntidadHassql: z.string().default('MUN-TRANSITO-001'),
  cuentaBancariaRecaudo: z.string().default('CTA-CTE-123456789-BANCOLOMBIA'),
});

export type GuardarConfiguracionHassqlInput = z.infer<typeof GuardarConfiguracionHassqlSchema>;

export interface PaqueteRecaudoHassql {
  codigoEntidad: string;
  fechaLote: string;
  codigoLote: string;
  cuentaBancaria: string;
  resumen: {
    totalTransacciones: number;
    montoTotal: number;
    montoPSE: number;
    montoBreB: number;
  };
  imputacionesContables: Array<{
    codigoContable: string;
    descripcionCuenta: string;
    totalCredito: number;
    cantidadMovimientos: number;
  }>;
  movimientos: Array<{
    referenciaPago: string;
    cus: string;
    codigoTrazabilidad?: string;
    canal: string;
    monto: number;
    fechaPago: string;
    conceptos: Array<{
      tipo: string;
      referencia: string;
      codigoContable: string;
      valor: number;
    }>;
  }>;
}

export interface RespuestaSincronizacionHassqlDTO {
  exitoso: boolean;
  codigoLote: string;
  comprobanteHassqlId?: string;
  transaccionesSincronizadas: number;
  montoTotalSincronizado: number;
  mensaje: string;
  archivoAsobancaria?: string;
  detallesContables?: any;
}
