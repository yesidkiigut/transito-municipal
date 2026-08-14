import { NextRequest, NextResponse } from 'next/server';
import { PrismaAcuerdoPagoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaAcuerdoPagoRepository';
import { ConsultarAcuerdosCiudadanoUseCase } from '@/application/use-cases/acuerdo/ConsultarAcuerdosCiudadanoUseCase';

const acuerdoPagoRepo = new PrismaAcuerdoPagoRepository();
const consultarAcuerdosUseCase = new ConsultarAcuerdosCiudadanoUseCase(acuerdoPagoRepo);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'El ID o código del acuerdo es obligatorio.' }, { status: 400 });
    }

    const acuerdo = await consultarAcuerdosUseCase.executeById(id);
    return NextResponse.json(acuerdo, { status: 200 });
  } catch (error: any) {
    console.error('Error al consultar acuerdo por ID:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al consultar detalle del acuerdo de pago.' },
      { status: 404 }
    );
  }
}
