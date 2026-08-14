import { z } from 'zod';

export const SimularAcuerdoPagoSchema = z.object({
  montoTotal: z.number().positive('El monto total de la deuda debe ser mayor a 0'),
  porcentajeInicial: z.number().min(0).max(100).optional().default(20.0),
  numeroCuotas: z.number().int().min(1).max(36).optional().default(6),
  tasaInteres: z.number().min(0).max(10).optional().default(1.2),
  fechaInicio: z.string().optional(),
});

export type SimularAcuerdoPagoDTO = z.infer<typeof SimularAcuerdoPagoSchema>;

export const DetalleItemDeudaSchema = z.object({
  tipoConcepto: z.enum(['COMPARENDO', 'IMPUESTO_VEHICULAR', 'TRAMITE_LICENCIA', 'TRAMITE_MATRICULA', 'RODAMIENTO_MUNICIPAL']),
  referenciaConcepto: z.string().min(1),
  montoCapital: z.number().min(0),
  montoIntereses: z.number().min(0).default(0),
  montoTotal: z.number().positive(),
});

export const CrearAcuerdoPagoSchema = z.object({
  ciudadanoId: z.string().min(1, 'El ID del ciudadano es requerido'),
  placaVehiculo: z.string().optional(),
  montoTotalDeuda: z.number().positive('El monto de la deuda debe ser mayor a 0'),
  porcentajeInicial: z.number().min(0).max(100).default(20.0),
  numeroCuotas: z.number().int().min(1).max(36).default(6),
  tasaInteresFinanciacion: z.number().min(0).max(10).default(1.2),
  detallesDeuda: z.array(DetalleItemDeudaSchema).optional().default([]),
  observaciones: z.string().optional(),
  funcionarioRadicaId: z.string().optional(),
});

export type CrearAcuerdoPagoDTO = z.infer<typeof CrearAcuerdoPagoSchema>;
