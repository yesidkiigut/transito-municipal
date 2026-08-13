import { z } from 'zod';

export const RegistrarVehiculoSchema = z.object({
  placa: z.string().min(5).max(7).regex(/^[A-Z0-9-]+$/i, 'Formato de placa inválido'),
  marca: z.string().min(2),
  linea: z.string().min(1),
  modelo: z.number().int().min(1950).max(2030),
  cilindraje: z.number().int().positive(),
  color: z.string().min(2),
  tipoVehiculo: z.enum(['AUTOMOVIL', 'MOTOCICLETA', 'CAMION', 'BUS', 'BUSETA', 'MICROBUS', 'TRACTOCAMION']),
  claseServicio: z.enum(['PARTICULAR', 'PUBLICO', 'DIPLOMATICO', 'OFICIAL']),
  numeroMotor: z.string().min(4),
  numeroChasis: z.string().min(4),
  fechaMatricula: z.string().refine((val) => !isNaN(Date.parse(val))),
  propietarioInicialCiudadanoId: z.string().min(1, 'El ciudadano propietario inicial es obligatorio'),
});

export type RegistrarVehiculoDTO = z.infer<typeof RegistrarVehiculoSchema>;

export const TransferirVehiculoSchema = z.object({
  nuevoPropietarioCiudadanoId: z.string().min(1, 'El nuevo propietario es obligatorio'),
  observaciones: z.string().optional(),
});

export type TransferirVehiculoDTO = z.infer<typeof TransferirVehiculoSchema>;

export interface VehiculoResponseDTO {
  id: string;
  placa: string;
  marca: string;
  linea: string;
  modelo: number;
  cilindraje: number;
  color: string;
  tipoVehiculo: string;
  claseServicio: string;
  numeroMotor: string;
  numeroChasis: string;
  fechaMatricula: string;
  estado: string;
  propietarioActualId?: string;
}
