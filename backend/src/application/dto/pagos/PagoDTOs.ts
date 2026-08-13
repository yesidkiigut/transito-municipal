import { z } from 'zod';

export const IniciarPagoPSESchema = z.object({
  ciudadanoId: z.string().min(1, 'El ID del ciudadano es obligatorio'),
  bancoCodigo: z.string().min(1, 'Debe seleccionar un banco'),
  tipoPersona: z.enum(['NATURAL', 'JURIDICA']).default('NATURAL'),
  correoPagador: z.string().email('Correo de pagador inválido'),
  telefonoPagador: z.string().min(7, 'Teléfono requerido'),
  conceptos: z.array(
    z.object({
      tipoConcepto: z.enum(['COMPARENDO', 'IMPUESTO_VEHICULAR', 'TRAMITE_LICENCIA', 'TRAMITE_MATRICULA', 'RODAMIENTO_MUNICIPAL']),
      referenciaConcepto: z.string(),
      descripcion: z.string(),
      codigoContable: z.string().default('2.1.2.02.02'),
      valorBase: z.number().positive(),
      descuento: z.number().default(0),
      interesesMora: z.number().default(0),
      valorFinal: z.number().positive(),
    })
  ).min(1, 'Debe incluir al menos un concepto a pagar'),
});

export const IniciarPagoBreBSchema = z.object({
  ciudadanoId: z.string().min(1, 'El ID del ciudadano es obligatorio'),
  tipoLlave: z.enum(['CELULAR', 'CEDULA', 'CORREO', 'ALFANUMERICO']).default('CELULAR'),
  llaveDestino: z.string().optional(),
  correoPagador: z.string().email().optional(),
  conceptos: z.array(
    z.object({
      tipoConcepto: z.enum(['COMPARENDO', 'IMPUESTO_VEHICULAR', 'TRAMITE_LICENCIA', 'TRAMITE_MATRICULA', 'RODAMIENTO_MUNICIPAL']),
      referenciaConcepto: z.string(),
      descripcion: z.string(),
      codigoContable: z.string().default('2.1.2.02.02'),
      valorBase: z.number().positive(),
      descuento: z.number().default(0),
      interesesMora: z.number().default(0),
      valorFinal: z.number().positive(),
    })
  ).min(1, 'Debe incluir al menos un concepto a pagar'),
});

export type IniciarPagoPSEInput = z.infer<typeof IniciarPagoPSESchema>;
export type IniciarPagoBreBInput = z.infer<typeof IniciarPagoBreBSchema>;

export interface BancoPSE {
  codigo: string;
  nombre: string;
  tipo: string;
}

export interface RespuestaInicioPagoDTO {
  referenciaPago: string;
  cus?: string;
  montoTotal: number;
  canalPago: string;
  estadoPago: string;
  urlPasarela?: string;
  qrBreB?: string;
  llaveBreB?: string;
  fechaTransaccion: string;
  fechaExpiracion?: string;
}

export interface ConceptoLiquidadoItem {
  id: string;
  tipo: 'COMPARENDO' | 'IMPUESTO_VEHICULAR' | 'TRAMITE' | 'RODAMIENTO';
  referencia: string;
  descripcion: string;
  valorOriginal: number;
  descuentoLey: number;
  porcentajeDescuento: number;
  interesesMora: number;
  valorTotal: number;
  fechaVencimiento?: string;
  aplicaDescuentoCurso?: boolean;
}
