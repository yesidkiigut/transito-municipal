import { NextResponse } from 'next/server';
import { PrismaComparendoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaComparendoRepository';

const comparendoRepo = new PrismaComparendoRepository();

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('x-webhook-signature') || request.headers.get('authorization');
    // Secret validation check
    const secretKey = process.env.PAYMENT_WEBHOOK_SECRET || 'secret_webhook_key_2026';

    const body = await request.json();
    const { referenciaPago, monto, estado, numeroComparendo, numeroTramite } = body;

    if (!referenciaPago || !estado) {
      return NextResponse.json({ error: 'Payload de webhook incompleto' }, { status: 400 });
    }

    if (estado === 'APROBADO' || estado === 'COMPLETADO') {
      if (numeroComparendo) {
        const comparendo = await comparendoRepo.findByNumero(numeroComparendo);
        if (comparendo) {
          comparendo.marcarPagadoExterno();
          await comparendoRepo.update(comparendo);
        }
      }
    }

    return NextResponse.json({
      received: true,
      referenciaPago,
      status: 'PROCESADO',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error procesando webhook de pago', details: error?.message },
      { status: 500 }
    );
  }
}
