import { NextRequest, NextResponse } from 'next/server';
import { LiquidarConceptosCiudadanoUseCase } from '@/application/use-cases/pagos/LiquidarConceptosCiudadanoUseCase';

const liquidarUseCase = new LiquidarConceptosCiudadanoUseCase();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doc = searchParams.get('documento') || searchParams.get('correo') || 'admin@transito.gov.co';

    const resultado = await liquidarUseCase.execute(doc);
    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al liquidar conceptos pendientes' },
      { status: 400 }
    );
  }
}
