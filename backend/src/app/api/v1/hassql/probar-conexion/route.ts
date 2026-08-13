import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/persistence/prisma/client';
import { HassqlIntegrationService } from '@/infrastructure/external/hassql/HassqlIntegrationService';
import { ConfiguracionHassql } from '@/domain/entities/ConfiguracionHassql';

const hassqlService = new HassqlIntegrationService();

export async function POST() {
  try {
    const configRecord = await prisma.configuracionHassql.findFirst({
      where: { activo: true },
    });

    const config = configRecord ? new ConfiguracionHassql({ ...configRecord }) : ConfiguracionHassql.crearDefecto();
    const resultado = await hassqlService.probarConexion(config);

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, latenciaMs: 0, mensaje: `Error de conexión: ${error.message}` },
      { status: 500 }
    );
  }
}
