import { NextRequest, NextResponse } from 'next/server';
import { PrismaLiquidacionRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaLiquidacionRepository';
import { CalcularTramosDescuentoUseCase } from '@/application/use-cases/beneficios/CalcularTramosDescuentoUseCase';

const liquidacionRepo = new PrismaLiquidacionRepository();
const useCase = new CalcularTramosDescuentoUseCase(liquidacionRepo);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipoConcepto = (searchParams.get('tipoConcepto') || searchParams.get('tipo') || 'COMPARENDO') as 'COMPARENDO' | 'IMPUESTO_VEHICULAR';
    const referenciaId = searchParams.get('referenciaId') || searchParams.get('id') || searchParams.get('placa') || searchParams.get('numero');
    const fechaCorte = searchParams.get('fechaCorte') || undefined;
    const realizoCurso = searchParams.get('realizoCurso') === 'true' || searchParams.get('curso') === '1';

    if (!referenciaId) {
      return NextResponse.json(
        { error: 'Debe especificar el parámetro referenciaId o id de la obligación.' },
        { status: 400 }
      );
    }

    const resultado = await useCase.execute({
      tipoConcepto,
      referenciaId,
      fechaCorte,
      realizoCurso,
    });

    if (resultado.error) {
      return NextResponse.json({ error: resultado.error }, { status: 404 });
    }

    return NextResponse.json(resultado, { status: 200 });
  } catch (error: any) {
    console.error('Error al calcular tramos de beneficio:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al calcular tramos de pronto pago y beneficios.' },
      { status: 500 }
    );
  }
}
