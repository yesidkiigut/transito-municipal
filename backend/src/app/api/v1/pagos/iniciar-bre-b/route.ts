import { NextRequest, NextResponse } from 'next/server';
import { PrismaTransaccionPagoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaTransaccionPagoRepository';
import { IniciarPagoBreBUseCase } from '@/application/use-cases/pagos/IniciarPagoBreBUseCase';
import { IniciarPagoBreBSchema } from '@/application/dto/pagos/PagoDTOs';

const repo = new PrismaTransaccionPagoRepository();
const iniciarBreBUseCase = new IniciarPagoBreBUseCase(repo);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validacion = IniciarPagoBreBSchema.safeParse(body);

    if (!validacion.success) {
      return NextResponse.json(
        { error: 'Datos de pago Bre-B inválidos', detalles: validacion.error.format() },
        { status: 400 }
      );
    }

    const resultado = await iniciarBreBUseCase.execute(validacion.data);
    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al iniciar transacción Bre-B' },
      { status: 500 }
    );
  }
}
