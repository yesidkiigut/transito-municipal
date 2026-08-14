import { NextRequest, NextResponse } from 'next/server';
import { PrismaLiquidacionRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaLiquidacionRepository';
import { ObtenerEstadoCuentaMensualUseCase } from '@/application/use-cases/liquidacion/ObtenerEstadoCuentaMensualUseCase';

const liquidacionRepo = new PrismaLiquidacionRepository();
const estadoCuentaUseCase = new ObtenerEstadoCuentaMensualUseCase(liquidacionRepo);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ciudadanoId = searchParams.get('ciudadanoId') || searchParams.get('documento') || undefined;
    const placa = searchParams.get('placa') || undefined;
    const meses = searchParams.get('meses') ? parseInt(searchParams.get('meses')!, 10) : 12;

    if (!ciudadanoId && !placa) {
      return NextResponse.json(
        { error: 'Debe especificar un parámetro de consulta: ciudadanoId (o documento) o placa del vehículo.' },
        { status: 400 }
      );
    }

    const resultado = await estadoCuentaUseCase.execute({
      ciudadanoId,
      placa,
      meses,
    });

    return NextResponse.json(resultado, { status: 200 });
  } catch (error: any) {
    console.error('Error al obtener estado de cuenta:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno al consultar el estado de cuenta mensual.' },
      { status: 500 }
    );
  }
}
