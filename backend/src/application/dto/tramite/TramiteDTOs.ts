import { z } from 'zod';

export const RadicarTramiteSchema = z.object({
  tipoTramiteId: z.string().min(1, 'El tipo de trámite es obligatorio'),
  ciudadanoSolicitanteId: z.string().min(1, 'El ciudadano es obligatorio'),
  vehiculoId: z.string().optional(),
  licenciaId: z.string().optional(),
  observaciones: z.string().optional(),
});

export type RadicarTramiteDTO = z.infer<typeof RadicarTramiteSchema>;

export const AvanzarTramiteSchema = z.object({
  nuevoEstado: z.enum([
    'RADICADO',
    'EN_REVISION',
    'EN_ESPERA_DOC',
    'APROBADO',
    'RECHAZADO',
    'FINALIZADO',
    'CANCELADO',
  ]),
  funcionarioId: z.string().min(1, 'El funcionario es obligatorio'),
  observacion: z.string().optional(),
  pasoNombre: z.string().optional(),
});

export type AvanzarTramiteDTO = z.infer<typeof AvanzarTramiteSchema>;

export interface TramiteResponseDTO {
  id: string;
  codigoTramite: string;
  tipoTramiteId: string;
  ciudadanoSolicitanteId: string;
  vehiculoId?: string | null;
  licenciaId?: string | null;
  estado: string;
  observaciones?: string | null;
  fechaRadicado: string;
  fechaResolucion?: string | null;
  funcionarioAsignadoId?: string | null;
  historial: any[];
}
