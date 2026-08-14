import { z } from 'zod';

export const LiquidarComparendoQuerySchema = z.object({
  id: z.string().min(1, 'El ID o número de comparendo es requerido'),
  fechaCorte: z.string().optional(),
  realizoCurso: z.union([z.boolean(), z.string().transform((v) => v === 'true' || v === '1')]).optional().default(false),
});

export type LiquidarComparendoQueryDTO = z.infer<typeof LiquidarComparendoQuerySchema>;

export const LiquidarImpuestoQuerySchema = z.object({
  placa: z.string().min(5, 'La placa debe tener al menos 5 caracteres').max(6),
  vigencia: z.union([z.number(), z.string().transform((v) => parseInt(v, 10))]).optional().default(2026),
  fechaCorte: z.string().optional(),
  aplicaTraslado: z.union([z.boolean(), z.string().transform((v) => v === 'true' || v === '1')]).optional().default(false),
});

export type LiquidarImpuestoQueryDTO = z.infer<typeof LiquidarImpuestoQuerySchema>;

export const EstadoCuentaQuerySchema = z.object({
  ciudadanoId: z.string().optional(),
  placa: z.string().optional(),
  meses: z.union([z.number(), z.string().transform((v) => parseInt(v, 10))]).optional().default(12),
});

export type EstadoCuentaQueryDTO = z.infer<typeof EstadoCuentaQuerySchema>;
