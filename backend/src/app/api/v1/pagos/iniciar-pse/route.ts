import { NextRequest, NextResponse } from 'next/server';
import { PrismaTransaccionPagoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaTransaccionPagoRepository';
import { IniciarPagoPSEUseCase } from '@/application/use-cases/pagos/IniciarPagoPSEUseCase';
import { IniciarPagoPSESchema } from '@/application/dto/pagos/PagoDTOs';

const repo = new PrismaTransaccionPagoRepository();
const iniciarPseUseCase = new IniciarPagoPSEUseCase(repo);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validacion = IniciarPagoPSESchema.safeParse(body);

    if (!validacion.success) {
      return NextResponse.json(
        { error: 'Datos de pago PSE inválidos', detalles: validacion.error.format() },
        { status: 400 }
      );
    }

    const resultado = await iniciarPseUseCase.execute(validacion.data);
    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al iniciar transacción PSE' },
      { status: 500 }
    );
  }
}
