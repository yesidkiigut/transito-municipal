import { z } from 'zod';

export const DireccionSchema = z.object({
  via: z.string().min(1, 'La vía es obligatoria'),
  numero1: z.string().default(''),
  numero2: z.string().default(''),
  barrio: z.string().default(''),
  ciudad: z.string().min(1, 'La ciudad es obligatoria'),
  departamento: z.string().min(1, 'El departamento es obligatorio'),
});

export const RegistrarCiudadanoSchema = z.object({
  tipoDocumento: z.enum(['CC', 'CE', 'PASAPORTE', 'NIT']),
  numeroDocumento: z.string().min(4, 'Número de documento muy corto').max(20),
  nombres: z.string().min(2, 'Los nombres son obligatorios'),
  apellidos: z.string().min(2, 'Los apellidos son obligatorios'),
  fechaNacimiento: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Fecha de nacimiento no válida (ISO format YYYY-MM-DD)',
  }),
  correo: z.string().email('Correo electrónico no válido'),
  telefono: z.string().min(7, 'Número telefónico debe tener al menos 7 dígitos'),
  direccion: DireccionSchema,
  usuarioId: z.string().optional(),
});

export type RegistrarCiudadanoDTO = z.infer<typeof RegistrarCiudadanoSchema>;

export const ActualizarCiudadanoSchema = z.object({
  correo: z.string().email('Correo electrónico no válido'),
  telefono: z.string().min(7),
  direccion: DireccionSchema,
});

export type ActualizarCiudadanoDTO = z.infer<typeof ActualizarCiudadanoSchema>;

export interface CiudadanoResponseDTO {
  id: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  edad: number;
  correo: string;
  telefono: string;
  direccion: string;
  estado: string;
  fechaRegistro: string;
}
