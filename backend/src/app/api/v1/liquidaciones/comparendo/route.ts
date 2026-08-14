import { NextRequest, NextResponse } from 'next/server';
import { PrismaLiquidacionRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaLiquidacionRepository';
import { LiquidarComparendoUseCase } from '@/application/use-cases/liquidacion/LiquidarComparendoUseCase';

const liquidacionRepo = new PrismaLiquidacionRepository();
const liquidarComparendoUseCase = new LiquidarComparendoUseCase(liquidacionRepo);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || searchParams.get('comparendoId') || searchParams.get('numero');
    const fechaCorte = searchParams.get('fechaCorte') || undefined;
    const realizoCurso = searchParams.get('realizoCurso') === 'true' || searchParams.get('curso') === '1';

    if (!id) {
      return NextResponse.json(
        { error: 'Debe especificar el parámetro id o numero de comparendo.' },
        { status: 400 }
      );
    }

    const resultado = await liquidarComparendoUseCase.execute({
      id,
      fechaCorte,
      realizoCurso,
    });

    if (resultado.error) {
      return NextResponse.json({ error: resultado.error }, { status: 404 });
    }

    return NextResponse.json(resultado, { status: 200 });
  } catch (error: any) {
    console.error('Error al liquidar comparendo:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno al liquidar comparendo.' },
      { status: 500 }
    );
  }
}
