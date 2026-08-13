import { NextResponse } from 'next/server';
import { PrismaComparendoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaComparendoRepository';
import { ConsultarComparendoUseCase } from '@/application/use-cases/comparendo/ConsultarComparendoUseCase';
import { ComparendoMapper } from '@/application/mappers/ComparendoMapper';
import { ComparendoNoEncontradoException } from '@/domain/exceptions/ComparendoExceptions';

const comparendoRepo = new PrismaComparendoRepository();

export async function GET(request: Request, { params }: { params: { numero: string } }) {
  try {
    const useCase = new ConsultarComparendoUseCase(comparendoRepo);
    const comparendo = await useCase.execute(params.numero);
    return NextResponse.json(ComparendoMapper.toDTO(comparendo));
  } catch (error: any) {
    if (error instanceof ComparendoNoEncontradoException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error?.message || 'Error al obtener comparendo' }, { status: 500 });
  }
}
