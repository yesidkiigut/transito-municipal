import { NextRequest, NextResponse } from 'next/server';
import { PrismaLiquidacionRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaLiquidacionRepository';
import { LiquidarImpuestoVehicularUseCase } from '@/application/use-cases/liquidacion/LiquidarImpuestoVehicularUseCase';

const liquidacionRepo = new PrismaLiquidacionRepository();
const liquidarImpuestoUseCase = new LiquidarImpuestoVehicularUseCase(liquidacionRepo);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placa = searchParams.get('placa');
    const vigencia = searchParams.get('vigencia') ? parseInt(searchParams.get('vigencia')!, 10) : 2026;
    const fechaCorte = searchParams.get('fechaCorte') || undefined;
    const aplicaTraslado = searchParams.get('aplicaTraslado') === 'true' || searchParams.get('traslado') === '1';

    if (!placa) {
      return NextResponse.json(
        { error: 'Debe especificar el parámetro placa del vehículo.' },
        { status: 400 }
      );
    }

    const resultado = await liquidarImpuestoUseCase.execute({
      placa,
      vigencia,
      fechaCorte,
      aplicaTraslado,
    });

    if (resultado.error) {
      return NextResponse.json({ error: resultado.error }, { status: 404 });
    }

    return NextResponse.json(resultado, { status: 200 });
  } catch (error: any) {
    console.error('Error al liquidar impuesto vehicular:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno al liquidar impuesto vehicular.' },
      { status: 500 }
    );
  }
}
