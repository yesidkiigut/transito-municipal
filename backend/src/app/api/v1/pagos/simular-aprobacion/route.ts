import { NextRequest, NextResponse } from 'next/server';
import { PrismaTransaccionPagoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaTransaccionPagoRepository';
import { ProcesarConfirmacionPagoUseCase } from '@/application/use-cases/pagos/ProcesarConfirmacionPagoUseCase';

const repo = new PrismaTransaccionPagoRepository();
const confirmarUseCase = new ProcesarConfirmacionPagoUseCase(repo);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenciaPago, cus, codigoTrazabilidad } = body;

    if (!referenciaPago) {
      return NextResponse.json({ error: 'La referencia de pago es requerida' }, { status: 400 });
    }

    const resultado = await confirmarUseCase.execute(referenciaPago, cus, codigoTrazabilidad);
    return NextResponse.json({
      mensaje: '¡Pago aprobado y descargado en el sistema municipal!',
      transaccion: resultado,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al procesar simulación de pago' },
      { status: 500 }
    );
  }
}
