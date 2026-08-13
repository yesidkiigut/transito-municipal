import { z } from 'zod';

export const ExpedirLicenciaSchema = z.object({
  ciudadanoId: z.string().min(1, 'El ciudadano es obligatorio'),
  categoria: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'C3']),
  restricciones: z.array(z.string()).optional(),
  organismoExpedidor: z.string().optional(),
});

export type ExpedirLicenciaDTO = z.infer<typeof ExpedirLicenciaSchema>;

export interface LicenciaResponseDTO {
  id: string;
  numeroLicencia: string;
  ciudadanoId: string;
  categoria: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
  estado: string;
  restricciones: string[];
  organismoExpedidor: string;
  puntosAcumulados: number;
}
