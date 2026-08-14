import { NextRequest, NextResponse } from 'next/server';
import { GestionarParametrosAnualesUseCase } from '@/application/use-cases/beneficios/GestionarParametrosUseCase';

const useCase = new GestionarParametrosAnualesUseCase();

export async function GET() {
  try {
    const params = await useCase.listarParametros();
    return NextResponse.json({ data: params }, { status: 200 });
  } catch (error: any) {
    console.error('Error al listar parámetros anuales:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al consultar parámetros anuales.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parametro = await useCase.guardarParametro(body);
    return NextResponse.json(parametro, { status: 200 });
  } catch (error: any) {
    console.error('Error al guardar parámetro anual:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al guardar parámetro anual.' },
      { status: 400 }
    );
  }
}
