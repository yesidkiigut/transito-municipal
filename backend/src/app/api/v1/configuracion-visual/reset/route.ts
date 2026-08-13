import { NextResponse } from 'next/server';
import { PrismaConfiguracionVisualRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaConfiguracionVisualRepository';
import { RestablecerConfiguracionVisualUseCase } from '@/application/use-cases/configuracion/RestablecerConfiguracionVisualUseCase';

const repo = new PrismaConfiguracionVisualRepository();
const restablecerUseCase = new RestablecerConfiguracionVisualUseCase(repo);

export async function POST() {
  try {
    const config = await restablecerUseCase.execute();
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al restablecer la configuración visual' },
      { status: 500 }
    );
  }
}
