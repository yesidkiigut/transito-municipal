import { NextRequest, NextResponse } from 'next/server';
import { PrismaConfiguracionVisualRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaConfiguracionVisualRepository';
import { ObtenerConfiguracionVisualUseCase } from '@/application/use-cases/configuracion/ObtenerConfiguracionVisualUseCase';
import { GuardarConfiguracionVisualUseCase } from '@/application/use-cases/configuracion/GuardarConfiguracionVisualUseCase';
import { GuardarConfiguracionVisualSchema } from '@/application/dto/configuracion/ConfiguracionVisualDTOs';

const repo = new PrismaConfiguracionVisualRepository();
const obtenerUseCase = new ObtenerConfiguracionVisualUseCase(repo);
const guardarUseCase = new GuardarConfiguracionVisualUseCase(repo);

export async function GET() {
  try {
    const config = await obtenerUseCase.execute();
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener la configuración visual institucional' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validacion = GuardarConfiguracionVisualSchema.safeParse(body);

    if (!validacion.success) {
      return NextResponse.json(
        { error: 'Datos de personalización visual inválidos', detalles: validacion.error.format() },
        { status: 400 }
      );
    }

    const resultado = await guardarUseCase.execute(validacion.data);
    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al guardar la configuración visual' },
      { status: 500 }
    );
  }
}
