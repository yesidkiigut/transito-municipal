import { z } from 'zod';

export const ReservarCitaSchema = z.object({
  ciudadanoId: z.string().min(1, 'El ciudadano es obligatorio'),
  tipoTramiteId: z.string().min(1, 'El tipo de trámite es obligatorio'),
  puestoAtencionId: z.string().min(1, 'El puesto de atención es obligatorio'),
  fechaCita: z.string().refine((val) => !isNaN(Date.parse(val))),
  horaInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM válido'),
  horaFin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM válido'),
});

export type ReservarCitaDTO = z.infer<typeof ReservarCitaSchema>;

export interface CitaResponseDTO {
  id: string;
  codigoCita: string;
  ciudadanoId: string;
  tipoTramiteId: string;
  puestoAtencionId: string;
  fechaCita: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
}
