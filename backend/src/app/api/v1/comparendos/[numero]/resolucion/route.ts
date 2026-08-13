import { NextResponse } from 'next/server';
import { PrismaComparendoRepository } from '@/infrastructure/persistence/prisma/repositories/PrismaComparendoRepository';
import { ResolucionarComparendoUseCase } from '@/application/use-cases/comparendo/ResolucionarComparendoUseCase';
import { ComparendoMapper } from '@/application/mappers/ComparendoMapper';
import { ComparendoNoEncontradoException, ComparendoYaResolucionadoException } from '@/domain/exceptions/ComparendoExceptions';

const comparendoRepo = new PrismaComparendoRepository();

export async function POST(request: Request, { params }: { params: { numero: string } }) {
  try {
    const body = await request.json();
    const useCase = new ResolucionarComparendoUseCase(comparendoRepo);
    const actualizado = await useCase.execute(params.numero, body);

    return NextResponse.json(ComparendoMapper.toDTO(actualizado));
  } catch (error: any) {
    if (error instanceof ComparendoYaResolucionadoException) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof ComparendoNoEncontradoException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error?.message || 'Error al resolucionar comparendo' }, { status: 400 });
  }
}
