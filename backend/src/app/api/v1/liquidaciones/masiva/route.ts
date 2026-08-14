import { NextRequest, NextResponse } from 'next/server';
import { PrismaLiquidacionRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaLiquidacionRepository';

const liquidacionRepo = new PrismaLiquidacionRepository();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const vigencia = body.vigenciaFiscal || body.vigencia || 2026;
    const fechaCorte = body.fechaCorte ? new Date(body.fechaCorte) : new Date();

    const resultado = await liquidacionRepo.ejecutarLiquidacionMasiva(vigencia, fechaCorte);

    if (resultado.error) {
      return NextResponse.json({ error: resultado.error }, { status: 400 });
    }

    return NextResponse.json(resultado, { status: 200 });
  } catch (error: any) {
    console.error('Error al ejecutar liquidación masiva:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno al ejecutar liquidación masiva del parque automotor.' },
      { status: 500 }
    );
  }
}
