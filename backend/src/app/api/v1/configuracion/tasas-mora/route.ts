import { NextRequest, NextResponse } from 'next/server';
import { GestionarTasasMoraUseCase } from '@/application/use-cases/beneficios/GestionarParametrosUseCase';

const useCase = new GestionarTasasMoraUseCase();

export async function GET() {
  try {
    const tasas = await useCase.listarTasas();
    return NextResponse.json({ data: tasas }, { status: 200 });
  } catch (error: any) {
    console.error('Error al listar tasas de mora:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al listar tasas de interés moratorio.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tasa = await useCase.registrarTasa(body);
    return NextResponse.json(tasa, { status: 201 });
  } catch (error: any) {
    console.error('Error al registrar tasa de mora:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al registrar tasa de mora.' },
      { status: 400 }
    );
  }
}
