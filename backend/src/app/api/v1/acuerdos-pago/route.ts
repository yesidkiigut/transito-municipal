import { NextRequest, NextResponse } from 'next/server';
import { PrismaLiquidacionRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaLiquidacionRepository';
import { PrismaAcuerdoPagoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaAcuerdoPagoRepository';
import { CrearAcuerdoPagoUseCase } from '@/application/use-cases/acuerdo/CrearAcuerdoPagoUseCase';
import { ConsultarAcuerdosCiudadanoUseCase } from '@/application/use-cases/acuerdo/ConsultarAcuerdosCiudadanoUseCase';

const liquidacionRepo = new PrismaLiquidacionRepository();
const acuerdoPagoRepo = new PrismaAcuerdoPagoRepository();

const crearAcuerdoUseCase = new CrearAcuerdoPagoUseCase(liquidacionRepo);
const consultarAcuerdosUseCase = new ConsultarAcuerdosCiudadanoUseCase(acuerdoPagoRepo);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const resultado = await crearAcuerdoUseCase.execute(body);

    return NextResponse.json(resultado, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear acuerdo de pago:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al formalizar el acuerdo de pago transaccional.' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ciudadanoId = searchParams.get('ciudadanoId');
    const placa = searchParams.get('placa');
    const estado = searchParams.get('estado') || undefined;
    const pagina = searchParams.get('pagina') ? parseInt(searchParams.get('pagina')!, 10) : 1;
    const limite = searchParams.get('limite') ? parseInt(searchParams.get('limite')!, 10) : 10;

    if (ciudadanoId) {
      const acuerdos = await consultarAcuerdosUseCase.executeByCiudadano(ciudadanoId);
      return NextResponse.json({ data: acuerdos }, { status: 200 });
    }

    if (placa) {
      const acuerdos = await consultarAcuerdosUseCase.executeByPlaca(placa);
      return NextResponse.json({ data: acuerdos }, { status: 200 });
    }

    const resultado = await consultarAcuerdosUseCase.executeList({ estado, pagina, limite });
    return NextResponse.json(resultado, { status: 200 });
  } catch (error: any) {
    console.error('Error al consultar acuerdos de pago:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno al consultar acuerdos de pago.' },
      { status: 500 }
    );
  }
}
