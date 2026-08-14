import { prisma } from '@/infrastructure/persistence/prisma/client';
import {
  CrearReglaDescuentoDTO,
  CrearReglaDescuentoSchema,
  GuardarParametroAnualDTO,
  GuardarParametroAnualSchema,
  RegistrarTasaMoraDTO,
  RegistrarTasaMoraSchema,
} from '../../dto/beneficios/BeneficiosDTOs';

export class GestionarReglasDescuentoUseCase {
  public async listarReglas(): Promise<any[]> {
    return prisma.reglaDescuentoLey.findMany({
      orderBy: { porcentajeDescuento: 'desc' },
    });
  }

  public async crearOActualizarRegla(dto: CrearReglaDescuentoDTO): Promise<any> {
    const validated = CrearReglaDescuentoSchema.parse(dto);

    return prisma.reglaDescuentoLey.upsert({
      where: { codigo: validated.codigo },
      update: validated,
      create: validated,
    });
  }

  public async toggleReglaActiva(id: string, activo: boolean): Promise<any> {
    return prisma.reglaDescuentoLey.update({
      where: { id },
      data: { activo },
    });
  }

  public async eliminarRegla(id: string): Promise<any> {
    return prisma.reglaDescuentoLey.delete({
      where: { id },
    });
  }
}

export class GestionarParametrosAnualesUseCase {
  public async listarParametros(): Promise<any[]> {
    return prisma.parametroAnual.findMany({
      orderBy: { vigenciaFiscal: 'desc' },
    });
  }

  public async guardarParametro(dto: GuardarParametroAnualDTO): Promise<any> {
    const validated = GuardarParametroAnualSchema.parse(dto);
    const fechaLimite = new Date(validated.fechaLimiteProntoPago);

    return prisma.parametroAnual.upsert({
      where: { vigenciaFiscal: validated.vigenciaFiscal },
      update: {
        ...validated,
        fechaLimiteProntoPago: fechaLimite,
      },
      create: {
        ...validated,
        fechaLimiteProntoPago: fechaLimite,
      },
    });
  }
}

export class GestionarTasasMoraUseCase {
  public async listarTasas(): Promise<any[]> {
    return prisma.tasaInteresMora.findMany({
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
    });
  }

  public async registrarTasa(dto: RegistrarTasaMoraDTO): Promise<any> {
    const validated = RegistrarTasaMoraSchema.parse(dto);

    return prisma.tasaInteresMora.upsert({
      where: {
        anio_mes: {
          anio: validated.anio,
          mes: validated.mes,
        },
      },
      update: validated,
      create: validated,
    });
  }
}
