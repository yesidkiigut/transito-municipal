import { NextRequest, NextResponse } from 'next/server';
import { PrismaLiquidacionRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaLiquidacionRepository';
import { SimularAcuerdoPagoUseCase } from '@/application/use-cases/acuerdo/SimularAcuerdoPagoUseCase';

const liquidacionRepo = new PrismaLiquidacionRepository();
const simularAcuerdoUseCase = new SimularAcuerdoPagoUseCase(liquidacionRepo);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const resultado = await simularAcuerdoUseCase.execute(body);

    return NextResponse.json(resultado, { status: 200 });
  } catch (error: any) {
    console.error('Error al simular acuerdo de pago:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al generar la simulación de cuotas de amortización.' },
      { status: 400 }
    );
  }
}
