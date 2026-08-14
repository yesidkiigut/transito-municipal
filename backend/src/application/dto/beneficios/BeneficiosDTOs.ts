import { z } from 'zod';

export const ConsultarTramosBeneficioQuerySchema = z.object({
  tipoConcepto: z.enum(['COMPARENDO', 'IMPUESTO_VEHICULAR']),
  referenciaId: z.string().min(1, 'La referencia o ID de la obligación es requerida'),
  fechaCorte: z.string().optional(),
  realizoCurso: z.union([z.boolean(), z.string().transform((v) => v === 'true' || v === '1')]).optional().default(false),
});

export type ConsultarTramosBeneficioQueryDTO = z.infer<typeof ConsultarTramosBeneficioQuerySchema>;

export const CrearReglaDescuentoSchema = z.object({
  codigo: z.string().min(2, 'El código debe tener al menos 2 caracteres'),
  descripcion: z.string().min(3, 'La descripción es obligatoria'),
  diasHabilesMin: z.number().int().min(0),
  diasHabilesMax: z.number().int().min(1),
  porcentajeDescuento: z.number().min(0).max(100),
  requiereCurso: z.boolean().default(false),
  leyReferencia: z.string().optional().default('Decreto Municipal / Ley 769'),
  activo: z.boolean().default(true),
});

export type CrearReglaDescuentoDTO = z.infer<typeof CrearReglaDescuentoSchema>;

export const GuardarParametroAnualSchema = z.object({
  vigenciaFiscal: z.number().int().min(2000).max(2100),
  uvtValor: z.number().positive(),
  smmlvValor: z.number().positive(),
  sancionMinimaMora: z.number().positive(),
  valorCursoPedagogico: z.number().min(0).default(0),
  porcentajeDescuentoProntoPago: z.number().min(0).max(100).default(10.0),
  fechaLimiteProntoPago: z.string(),
  activo: z.boolean().default(true),
});

export type GuardarParametroAnualDTO = z.infer<typeof GuardarParametroAnualSchema>;

export const RegistrarTasaMoraSchema = z.object({
  anio: z.number().int().min(2020).max(2100),
  mes: z.number().int().min(1).max(12),
  tasaEfectivaAnual: z.number().positive(),
  tasaNominalMensual: z.number().positive(),
  tasaDiaria: z.number().positive(),
  resolucionSuperfinanciera: z.string().optional(),
  activo: z.boolean().default(true),
});

export type RegistrarTasaMoraDTO = z.infer<typeof RegistrarTasaMoraSchema>;
