import { z } from 'zod';

export const ImponerComparendoSchema = z.object({
  placaVehiculo: z.string().min(5).max(7),
  ciudadanoId: z.string().min(1),
  tipoInfraccionId: z.string().min(1),
  lugarInfraccion: z.string().min(3),
  agenteTransitoId: z.string().min(1),
  observaciones: z.string().optional(),
  evidencias: z.array(z.string()).optional(),
  gradoInfraccion: z.number().int().min(1).max(4).default(1),
  valorMulta: z.number().positive(),
});

export type ImponerComparendoDTO = z.infer<typeof ImponerComparendoSchema>;

export const ResolucionarComparendoSchema = z.object({
  tipo: z.enum(['FALLA', 'CONDENA', 'ARCHIVO']),
  motivo: z.string().min(10, 'El motivo de resolución debe ser explícito'),
  funcionarioId: z.string().min(1),
});

export type ResolucionarComparendoDTO = z.infer<typeof ResolucionarComparendoSchema>;

export interface ComparendoResponseDTO {
  id: string;
  numeroComparendo: string;
  placaVehiculo: string;
  ciudadanoId: string;
  tipoInfraccionId: string;
  fechaInfraccion: string;
  lugarInfraccion: string;
  agenteTransitoId: string;
  observaciones?: string | null;
  evidencias: string[];
  estado: string;
  valorMulta: number;
  gradoInfraccion: number;
  puntosDescuento: number;
}
